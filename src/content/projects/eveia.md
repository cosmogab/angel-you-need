---
title: Eveia
category: Connected Health / Mobile
period: Jan 2022 – Dec 2022
role: Full-Stack & Mobile Lead
team: 3 developers + 1 designer (led)
status: Shipped — still selling
sky:
  theme: eveia
  description: soft pastel mint
  base: '#7ED8B0'
  accent: '#3FB085'
context:
  - Eveia is a connected under-desk pedal paired with a companion mobile app. The pedal is patented French engineering — a 7 cm micro-amplitude motion that protects the knees and the psoas while you work — built to medical-grade quality with a 30-year service life.
  - The app pairs over Bluetooth, counts steps and calories from the pedal's motion, and syncs them into Apple Health, Google Fit, and Fitbit so users see the activity inside the health ecosystem they already use. The product is now used inside Enedis, Hennessy, the Ministère des Finances, CARSAT, Crédit Agricole, COVEA, SUEZ, and has been covered by TF1, France Inter, Europe 1, Le Parisien, and RMC/BFMTV.
myRole: Full-stack and mobile lead. Led a cross-functional team of three developers (mobile, hardware, game) and one designer. Built the backend, the back-office, most of the mobile app, and the BLE integration myself.
whatIBuilt:
  - title: React Native app, iOS and Android
    detail: Built most of the app personally, with one mobile developer supporting. End-to-end ownership of the user experience and the technical architecture on the client side.
  - title: BLE integration to the physical pedal
    detail: Wrote this layer myself with react-native-ble-plx. The hardest piece of the whole product — connecting a React Native app to a custom-firmware Bluetooth peripheral and keeping the link alive reliably across iOS and Android.
  - title: iOS background sync that doesn't get killed
    detail: iOS aggressively suspends background BLE to save battery, which is fatal when your job is to count steps while the user works. I wired Core Bluetooth background modes properly, paired with on-pedal buffering, so even when iOS suspended the app the data didn't disappear — it caught up on resume.
  - title: 'Wearable integrations: Apple Health, Google Fit, Fitbit'
    detail: All three. Steps from the pedal flow into the user's existing health ecosystem instead of forcing them into a new silo. Native HealthKit, Health Connect / Google Fit, and the Fitbit Web API.
  - title: Backend and back-office
    detail: Node.js + GraphQL + MongoDB. User data, device pairing, history, and the admin tools the operations team used day-to-day.
  - title: Led a cross-functional team
    detail: Three developers and one designer, spanning hardware, mobile, and a game developer who built virtual world walking experiences inside the app — pedaling becomes a stroll through universes, integrated into the same step-count pipeline.
techStack:
  - slug: reactnative
    label: React Native
    note: iOS + Android app.
  - slug: typescript
    label: TypeScript
    note: Across mobile and backend.
  - slug: nodedotjs
    label: Node.js
    note: Backend + back-office.
  - slug: graphql
    label: GraphQL
    note: API for app and back-office.
  - slug: mongodb
    label: MongoDB
    note: Primary data store.
  - slug: bluetooth
    label: BLE / react-native-ble-plx
    note: Pairing and data sync with the pedal.
  - slug: apple
    label: Apple HealthKit
    note: iOS health sync.
  - slug: googlefit
    label: Google Fit / Health Connect
    note: Android health sync.
  - slug: fitbit
    label: Fitbit API
    note: Third-party wearable sync.
impact:
  - value: iOS + Android
    label: shipped
  - value: E2E
    label: product ownership
  - value: '7'
    label: enterprise clients on the product today
clients:
  - Enedis
  - Hennessy
  - Ministère des Finances
  - CARSAT
  - Crédit Agricole
  - COVEA
  - SUEZ
tradeoff: BLE on mobile is a minefield. iOS in particular will kill a background connection the moment it decides battery matters more than your app — and the pedal is not allowed to die mid-step-count. We invested early in Core Bluetooth background modes, smart reconnection, and offline buffering on the pedal itself, so the data flow stayed correct even when the OS got in the way.
links:
  - label: eveia.io
    url: https://www.eveia.io
position:
  x: 14000
  y: 6000
order: 4
ambient: heartbeat-pulse
metaDescription: 'Eveia — a connected health product with a React Native mobile app, back-office, and wearable integrations, led end-to-end.'
ogSubtitle: Connected health, end-to-end
---
