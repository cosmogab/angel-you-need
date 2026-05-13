---
title: Culture-Relax
category: Cultural Accessibility Platform
period: Jun 2025 – Dec 2025
role: Full-Stack Developer
team: Solo
status: Shipped
sky:
  theme: culture-relax
  description: orange sunset
  base: '#FF6B5B'
  accent: '#C62E1F'
context:
  - Culture-Relax is a French non-profit that makes mainstream cinema and live performance accessible to people whose disability causes atypical behavior — autism, polyhandicap, intellectual or psychiatric disability, Alzheimer's. They publish a public directory of Relax sessions across the country, and run a back-office where partner venues (cinemas, theaters, opera houses, philharmonics) enter their sessions, manage their audience analytics, and reach their community.
  - I was brought in to modernize the legacy stack and ship their full feature roadmap before year-end. 400,000+ monthly visits run through what I shipped.
myRole: Sole developer. Took the platform from a tired legacy stack to a modern one and shipped the entire backlog they had been sitting on.
whatIBuilt:
  - title: Strapi CMS migration, zero downtime
    detail: Upgraded the back-office CMS several major versions without taking the public site offline. Editorial work continued throughout the migration.
  - title: Audience analytics for partner venues
    detail: Inside the back-office, partner cinemas and theaters can now see who's attending their Relax sessions and how their audience evolves over time. The data they needed to make the case for funding.
  - title: Poster creator tool
    detail: A simple in-app generator that lets venues turn a session into a printable poster matching the Culture-Relax brand. Small tool, real impact on how many of these posters actually end up on cinema walls.
  - title: Better search across the public directory
    detail: Families looking for a Relax session in their region need a few clicks and zero confusion. I reworked the search and filtering on the public site to match that bar.
  - title: SendGrid newsletter automation
    detail: Partner-facing newsletter pipeline to keep venues and audiences informed of new sessions, region by region.
  - title: Accessibility work on the public site
    detail: Given Culture-Relax's mission, WCAG compliance on the public site wasn't a nice-to-have. Color contrast, semantic structure, keyboard navigation, screen-reader output — done properly across the pages I touched.
techStack:
  - slug: strapi
    label: Strapi
    note: Headless CMS for the back-office — migrated across major versions.
  - slug: nodedotjs
    label: Node.js
    note: Backend services.
  - slug: react
    label: React
    note: Public site and back-office UIs.
  - slug: typescript
    label: TypeScript
    note: End-to-end.
  - slug: postgresql
    label: PostgreSQL
    note: Primary data store.
  - slug: sendgrid
    label: SendGrid
    note: Newsletter and transactional email.
impact:
  - value: 400K+
    label: monthly visits
  - value: Zero
    label: downtime during migration
  - value: Full
    label: roadmap shipped
tradeoff: Non-profit budget, fixed timeline, a full backlog to ship. The brief wasn't "cut scope" — it was "ship everything they need, cleanly, without breaking what already works." The site shipped on time, the migration shipped with zero downtime, and the public site came out with WCAG compliance baked in.
links:
  - label: culture-relax.org
    url: https://culture-relax.org
position:
  x: 5600
  y: 9600
order: 3
ambient: drifting-leaves
metaDescription: 'Culture-Relax — modernized a cultural accessibility platform serving 400K+ monthly visits, with a zero-downtime Strapi migration.'
ogSubtitle: Modernization and zero-downtime migration
---
