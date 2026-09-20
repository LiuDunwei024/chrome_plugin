# Competitor Analysis

Shopify competitor intelligence for product research and catalog analysis.

## Overview

Competitor Analysis is a Chrome extension designed for teams that need fast, in-context visibility into Shopify storefronts. It detects whether the current page is a Shopify site, inspects the storefront profile, and surfaces product catalog data directly inside a lightweight analysis drawer.

This tool is built for competitive research, catalog benchmarking, and quick product discovery across Shopify stores without leaving the browsing session.

## Why It Matters

Modern e-commerce teams often need to answer questions like:

- Is this store built on Shopify?
- What theme and apps are likely being used?
- What products are being sold, and at what pricing?
- Which catalog signals indicate product popularity or merchandising strategy?

Competitor Analysis helps answer those questions in real time, while keeping the workflow simple and browser-native.

## Key Features

### 1. Shopify Detection

The extension inspects a page for Shopify markers, including:

- `window.Shopify`
- Shopify CDN references
- Shopify theme metadata
- storefront cookies and embedded scripts

Once detected, it records storefront signals, hostname, theme name, and login state for analysis.

### 2. Store Profile Intelligence

The project identifies storefront characteristics such as:

- theme information
- commonly used Shopify apps and integrations
- login status signals for the storefront
- store-level metadata that can support competitive evaluation

### 3. Product Catalog Analysis

The extension retrieves product data from:

- `/products.json`
- `/collections/*/products.json`
- storefront DOM structure when public JSON endpoints are unavailable or incomplete

It enriches the catalog with:

- product title and handle
- pricing and compare-at pricing
- images and variants
- rating and review data when available
- page-level product metadata such as badges, fit, and color cues

### 4. Search and Comparison Experience

The extension includes an in-page analysis drawer with:

- catalog search
- best-selling and newest sorting
- product summaries and metadata
- retry and error handling
- CSV export for downstream analysis

## Product Workflow

The extension is designed to support a straightforward competitive analysis flow:

1. Open a Shopify storefront in Chrome.
2. Trigger the extension drawer from the current page.
3. Confirm the store is recognized as Shopify.
4. Review catalog insights, product cards, and metadata.
5. Search, sort, and export findings for research or reporting.

## Architecture

The codebase is organized around a Chrome extension architecture with a content script and supporting background utilities:

```text
src/
├── background.ts
├── popup.tsx
├── components/
├── contents/
│   ├── ShopifyDrawer.tsx
│   ├── csv-export.ts
│   ├── page-watcher.ts
│   ├── product-extractor.ts
│   ├── product-sorting.ts
│   ├── shopify-detector.tsx
│   ├── site-profile.ts
│   ├── types.ts
│   └── ...
├── lib/
└── ...
```

## Tech Stack

- React + TypeScript
- Plasmo for Chrome extension development
- Tailwind CSS for interface styling
- Chrome extension APIs for messaging and browser integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Chrome browser

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

This starts the Plasmo development server and generates a dev build for Chrome.

### Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Select Load unpacked
4. Choose the generated build folder, usually `build/chrome-mv3-dev`

### Production build

```bash
npm run build
```

### Package the extension

```bash
npm run package
```

## Project Structure

```text
.
├── src/
│   ├── background.ts
│   ├── popup.tsx
│   ├── components/
│   └── contents/
│       ├── ShopifyDrawer.tsx
│       ├── csv-export.ts
│       ├── page-watcher.ts
│       ├── product-extractor.ts
│       ├── product-sorting.ts
│       ├── shopify-detector.tsx
│       ├── site-profile.ts
│       ├── types.ts
│       └── ...
├── build/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── README.md
├── README.zh-CN.md
├── assets/
└── ...
```

## Notes

- This extension is intended for Shopify storefront analysis and relies on public storefront patterns.
- Some metadata may vary depending on the theme, installed apps, and storefront configuration.
- When Shopify JSON endpoints are unavailable, the extension falls back to parsing product page markup and collection-level data.

## Development Notes

Most of the project logic is concentrated in the content scripts under `src/contents/`:

- `shopify-detector.tsx` — storefront detection and message registration
- `site-profile.ts` — theme and app profiling, login detection
- `product-extractor.ts` — product fetching and DOM extraction
- `product-sorting.ts` — product ordering logic
- `csv-export.ts` — CSV export support
- `ShopifyDrawer.tsx` — main storefront analysis UI

## License

This project is maintained as an internal tool for competitor research and storefront analysis.
