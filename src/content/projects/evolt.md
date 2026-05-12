---
title: Evolt
category: SaaS for Enterprise
period: Jan 2019 – Dec 2022
role: Lead Full-Stack Developer
team: 4–5 developers (led)
status: Shipped
sky:
  theme: evolt
  description: clear corporate blue
  base: '#5BA3E0'
  accent: '#2D6FAF'
context:
  - Evolt is a platform of collaborative design thinking tools used to improve a product, a process, or an entire company. Several apps under one roof — UX maps, brainstorming canvases, surveys, personas, customer journey maps, storyboards, moodboards, empathy maps — all real-time multi-user, all browser-based.
  - Used by Royal Canin, SNCF, and Crédit Agricole for in-house workshops and persona work, sometimes with custom tooling built for their specific use cases.
myRole: Tech lead for four years on a team of 4–5 developers. Owned the architecture, conceived and built several of the tools myself, set the design system, and managed delivery alongside the founders.
whatIBuilt:
  - title: Suite of collaborative design thinking tools
    detail: UX map, persona, brainstorming, customer journey map, storyboard, moodboard, empathy map. I conceived and built several of these myself end-to-end — the UX map and conceptualization tools in particular.
  - title: Real-time multi-user collaboration
    detail: Multiple participants editing the same canvas at the same time, with changes propagated through GraphQL subscriptions. Same reason as on every project I touch with variable data shapes — GraphQL + flexible models let new tool types ship without breaking the existing ones.
  - title: Shared design system
    detail: A Figma library and a shared React component library, both refreshed monthly to absorb new patterns, new technology, and the lessons of the previous month. The cost was real upfront, but every new tool after that landed faster and stayed visually coherent across the suite.
  - title: Enterprise customizations for Royal Canin, SNCF, Crédit Agricole
    detail: On top of the standard product, custom tooling for specific client use cases — without forking the codebase or fragmenting the team.
  - title: CI/CD and test culture
    detail: Pipelines on GitLab, automated tests with Jest, deployments via Docker. Boring infrastructure done well so the team could move fast without breaking things.
  - title: Led 4–5 developers across four years
    detail: Weekly 1:1s, weekly team sync, code reviews on every PR, and a habit of writing things down. Same playbook I've kept since.
techStack:
  - slug: graphql
    label: GraphQL
    note: API + real-time subscriptions for collaboration.
  - slug: nodedotjs
    label: Node.js
    note: All backend services.
  - slug: react
    label: React
    note: All frontend apps, sharing a common component library.
  - slug: typescript
    label: TypeScript
    note: End-to-end.
  - slug: jest
    label: Jest
    note: Unit and integration tests.
  - slug: gitlab
    label: GitLab
    note: Source, CI/CD pipelines.
  - slug: docker
    label: Docker
    note: Service containerization.
impact:
  - value: '4'
    label: years leading the team
  - value: '3'
    label: Fortune-tier enterprise clients
  - value: 4–5
    label: developers managed
clients:
  - Royal Canin
  - SNCF
  - Crédit Agricole
tradeoff: Building a suite of collaborative tools with a small team means visual and code consistency could rot fast. I invested early in a Figma + React design system, refreshed every month — slow at the start, fast forever after.
position:
  x: 13200
  y: 2000
order: 2
ambient: blueprint-grid
metaDescription: 'Evolt — led a 4–5 developer team shipping collaborative SaaS apps used by Royal Canin, SNCF, and Crédit Agricole.'
ogSubtitle: Enterprise SaaS, led for 4 years
---
