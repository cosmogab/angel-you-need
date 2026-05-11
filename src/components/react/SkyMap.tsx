import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import AngelSystem from './AngelSystem';
import DecorDebugOverlay from './DecorDebugOverlay';
import DecorErrorBoundary from './DecorErrorBoundary';
import IslandMarker from './IslandMarker';
import IntroCloud from './IntroCloud';
import MiniMap from './MiniMap';
import SpeedLines from './SpeedLines';
import WorldSky from './WorldSky';
import sceneData from '../../../references/scene_data.json';
import { DEBUG_DECOR, type SceneData } from './decor-types';

// PIXI canvas is heavy (~160 KB gz); lazy-load so first paint is unblocked.
// While it loads, the sky gradient + markers + Gabo are already on screen,
// the decor strata simply pop in once the bundle resolves. The error
// boundary keeps a PIXI failure from taking the rest of the SkyMap down
// with it.
const DecorCanvas = lazy(() => import('./DecorCanvas'));

// Mountain back-stratum dropped from the active scene: 14 of the largest
// items, redundant with mountains_front / mountains_foreground for depth,
// and the dominant cost driver on lower-end GPUs.
const SCENE = sceneData as SceneData;
const DECOR_LAYERS = SCENE.layers.filter((l) => l.id !== 'mountains_back');

// InteriorScene is only needed when the user opens an island. Lazy-loading
// it keeps the initial sky-map bundle smaller — first-open triggers a
// one-time fetch then it's cached.
const InteriorScene = lazy(() => import('./InteriorScene'));
import {
  type SkyProject,
  type Vec2,
  type Viewport,
  SKY_CENTER,
  WORLD_H,
  WORLD_W,
} from './sky-types';
import { useAngelState } from '~/lib/angel-state';
import { useFlyTo } from '~/lib/use-fly-to';

const KEY_PAN_STEP = 64;
/** Initial seek speed (world units/sec) when Gabo starts tracking a held pointer. */
const SEEK_SPEED_BASE = 700;
/** Peak seek speed reached after SEEK_RAMP_DURATION of sustained seek. */
const SEEK_SPEED_MAX = 2100;
/** Seconds of held seek to ramp from BASE to MAX. Linear interp. Resets on release. */
const SEEK_RAMP_DURATION = 3;
/** Distance below which Gabo is "at" the target — stops the motion visuals. */
const SEEK_ARRIVED_DIST = 2;

interface Props {
  projects: SkyProject[];
}

