<div align="center">

# 🍿 Movielist — Cinematic Watchlist & Movie Tracker

**An offline-first, privacy-focused, keyless movie & TV series collection tracker built with modern web aesthetics.**

[![React 19](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

[Features](#-key-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Keyboard Shortcuts](#-keyboard-shortcuts)

---

</div>

## 🌟 Overview

**Movielist** is a state-of-the-art web application designed for movie enthusiasts to organize, discover, and share their cinema watchlist. Built in a dark theatre ambiance with fluid animations, Movielist operates **100% offline-first using IndexedDB**, requires **zero API keys**, and guarantees complete user privacy.

---

## ⚡ Key Features

* 🍿 **Complete Tracking Lifecycle**: Categorize titles into *Watchlist*, *Watching*, *Watched*, or *Dropped* with star ratings, viewing dates, and personal notes.
* 🔍 **Keyless Smart Fetch**: Auto-fill high-resolution poster artwork, exact release dates, synopses, genres, and language details instantly using open APIs (Wikipedia, Wikidata, TVMaze, iTunes)—no API key required!
* 🎬 **Live Trending Cinema**: Discover currently trending 2025/2026 films with Google Search volume metrics and social signal highlights.
* 🎨 **Custom Theme Engine**: Seamlessly toggle between **Theatre Dark**, **Cinema Light**, **Midnight Blue**, and **Warm Red** themes with custom font scaling (`14px` to `18px`) and reduced-motion modes.
* 🔒 **Privacy-First & Offline Storage**: Your collection stays on your device using IndexedDB (Dexie.js). Includes full JSON data backup export and import.
* 🎴 **Shareable Poster Cards**: Export high-resolution image snapshots of your collection or individual movie cards to share with friends.
* 🔔 **Release Date Notifications**: Automated background checks send browser alerts when an upcoming watchlist title releases.
* 📱 **PWA Ready**: Installable on desktop and mobile devices with full touch responsiveness and offline asset caching.
* ⚖️ **Launch & SEO Compliant**: Built-in Cookie Consent Banner, Privacy Policy (`/privacy`), Terms of Service (`/terms`), custom 404 page, robots.txt, sitemap.xml, and HSTS security headers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) |
| **Styling & Icons** | [TailwindCSS 4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) |
| **Animation Engine** | [Framer Motion](https://www.framer.com/motion/) |
| **Local Database** | [Dexie.js](https://dexie.org/) (IndexedDB wrapper) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Backend & Dev Middleware** | [Express](https://expressjs.com/) + [`tsx`](https://github.com/privatenumber/tsx) |
| **Card Export** | [`html2canvas`](https://html2canvas.hertzen.com/) |

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/movielist.git
   cd movielist
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open in browser:**
   Navigate to [`http://localhost:3000`](http://localhost:3000).

---

## 📁 Project Structure

```
movielist/
├── server.ts                 # Express backend server with Vite dev middleware & security headers
├── vite.config.ts            # Vite 8 configuration with path aliases
├── package.json              # Project scripts and dependencies
├── index.html                # Entry HTML with OpenGraph tags, PWA metadata, & font preconnects
├── public/
│   ├── favicon.svg           # Cinematic SVG favicon
│   ├── apple-touch-icon.png  # Mobile app icon
│   ├── og-image.png          # Social preview banner (1200x630)
│   ├── robots.txt            # Search engine crawler instructions
│   └── sitemap.xml           # XML Sitemap
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Root layout shell, hotkeys handler, & theme controller
    ├── AnimatedRoutes.tsx    # Page routes with Framer Motion transitions
    ├── index.css             # Design system tokens and theme definitions
    ├── db/
    │   └── db.ts             # Dexie.js IndexedDB database schema
    ├── types/
    │   └── movie.ts          # TypeScript interfaces for Movie, WatchState, Theme, etc.
    ├── store/
    │   └── useMovieStore.ts  # Zustand global state store & Dexie sync
    ├── services/
    │   ├── smartFetchService.ts    # Keyless Wikipedia/TVMaze/iTunes metadata provider
    │   ├── trendingService.ts      # Trending movies API service
    │   ├── notificationService.ts  # Release date tracker & notification generator
    │   ├── shareService.ts         # Image snapshot export helper
    │   └── analyticsService.ts     # Privacy-first anonymous usage logger
    └── components/
        ├── layout/           # TopBar, Desktop Sidebar, and Mobile Navigation
        ├── watchlist/        # Watchlist grid, filter bar, & detail drawer
        ├── watched/          # Watched movies history & collection sharing
        ├── discover/         # Discover page & live trending section
        ├── share/            # Stats overview & share card builder
        ├── settings/         # Theme switcher, font size, & JSON backup tools
        ├── legal/            # Privacy Policy & Terms of Service pages
        ├── modal/            # Add & Edit movie modal with AI smart fetch
        └── common/           # Reusable UI elements (MovieCard, Toast, CookieConsent, 404, etc.)
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>N</kbd> | Open **Add New Movie** modal |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus **Search bar** |
| <kbd>Shift</kbd> + <kbd>?</kbd> | Toggle **Keyboard Shortcuts Cheat-sheet** |
| <kbd>Esc</kbd> | Close active modal or drawer |

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `tsx server.ts` | Starts Express server with Vite middleware at `http://localhost:3000` |
| **`npm run build`** | `vite build` | Bundles production assets into `dist/` |
| **`npm run preview`** | `vite preview` | Previews production build locally |
| **`npm run lint`** | `tsc --noEmit` | Runs TypeScript type checker |

---

## 🔒 Privacy & Security

* **Local Storage First**: All movie collections, ratings, and settings stay on your browser's IndexedDB storage.
* **No Third-Party Tracking**: Zero advertising scripts or selling of personal data.
* **Security Headers**: Production server includes HSTS (`Strict-Transport-Security`), `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.

---

## 📄 License

This project is open source and available under the [Apache 2.0 License](LICENSE).

---

<div align="center">
  <sub>Built for cinema lovers. Popcorn sold separately. 🍿</sub>
</div>
