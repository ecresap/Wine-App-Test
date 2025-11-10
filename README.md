# Wine Tasting App

This project is a **frontend‑only** wine tasting web application built with React, TypeScript, Vite and Tailwind CSS. It allows you to record detailed tasting notes and discover common descriptors by grape from your own history. Everything is stored locally in your browser using `localStorage`, so it works offline and requires no backend or authentication.

## Features

* **Add Tastings** – fill in a multi‑section form inspired by WSET tasting methodology. Searchable multi‑select inputs allow you to pick or add aroma and flavor descriptors quickly. Draft entries are autosaved until you submit or discard them.
* **Tasting List** – search and filter your recorded tastings. Select multiple entries for deletion.
* **Grapes Directory** – see all grapes you’ve tasted with quick stats like count and top aromas.
* **Insights** – once you've recorded enough tastings for a grape (configurable), view frequency charts for top descriptors and structure distributions.
* **Settings** – export or import your data as JSON, toggle theme (system/light/dark), adjust insight thresholds and advanced options, and reset all data.
* **Help** – built‑in guide and keyboard tips.

## Tech Stack

* **React + Vite** with TypeScript
* **Tailwind CSS** for styling with a custom wine‑red palette
* **Headless UI** for accessible primitives and **lucide‑react** for icons
* **Zustand** for state management with localStorage persistence
* **Zod** for runtime schema validation
* **Recharts** for data visualisation
* **React Router** for navigation

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

3. **Build for production**

   ```bash
   npm run build
   ```

   Static output will be generated in the `dist/` folder, which you can deploy to any static host (e.g. GitHub Pages or Cloudflare Pages).

## Data Export / Import

Use the **Settings** page to export your tastings, vocab and preferences to a JSON file. You can import the file later to restore your data on another device or after clearing your browser storage. Imported files are validated with Zod to ensure they match the expected schema.

## Schema & Storage

All data is stored under a single object in `localStorage` with a versioned schema. A migration utility is included to handle future schema changes gracefully. See `src/lib/schema.ts` for type definitions and `src/lib/storage.ts` for persistence logic.

## Limitations & Future Work

* Vocab editing UI is minimal; terms can be added when entering tastings but there is no dedicated manager yet.
* Cross‑grape comparison in insights is limited. This could be expanded to overlay charts for multiple grapes.
* Micro‑interactions (animations) are kept subtle to keep bundle size down. They can be enhanced with Framer Motion.
* Accessibility has been considered (focus management, contrast) but additional testing with screen readers would be beneficial.

## License

This project is provided for educational use. Feel free to adapt and extend it for your own tastings!
