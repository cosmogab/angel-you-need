import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, registerGsap } from '~/lib/gsap';
import Cumul from '~/components/svg/gabo/Cumul';
import type { SkyProject, Vec2 } from './sky-types';

interface Props {
  project: SkyProject;
  /** Screen-coord origin for the expand/shrink animation (cloud's screen pos). */
  origin: Vec2;
  onClose: () => void;
}

/**
 * Immersive project scene. Opens with a clip-path expand from the clicked
 * cloud's screen position, reveals content, and reverses on close. Sky
 * colors are handled by SkyMap's tweenSkyColors — this component just
 * renders the themed content layer.
 */
export default function InteriorScene({ project, origin, onClose }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = rootRef.current;
    if (!el) return;

    const startClip = `circle(80px at ${origin.x}px ${origin.y}px)`;
    const endClip = `circle(150% at ${origin.x}px ${origin.y}px)`;

    if (prefersReducedMotion()) {
      el.style.clipPath = endClip;
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { clipPath: startClip, opacity: 0.9 },
      {
        clipPath: endClip,
        opacity: 1,
        duration: 1.1,
        ease: 'power3.out',
      }
    );
    tl.from(
      el.querySelectorAll('.scene-content > *'),
      {
        opacity: 0,
        y: 18,
        stagger: 0.07,
        duration: 0.5,
        ease: 'power2.out',
      },
      '-=0.5'
    );
    return () => {
      tl.kill();
    };
  }, [origin.x, origin.y]);

  useEffect(() => {
    const handleClose = () => {
      const el = rootRef.current;
      if (!el || prefersReducedMotion()) {
        onClose();
        return;
      }
      gsap.to(el, {
        clipPath: `circle(80px at ${origin.x}px ${origin.y}px)`,
        opacity: 0.9,
        duration: 0.55,
        ease: 'power3.in',
        onComplete: onClose,
      });
    };
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [origin.x, origin.y, onClose]);

  return (
    <section
      ref={rootRef}
      className="interior-scene"
      data-sky={project.sky.theme}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`scene-title-${project.id}`}
      style={{ clipPath: `circle(80px at ${origin.x}px ${origin.y}px)` }}
    >
      <aside className="interior-scene__corner" aria-hidden="true">
        <div className="interior-scene__corner-cumul">
          <Cumul state="parked" />
        </div>
      </aside>

      <article className="scene-content">
        <header className="scene-header">
          <p className="ink-eyebrow">{project.category}</p>
          <h1 id={`scene-title-${project.id}`} className="ink-title">
            {project.title}
          </h1>
          <ul className="scene-meta-tags" aria-label="Project metadata">
            <li><span className="ink-tag">{project.period}</span></li>
            <li><span className="ink-tag">{project.role}</span></li>
            <li><span className="ink-tag">{project.team}</span></li>
            <li><span className="ink-tag">{project.status}</span></li>
          </ul>
        </header>

        <section className="ink-card">
          <h2 className="ink-card__title">The context</h2>
          <p className="ink-card__body">{project.context}</p>
        </section>

        <section className="ink-card">
          <h2 className="ink-card__title">My role</h2>
          <p className="ink-card__body">{project.myRole}</p>
        </section>

        <section className="ink-card">
          <h2 className="ink-card__title">What I built</h2>
          <ul className="ink-card__list">
            {project.whatIBuilt.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ink-card">
          <h2 className="ink-card__title">Tech stack</h2>
          <ul className="ink-chip-grid">
            {project.stack.map((slug) => (
              <li key={slug}>
                <span className="ink-chip ink-chip--with-icon">
                  <img
                    src={`https://api.iconify.design/simple-icons/${slug}.svg?color=%231A1613`}
                    alt=""
                    width="16"
                    height="16"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {slug}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="scene-impact">
          <h2 className="ink-card__title scene-impact__title">Impact</h2>
          <ul className="ink-stat-grid">
            {project.impactStats.map((stat, i) => (
              <li key={i} className="ink-stat-card">
                <p className="ink-stat-label">{stat.label}</p>
                <p className="ink-stat">{stat.value}</p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
}