export default function SkyMap({ projects }: Props) {
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Vec2>(SKY_CENTER);
  // Mirror of `camera` for the PIXI decor canvas: it reads from this ref
  // every frame so DecorCanvas can be memoized and skip per-frame React
  // reconciliation of ~160 sprites during seek/flight.
  const cameraRef = useRef<Vec2>(SKY_CENTER);
  cameraRef.current = camera;
  const [viewport, setViewport] = useState<Viewport>(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  const [angelPosition, setAngelPosition] = useState<Vec2>(SKY_CENTER);
  const [streakAngleDeg, setStreakAngleDeg] = useState(0);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [overlayOrigin, setOverlayOrigin] = useState<Vec2>({ x: 0, y: 0 });
  const {
    state: angelState,
    mischief,
    setState: setAngelState,
    startMischief,
  } = useAngelState('idle-home');
  const [hintVisible, setHintVisible] = useState(true);

  // --- Press-and-hold seek ------------------------------------------------
  // Pointerdown on the sky starts a continuous seek: Gabo moves toward the
  // held pointer each frame. Moving the pointer updates the target. Releasing
  // stops the motion. `heldFor` accumulates seconds of sustained seek and
  // drives a linear speed ramp from BASE to MAX (precise placement at first,
  // brisk traversal of the wide world after a few seconds).
  // pointerScreen is the held cursor position in viewport-local pixels; the
  // rAF loop projects it through the current camera each frame so a stationary
  // cursor still pulls Gabo as the camera follows him.
  const seekStateRef = useRef({
    active: false,
    pointerScreen: { x: 0, y: 0 } as Vec2,
    pointerId: -1,
    rafId: 0,
    lastTime: 0,
    heldFor: 0,
  });
  // Mirror of angelPosition for synchronous reads inside the rAF loop. The
  // effect below keeps it synced when React updates the state from elsewhere
  // (flyTo, snapToProject, popstate).
  const angelPosRef = useRef<Vec2>(SKY_CENTER);

  // --- Viewport measurement ------------------------------------------------
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setViewport({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // --- Camera clamping -----------------------------------------------------
  const clampCamera = useCallback(
    (x: number, y: number): Vec2 => {
      const halfW = viewport.w / 2;
      const halfH = viewport.h / 2;
      const minX = halfW >= WORLD_W / 2 ? WORLD_W / 2 : halfW;
      const maxX = halfW >= WORLD_W / 2 ? WORLD_W / 2 : WORLD_W - halfW;
      const minY = halfH >= WORLD_H / 2 ? WORLD_H / 2 : halfH;
      const maxY = halfH >= WORLD_H / 2 ? WORLD_H / 2 : WORLD_H - halfH;
      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      };
    },
    [viewport.w, viewport.h]
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setCamera((c) => clampCamera(c.x + dx, c.y + dy));
    },
    [clampCamera]
  );

  const clampWorld = useCallback((p: Vec2): Vec2 => {
    return {
      x: Math.min(WORLD_W, Math.max(0, p.x)),
      y: Math.min(WORLD_H, Math.max(0, p.y)),
    };
  }, []);

  useEffect(() => {
    setCamera((c) => clampCamera(c.x, c.y));
  }, [clampCamera]);

  // --- Flight orchestration -----------------------------------------------
  const { flyTo, kill: killFlight } = useFlyTo({
    onPositionChange: (pos) => {
      setAngelPosition(pos);
      setCamera(clampCamera(pos.x, pos.y));
    },
    onStateChange: setAngelState,
  });

  const setStreakAngleFor = useCallback((from: Vec2, to: Vec2) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.hypot(dx, dy) < 2) return;
    setStreakAngleDeg((Math.atan2(dy, dx) * 180) / Math.PI);
  }, []);

  // --- Overlay helpers -----------------------------------------------------
  const pushProjectUrl = (slug: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === `/projects/${slug}`) return;
    window.history.pushState({ slug }, '', `/projects/${slug}`);
  };

  const pushHomeUrl = () => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/') return;
    window.history.pushState({}, '', '/');
  };

  const openOverlayAtViewportCenter = useCallback(
    (slug: string) => {
      setOverlayOrigin({ x: viewport.w / 2, y: viewport.h / 2 });
      setOpenProject(slug);
    },
    [viewport.w, viewport.h]
  );

  const closeOverlay = useCallback(() => {
    const slug = openProject;
    setOpenProject(null);
    pushHomeUrl();
    setAngelState('idle-home');

    // Restore keyboard focus to the island button that opened the scene.
    if (slug) {
      window.setTimeout(() => {
        const btn = document.querySelector<HTMLButtonElement>(
          `button[data-island-slug="${slug}"]`
        );
        btn?.focus();
      }, 0);
    }
  }, [openProject, setAngelState]);

  // Snap to a project's visual state without flight — used for popstate /
  // nav-while-overlay-open where animating feels wrong.
  const snapToProject = useCallback(
    (project: SkyProject) => {
      setAngelPosition(project.position);
      setCamera(clampCamera(project.position.x, project.position.y));
    },
    [clampCamera]
  );

  const flyToIsland = useCallback(
    (slug: string) => {
      const project = projects.find((p) => p.id === slug);
      if (!project) return;

      // If an overlay is already open, snap-switch (no flight under the overlay).
      if (openProject) {
        snapToProject(project);
        pushProjectUrl(slug);
        setOpenProject(slug);
        setOverlayOrigin({ x: viewport.w / 2, y: viewport.h / 2 });
        return;
      }

      setStreakAngleFor(angelPosition, project.position);

      flyTo(angelPosition, project.position, {
        slug,
        onArrive: () => {
          setCamera(clampCamera(project.position.x, project.position.y));
          pushProjectUrl(slug);
          openOverlayAtViewportCenter(slug);
        },
      });
    },
    [
      angelPosition,
      clampCamera,
      flyTo,
      openOverlayAtViewportCenter,
      openProject,
      projects,
      setStreakAngleFor,
      snapToProject,
      viewport.w,
      viewport.h,
    ]
  );

  const flyToPoint = useCallback(
    (point: Vec2) => {
      // Empty-sky click while overlay is open — close the overlay instead.
      if (openProject) {
        closeOverlay();
        return;
      }
      const target = clampWorld(point);
      setStreakAngleFor(angelPosition, target);
      flyTo(angelPosition, target, { slug: null });
    },
    [
      angelPosition,
      clampWorld,
      closeOverlay,
      flyTo,
      openProject,
      setStreakAngleFor,
    ]
  );

  // --- popstate: sync overlay/project/sky with browser URL ---------------
  useEffect(() => {
    const handler = () => {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/projects\/([^/]+)\/?$/);
      if (match) {
        const slug = match[1];
        if (typeof slug !== 'string') return;
        const project = projects.find((p) => p.id === slug);
        if (!project) return;
        snapToProject(project);
        setOverlayOrigin({ x: viewport.w / 2, y: viewport.h / 2 });
        setOpenProject(slug);
      } else {
        setOpenProject(null);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [projects, snapToProject, viewport.w, viewport.h]);

  // Keep the position ref synced with state so the rAF loop can read
  // current position without stale closures.
  useEffect(() => {
    angelPosRef.current = angelPosition;
  }, [angelPosition]);

  const seekFrame = useCallback(
    (now: number) => {
      const s = seekStateRef.current;
      if (!s.active) return;
      const dt = s.lastTime === 0 ? 0 : (now - s.lastTime) / 1000;
      s.lastTime = now;
      s.heldFor += dt;

      const p = angelPosRef.current;
      // Re-project the held cursor through the current camera each frame.
      // The camera tracks Gabo, so a stationary cursor describes a moving
      // world target — that's what keeps him flying when the mouse is held still.
      const vpRect = viewportRef.current?.getBoundingClientRect();
      const vpW = vpRect?.width ?? viewport.w;
      const vpH = vpRect?.height ?? viewport.h;
      const cam = clampCamera(p.x, p.y);
      const target = clampWorld({
        x: s.pointerScreen.x - vpW / 2 + cam.x,
        y: s.pointerScreen.y - vpH / 2 + cam.y,
      });
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < SEEK_ARRIVED_DIST) {
        // Arrived — drop visuals but keep looping so target updates resume motion.
        setAngelState('idle-home');
      } else {
        setAngelState('traveling');
        const ramp = Math.min(1, s.heldFor / SEEK_RAMP_DURATION);
        const speed = SEEK_SPEED_BASE + (SEEK_SPEED_MAX - SEEK_SPEED_BASE) * ramp;
        const step = Math.min(speed * dt, dist);
        const nx = p.x + (dx / dist) * step;
        const ny = p.y + (dy / dist) * step;
        angelPosRef.current = { x: nx, y: ny };
        setAngelPosition({ x: nx, y: ny });
        setCamera(clampCamera(nx, ny));
        setStreakAngleDeg((Math.atan2(dy, dx) * 180) / Math.PI);
      }
      s.rafId = requestAnimationFrame(seekFrame);
    },
    [clampCamera, clampWorld, setAngelState, viewport.w, viewport.h]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (openProject) return; // Overlay is modal — no sky interaction.
    const target = e.target as HTMLElement;
    // Let island buttons and the mini-map handle their own click lifecycle.
    if (target.closest('[data-sky-interactive]')) return;
    if (target.closest('.mini-map')) return;

    // Cancel any in-flight GSAP tween so the seek takes over.
    if (angelState === 'traveling' || angelState === 'arriving') {
      killFlight();
    }

    const vpRect = viewportRef.current?.getBoundingClientRect();
    if (!vpRect) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const s = seekStateRef.current;
    s.active = true;
    s.pointerScreen = {
      x: e.clientX - vpRect.left,
      y: e.clientY - vpRect.top,
    };
    s.pointerId = e.pointerId;
    s.lastTime = 0;
    s.heldFor = 0;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.rafId = requestAnimationFrame(seekFrame);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = seekStateRef.current;
    if (!s.active || e.pointerId !== s.pointerId) return;
    const vpRect = viewportRef.current?.getBoundingClientRect();
    if (!vpRect) return;
    s.pointerScreen = {
      x: e.clientX - vpRect.left,
      y: e.clientY - vpRect.top,
    };
  };

  const endSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = seekStateRef.current;
    if (!s.active || e.pointerId !== s.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    s.active = false;
    s.heldFor = 0;
    if (s.rafId) {
      cancelAnimationFrame(s.rafId);
      s.rafId = 0;
    }
    setAngelState('idle-home');
  };

  // --- Wheel pan -----------------------------------------------------------
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (openProject) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('.mini-map') || t?.closest('.site-nav')) return;
      e.preventDefault();
      if (angelState === 'traveling') {
        killFlight();
        setAngelState('idle-home');
      }
      setCamera((c) => clampCamera(c.x + e.deltaX, c.y + e.deltaY));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [angelState, clampCamera, killFlight, openProject, setAngelState]);

  // --- Keyboard arrows -----------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (openProject) return;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || active?.isContentEditable) return;
      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case 'ArrowUp':
          dy = -KEY_PAN_STEP;
          break;
        case 'ArrowDown':
          dy = KEY_PAN_STEP;
          break;
        case 'ArrowLeft':
          dx = -KEY_PAN_STEP;
          break;
        case 'ArrowRight':
          dx = KEY_PAN_STEP;
          break;
        default:
          return;
      }
      e.preventDefault();
      panBy(dx, dy);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openProject, panBy]);

  // --- Nav dropdown → fly-to-island (or snap if overlay open) ------------
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const link = t?.closest('a[data-island-slug]') as HTMLAnchorElement | null;
      if (!link) return;
      const slug = link.dataset.islandSlug;
      if (!slug) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      flyToIsland(slug);
      const details = link.closest('details');
      if (details) details.open = false;
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [flyToIsland]);

  const onIslandOpen = (slug: string) => {
    flyToIsland(slug);
  };

  // --- Welcome wave on first mount ----------------------------------------
  // Gabo greets the visitor: auto-triggers the `wave` mischief animation.
  useEffect(() => {
    startMischief('wave');
  }, [startMischief]);

  // --- Hint lifecycle: fade after 4s of inactivity or first interaction ---
  useEffect(() => {
    if (!hintVisible) return;
    const hide = () => setHintVisible(false);
    const timer = window.setTimeout(hide, 4000);
    const opts = { once: true } as const;
    window.addEventListener('pointerdown', hide, opts);
    window.addEventListener('keydown', hide, opts);
    window.addEventListener('wheel', hide, opts);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', hide);
      window.removeEventListener('keydown', hide);
      window.removeEventListener('wheel', hide);
    };
  }, [hintVisible]);

  // --- Cleanup any live seek rAF on unmount -------------------------------
  useEffect(() => {
    return () => {
      const s = seekStateRef.current;
      if (s.rafId) cancelAnimationFrame(s.rafId);
      s.active = false;
    };
  }, []);

  const tx = viewport.w / 2 - camera.x;
  const ty = viewport.h / 2 - camera.y;

  const overlayProject = openProject
    ? projects.find((p) => p.id === openProject) ?? null
    : null;

  return (
    <div
      ref={viewportRef}
      className="sky-map"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endSeek}
      onPointerCancel={endSeek}
      role="application"
      aria-label="Sky map. Press and hold anywhere to send Gabo flying in that direction. Tab through the project islands to explore by keyboard."
    >
      <div
        className="sky-map__sky"
        style={{
          transform: `translate3d(${tx}px, ${ty}px, 0)`,
          width: `${WORLD_W}px`,
          height: `${WORLD_H}px`,
        }}
      >
        <WorldSky />
      </div>
      <div className="sky-map__decor">
        <DecorErrorBoundary>
          <Suspense fallback={null}>
            <DecorCanvas
              layers={DECOR_LAYERS}
              cameraRef={cameraRef}
              viewport={viewport}
            />
          </Suspense>
        </DecorErrorBoundary>
      </div>
      <div
        className="sky-map__world"
        style={{
          transform: `translate3d(${tx}px, ${ty}px, 0)`,
          width: `${WORLD_W}px`,
          height: `${WORLD_H}px`,
        }}
      >
        <IntroCloud hintVisible={hintVisible} />
        {sortedProjects.map((p) => (
          <IslandMarker key={p.id} project={p} onOpen={onIslandOpen} />
        ))}
        <AngelSystem
          position={angelPosition}
          state={angelState}
          mischief={mischief}
          flightAngleDeg={streakAngleDeg}
        />
      </div>
      <SpeedLines active={angelState === 'traveling'} angleDeg={streakAngleDeg} />
      {DEBUG_DECOR && (
        <DecorDebugOverlay
          layers={DECOR_LAYERS}
          camera={camera}
          viewport={viewport}
        />
      )}
      <MiniMap
        projects={sortedProjects}
        camera={camera}
        viewport={viewport}
        home={SKY_CENTER}
        onRecenter={(pos) => flyToPoint(pos)}
      />
      {overlayProject && (
        <Suspense fallback={null}>
          <InteriorScene
            key={overlayProject.id}
            project={overlayProject}
            origin={overlayOrigin}
            onClose={closeOverlay}
          />
        </Suspense>
      )}
    </div>
  );
}
