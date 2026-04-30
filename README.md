# ⚡ Hearth

> Your money. Your machine. No server, no account, no nonsense.

---

I built this after watching my brother over at [@wavegenlabs](https://github.com/wavegenlabs) vibe-code an impressive personal finance app — but it was hooked up to Netlify and Supabase. For tracking *his own* money. On *his own* devices. I wanted something simpler: open the app, use it, close it. Everything stays on your device, encrypted when you want it backed up, and installable like a native app on any device he owns. So I whiteroomed the whole thing as a PWA.

This is Hearth — a personal finance command center that lives entirely in your browser's `localStorage`. No backend. No subscription. No privacy policy needed.

---

## ✨ Features

| Module | What it does |
|---|---|
| **Command Center** | Daily brief — spending yesterday, budget status, runway, net worth at a glance |
| **Accounts** | Track checking, savings, credit, investment, and loan accounts |
| **Transactions** | Log income and expenses, filter by type, categorize everything |
| **Import** | Drag in a CSV or OFX/QFX bank export and map it instantly |
| **Budget** | Set monthly category limits with visual progress bars |
| **Debts** | Track balances, APR, and minimum payments |
| **Subscriptions** | See your monthly burn, flag cancel candidates, calculate potential savings |
| **Forecast** | 50-year wealth trajectory with a year-by-year breakdown table |
| **Net Worth** | Assets minus liabilities, always up to date |
| **Tasks** | Simple to-do / in-progress / done task board |
| **Backup & Restore** | AES-256-GCM encrypted export — store it anywhere, restore with your passphrase |

---

## 🔒 How Backup & Restore Works

There's no cloud sync here by design. Instead, Hearth lets you export all your data as a single **encrypted file** that you can store wherever you like — Google Drive, iCloud, a USB drive, email it to yourself. Your data, your rules.

### Exporting a backup

1. Go to **Settings** (the ≡ menu → Settings)
2. Tap **Export Encrypted Backup**
3. Choose a strong passphrase — **write it down somewhere safe, there's no recovery**
4. Confirm the passphrase and tap **Export**
5. A file named `hearth-backup-YYYY-MM-DD.enc` downloads to your device
6. Move it to Google Drive / iCloud / wherever you keep important files

### Restoring from a backup

1. Go to **Settings → Import Backup File**
2. Select your `.enc` file
3. Enter the passphrase you used when exporting
4. Tap **Restore** — the page reloads with all your data back

### How the encryption works

Under the hood it uses only built-in browser APIs — no third-party crypto library:

- Your passphrase is run through **PBKDF2** (SHA-256, 100,000 iterations, random 16-byte salt) to derive an **AES-256-GCM** key
- The data is encrypted with a random 12-byte IV
- The salt, IV, and ciphertext are base64-encoded into a single JSON file
- Without the passphrase, the file is unreadable — not even the author can help you recover it

---

## 📱 Installing as an App

Hearth is a fully installable PWA. No app store, no download.

### On Desktop (Chrome / Edge)

1. Open the app URL in Chrome
2. Click the **Install** icon (⊕) that appears in the right side of the address bar
3. Click **Install** in the prompt
4. Hearth appears in your dock / taskbar like any other app

### On iPhone (Safari only — Chrome on iOS can't install PWAs, Apple's rules)

1. Open the app URL in **Safari**
2. Tap the **Share** button (the box with an arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**
5. The app appears on your home screen and launches full-screen

---

## 🛠 Running Locally

```bash
git clone https://github.com/yourusername/local-finance.git
cd local-finance
npm install
npm run dev
```

Open [http://localhost:5173/local-finances-pwa/](http://localhost:5173/local-finances-pwa/)

### Building for production

```bash
npm run build
npm run preview    # preview at localhost:4173/local-finances-pwa/
```

---

## 🚀 Deploying to GitHub Pages

1. Push this repo to GitHub (public repo, or private with GitHub Pro)
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Push to `main` — the workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) handles the rest
4. Your app lives at `https://yourusername.github.io/local-finances-pwa/`

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 (hash router — no server config needed) |
| State | React Context + useReducer |
| Storage | `localStorage` |
| PWA | vite-plugin-pwa + Workbox |
| Encryption | Web Crypto API (built-in, no deps) |
| Hosting | GitHub Pages via GitHub Actions |

Zero backend. Zero database. Zero recurring cost.

---

## 🗂 Project Structure

```
src/
├── components/        Shared UI — Card, Button, Modal, Input, Layout, Nav
├── context/           AppDataContext — global state synced to localStorage
├── features/
│   ├── home/          Command Center
│   ├── accounts/      Accounts
│   ├── transactions/  Transactions
│   ├── import/        CSV + OFX import
│   ├── budget/        Budget categories
│   ├── debts/         Debt tracking
│   ├── subscriptions/ Subscription manager
│   ├── forecast/      50-year financial forecast
│   ├── networth/      Net worth overview
│   ├── tasks/         Task board
│   └── settings/      Backup, restore, PWA install guide
└── lib/
    ├── crypto.ts      AES-256-GCM encrypt/decrypt
    ├── storage.ts     localStorage read/write + exportAll/importAll
    ├── parsers.ts     CSV and OFX file parsers
    ├── format.ts      Currency and date formatting
    └── types.ts       All TypeScript types
```

---

## License

Do whatever you want with it. It's for you and yours.
