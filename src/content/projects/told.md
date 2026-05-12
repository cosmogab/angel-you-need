---
title: Told
category: SaaS Platform
period: Jan 2023 – Mar 2026
role: Senior Full-Stack Engineer
team: 2–3 developers (led)
status: Shipped — 19M+ responses collected
sky:
  theme: told
  description: golden dawn
  base: '#FFB347'
  accent: '#FF6B35'
context:
  - Told is a B2B SaaS for product teams who need to talk to their users without bothering engineering. Drop one script on your site and you can ship in-app surveys, product tours, mobile feedback, and email follow-ups — fully no-code, fully measurable.
  - Built from scratch and shipped to 600+ companies, including Royal Canin, Axeptio, Inqom (by Visma), and WorkLife.
myRole: End-to-end ownership. I designed the architecture, built the embeddable widget, the dashboard, the backend, the data layer, and the AI features — then led the small team that scaled it all in production.
whatIBuilt:
  - title: Full product architecture, from scratch
    detail: React/TypeScript dashboard, Node.js + GraphQL backend, MongoDB data layer. I chose MongoDB and GraphQL for the same reason — survey schemas and response shapes vary wildly from one customer to the next, and a flexible model plus a dynamic query layer let us ship new question types without database migrations.
  - title: Embeddable cross-domain widget
    detail: One script tag drops Told on any client website. The widget opens isolated iframes for each popup, which keeps the host site's CSS, JS, and CSP untouched — a non-negotiable for clients running serious production sites.
  - title: Product tour engine
    detail: I designed and built most of the product tour module — interactive in-app guides that highlight features step-by-step without a line of code on the client side. The part of Told I'm proudest of.
  - title: AI-powered creation & analysis
    detail: GPT-4 integrated end-to-end — assisted survey writing, assisted product tour design, and a custom report builder where you describe what you want to see and the AI generates the report, live, inside the dashboard.
  - title: Voice & text AI question type
    detail: A new survey question type that opens a live chat with an AI — text or voice. Lets product teams collect open-ended feedback as a conversation, not as a textarea.
  - title: Documentation with RAG chat
    detail: Shipped a chunked, embedded documentation system with a chat layer — ask the docs a question, get a contextual answer with sources.
  - title: MCP tooling
    detail: Exposed Told's core capabilities — create a survey, build a product tour, generate a report on results — as MCP tools, so users can drive Told from Claude, ChatGPT, or any agent.
  - title: Event pipeline & infrastructure
    detail: Backend processing 10M+ events per month, stored across AWS S3 and RDS on a Kubernetes pipeline. The dashboards and reports query this data live, so query optimization was real, ongoing work.
  - title: Led a small remote team
    detail: Weekly 1:1s with each developer, weekly team sync for current work and new tech we picked up, code reviews on every PR, and a written documentation culture. Small team, high trust, no ceremony for ceremony's sake.
techStack:
  - slug: typescript
    label: TypeScript
    note: End-to-end — dashboard, widget, backend.
  - slug: react
    label: React
    note: Dashboard and embedded widget UI.
  - slug: nodedotjs
    label: Node.js
    note: All backend services.
  - slug: graphql
    label: GraphQL
    note: Dynamic API over variable survey shapes.
  - slug: mongodb
    label: MongoDB
    note: Flexible data model for fast-evolving schemas.
  - slug: amazonwebservices
    label: AWS (S3 + RDS)
    note: Event storage and relational data.
  - slug: kubernetes
    label: Kubernetes
    note: Production deployment pipeline.
  - slug: docker
    label: Docker
    note: Service containerization.
  - slug: jest
    label: Jest
    note: Unit and integration tests.
  - slug: openai
    label: OpenAI / GPT-4
    note: Assisted creation, custom reports, in-survey chat, RAG docs.
impact:
  - value: 19M+
    label: responses collected
  - value: 600+
    label: companies trust Told
  - value: '3'
    label: developers led remotely
clients:
  - Royal Canin
  - Axeptio
  - Inqom (by Visma)
  - WorkLife
tradeoff: Small team, large surface. We had to ship features fast enough to stay relevant, but clean enough not to break anything in production — clients embed our widget on sites they care about, so the quality bar was high. We invested in tests, code reviews, and writing things down, and turned down features we couldn't ship well.
links:
  - label: told.club
    url: https://told.club
position:
  x: 2800
  y: 2000
order: 1
ambient: event-dots
metaDescription: 'Told — a B2B SaaS conversational survey platform embedded on 600+ client sites, architected and led end-to-end by Gabriel Miro.'
ogSubtitle: B2B SaaS conversational surveys at scale
---
