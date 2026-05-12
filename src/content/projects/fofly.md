---
title: Fofly
category: Travel & Wellbeing — In Progress
period: Mar 2026 – Present
role: Developer
team: Solo
status: Live — mobile app in progress
sky:
  theme: fofly
  description: tech deep blue with stars and data-viz cloud accents
  base: '#1E3A7A'
  accent: '#FFC947'
context:
  - Fofly helps people with a fear of flying actually take their flight. The brand is run by Nicolas Coccolo, a former Boeing 737 instructor who's been coaching anxious flyers since 2011, alongside specialized psychologists. Their consumer side — e-learning, workshops in Paris and Marseille, individual coaching — has a 95% success rate and 25+ years of combined expertise on the team.
  - I joined as the solo developer to build the data side of the product — a personalized flight report and a mobile app for users to take their flight with.
myRole: Sole developer. I built the API, the data pipeline, the report generation, the email automation, and I'm now starting on the companion mobile app.
whatIBuilt:
  - title: Personalized flight report
    detail: A user enters their upcoming flight. I aggregate the flight details, the weather along the route, and the turbulence forecast, and an LLM writes a report that's grounded in the real numbers and reassures the user without inventing or minimizing anything.
  - title: Three-source aviation data pipeline
    detail: AeroAPI from FlightAware for flight tracking and details, AeroDataBox for the broader aviation context, and Turbli for the turbulence forecasts. Each one has its own shape, its own quirks, its own missing fields. Most of the work is making them agree.
  - title: Pre-flight email automation
    detail: The report ships by email 1h30 before takeoff. That window is chosen deliberately — far enough out that the user can read it calmly, close enough that the forecast data is actually accurate.
  - title: Prompt engineering with no hallucinations
    detail: The hard part of the report isn't generating text — it's keeping the LLM honest. The turbulence forecast says what it says, and the report has to reflect it as it is, not rounded toward whichever direction would be easier to read. Tight prompt boundaries, structured input, and careful evaluation on real flights before going live.
  - title: React Native mobile app (in progress)
    detail: Companion app currently in development, so users get the same reports and the same support inside the brand they already know.
techStack:
  - slug: javascript
    label: JavaScript
    note: Backend runtime — kept the stack deliberately simple.
  - slug: nodedotjs
    label: Node.js
    note: API and pipeline runtime.
  - slug: supabase
    label: Supabase
    note: Postgres, auth, and edge functions.
  - slug: openai
    label: OpenAI
    note: Report generation, with tight constraints.
  - slug: reactnative
    label: React Native
    note: Mobile app, in progress.
impact:
  - value: Live
    label: and shipping
  - value: '3'
    label: data sources aggregated (AeroAPI, AeroDataBox, Turbli)
  - value: 1h30
    label: pre-flight email window
tradeoff: Each aviation API has its own format, its own gotchas, and its own missing fields. Most of the engineering is making three sources agree on one flight — units, time zones, severity scales, missing legs — so the report can be one coherent story instead of three disjointed feeds.
links:
  - label: fofly.com
    url: https://fofly.com
position:
  x: 13600
  y: 9600
order: 6
ambient: tiny-planes
metaDescription: 'Fofly — a personalized pre-flight report and mobile companion for people with a fear of flying, aggregating three aviation data sources.'
ogSubtitle: Flight data, in service of anxious flyers
---
