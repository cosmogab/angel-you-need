---
title: Cosmodinos
category: Web3 / NFT
period: '2022'
role: Tech Lead (Contract)
team: Solo
status: Shipped
sky:
  theme: cosmodinos
  description: purple night with stars
  base: '#2E1B5C'
  accent: '#9B5FE0'
context:
  - Cosmodinos is a Web3 brand built around cartoon dinosaurs from the cosmos — three NFT collections on Ethereum (Gods 88, Alpha 888, Omega 8,888, designed by MBE & Valentin), a community big enough to host IRL events, and merch on top.
  - I joined as the sole technical builder to ship every piece of the platform the community traded on.
myRole: Solo tech lead. Wrote every line of Solidity myself, built the dApp and the backend that powered the marketplace, and shipped on the timelines the mints needed.
whatIBuilt:
  - title: Multi-collection NFT marketplace
    detail: The reason this existed was to bypass OpenSea — both for fees and for control. The marketplace handled multiple Cosmodinos collections under one roof, and supported event-driven drops and auctions tied to community moments rather than a generic listing flow.
  - title: All Solidity smart contracts, from scratch
    detail: ERC-721 collections, marketplace contract with escrow, royalties, and the auction logic. No external audit budget — I wrote, reviewed, tested, and shipped it myself. The contracts held in production through the whole trading life of the platform.
  - title: React + ethers.js dApp
    detail: Full marketplace UI with WalletConnect for multi-wallet support, on-chain reads and writes via ethers.js, and the kind of latency people expect from a Web2 product, not a Web3 one.
  - title: Node.js + GraphQL backend with a custom indexer
    detail: Listening to on-chain events and indexing them into a queryable layer, so the dApp could render listings, holdings, and history without burning an RPC call per render.
techStack:
  - slug: solidity
    label: Solidity
    note: All smart contracts — collections, marketplace, escrow, royalties.
  - slug: ethereum
    label: Ethereum
    note: Mainnet target.
  - slug: react
    label: React
    note: dApp frontend.
  - slug: nodedotjs
    label: Node.js
    note: Backend services + on-chain indexer.
  - slug: graphql
    label: GraphQL
    note: API serving the dApp from indexed chain data.
  - slug: typescript
    label: TypeScript
    note: End-to-end on the off-chain side.
  - slug: web3dotjs
    label: ethers.js / Web3.js
    note: Wallet connection and on-chain calls.
impact:
  - value: 10K+
    label: users
  - value: 3,000 ETH
    label: trading volume
  - value: '9,864'
    label: NFTs across 3 collections
tradeoff: Solo, no audit budget, hard mint deadlines. I wrote every line of Solidity myself, with the paranoia that approach deserves — heavy testing, careful reviews, no clever code where boring code would do. The contracts shipped and held. The Web3 market has cooled since 2022 — the entrepreneurial experience and the engineering work are what stays.
links:
  - label: cosmodinos.com
    url: https://cosmodinos.com
position:
  x: 2000
  y: 7000
order: 5
ambient: eth-symbols
metaDescription: 'Cosmodinos — a Web3 NFT marketplace with custom Solidity contracts, shipped solo to 10K+ users and 3K ETH volume.'
ogSubtitle: Web3 NFT marketplace, built solo
---
