# Quantity Measurement App — Frontend

A React 18 single-page application that lets authenticated users compare, convert, and perform arithmetic on physical quantities (length, weight, temperature, and volume). It communicates with a Spring Boot REST backend over JWT-secured API calls and supports social sign-in via Google and GitHub OAuth2.

---

## Features

- **Authentication** — email/password registration & login, forgot-password reset, and OAuth2 sign-in (Google & GitHub)
- **Measurement Calculator** — compare, convert, and do arithmetic (add / subtract / divide) across four unit types
  - Length: Feet, Inches, Yards, Centimetres
  - Weight: Kilogram, Gram, Pound
  - Temperature: Celsius, Fahrenheit, Kelvin
  - Volume: Litre, Millilitre, Gallon
- **Calculation History** — filterable table of every past operation, searchable by operation type or measurement category
- **Dashboard** — at-a-glance stats (total conversions, comparisons, arithmetic ops) and quick-action navigation
- **Profile** — view account details and change password in-place
- **Toast notifications** — non-blocking success/error feedback throughout the UI
- **Protected routes** — unauthenticated users are redirected to `/login` automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI library | React 18 with hooks |
| Routing | React Router v6 |
| State management | Context API (`AuthContext`, `ToastContext`) |
| HTTP client | Native `fetch` (wrapped in `src/api/client.js`) |
| Auth tokens | JWT stored in `localStorage` |
| Social sign-in | OAuth2 (Google, GitHub) via Spring Security backend |
| Styling | Plain CSS (consolidated in `index.css`) |
| Build tooling | Create React App (`react-scripts` 5) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 16 and **npm** ≥ 8
- The [Quantity Measurement App backend](https://github.com/Vaidik-Choudhary/QuantityMeasurementApp) running and accessible (default: `http://localhost:8080`)

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure the backend URL
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# 3. Start the development server
npm start
```

The app will be available at **http://localhost:3000**.

### Production Build

```bash
npm run build
```

The optimised static files are output to the `build/` directory and can be served by any static-file server or CDN.


