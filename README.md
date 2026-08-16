# Jala Rakshana — Save Water Today, Secure Tomorrow

A multilingual (9 Indian languages) mobile-first PWA for water conservation, rainwater harvesting, government schemes, climate intelligence, quizzes and an AI assistant.

Built with **React 19 + TanStack Start + Vite 7 + Tailwind CSS v4**.

---

## 1. Requirements

- **Node.js 20 or newer** (`node -v` to check) — https://nodejs.org
- npm (comes with Node), or bun/pnpm if you prefer
- **VS Code** (recommended) — https://code.visualstudio.com

## 2. Get the code

```bash
git clone <your-github-repo-url>
cd <repo-folder>
```

Or in VS Code: `Ctrl+Shift+P` → **Git: Clone** → paste the repo URL.

## 3. Install dependencies

```bash
npm install
```

## 4. Environment variables (optional)

Everything works offline-free except the **AI Assistant** and **AI climate advisories**, which need an API key.

```bash
cp .env.example .env
```

Then open `.env` and set:

```
LOVABLE_API_KEY=your_key_here
```

Without it, the rest of the app (weather, schemes, quiz, community, media, harvesting calculator) still works — the AI screens simply show a friendly "AI is not configured" message.

## 5. Run the dev server

```bash
npm run dev
```

Open http://localhost:8080 in your browser. In VS Code you can `Ctrl+Click` the link in the terminal.
Use the browser's device toolbar (F12 → toggle device toolbar) for the mobile view.

## 6. Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the code |
| `npm run format` | Format with Prettier |

## 7. Push to GitHub

```bash
git add .
git commit -m "Jala Rakshana app"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, build output and `.env`, so no secrets are pushed.

## 8. Project structure

```
src/
  routes/        pages (index, conservation, harvest, schemes, assistant,
                 weather, quiz, community, media, settings)
  components/    shell, bottom nav, splash, install prompt, climate widgets
  lib/           i18n + translations, gamification, climate data, AI server functions
public/          manifest.json, icons, favicon
```

## 9. Notes

- Offline/PWA install works on the **published/production** build, not in dev.
- Weather data comes from the free Open-Meteo API — no key needed.
- Languages: English, తెలుగు, हिंदी, தமிழ், ಕನ್ನಡ, മലയാളം, मराठी, বাংলা, اردو.

## 10. Troubleshooting

- **`npm install` fails** → update Node to v20+, delete `node_modules` and `package-lock.json`, retry.
- **Port 8080 in use** → run `npm run dev -- --port 5173`.
- **Blank page** → check the terminal and browser console (F12) for the first error.
