<a id="top"></a>

<p align="right">
  <a href="README.md">Русский</a>
</p>

<p align="center">
  <img src="public/icons/icon-512x512.png" width="100" alt="EcoShop">
</p>

<h1 align="center">EcoShop</h1>

<p align="center">
  <em>Full-featured e-commerce platform for eco-friendly products</em><br>
  <em>Laravel 12 API + React 19 SPA + TypeScript + Feature-Sliced Design</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-%2306B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/PostgreSQL-17-%234169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-7-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-Ready-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <a href="#demo">Demo</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#features">Features</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#tech-stack">Tech Stack</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#testing">Testing</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#architecture">Architecture</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#roadmap">Roadmap</a>
</p>

---

## Demo


<p align="center">
  <a href="https://rutube.ru/video/private/2f692108c328b45304b8568372442f39/?p=5VnECUz2LZm01f22LBEnOg">
    <img src="docs/demo-preview.jpg" alt="EcoShop — Demo" width="720">
  </a>
  <br>
  <sub>Click the preview to watch the video on Rutube</sub>
</p>

---

## About

**EcoShop** is a production-ready online store for eco-friendly products. Laravel serves as the API and business logic layer, React powers the client-side SPA with its own routing. The frontend follows the **Feature-Sliced Design** methodology. The backend is tested with **Pest**, the frontend with **Vitest**. File storage is provider-agnostic — switch between local disk and S3-compatible storage with a single environment variable. The entire infrastructure is containerized with **Docker** and ready for deployment.

---

## Features

<table>
<tr>
<td valign="top" width="50%">

### Customers

- Product catalog with categories & filters
- Full-text search (Meilisearch)
- Shopping cart with quantity management
- Checkout with order status tracking
- User account, order history, addresses
- Contact form, static pages
- PWA — installable on mobile devices

</td>
<td valign="top" width="50%">

### Administrators

- Role-based access (admin / order_manager / content_manager)
- Product management with multi-image upload
- Category tree with sorting
- Order processing with status workflow
- Banner & page content management
- Site settings via admin panel

</td>
</tr>
</table>

<p align="right"><a href="#top">back to top</a></p>

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/YOUR_USERNAME/ecoshop.git
cd ecoshop
cp .env.example .env
```

Set the admin password in `.env`:

```env
ADMIN_PASSWORD=your_secure_password
```

```bash
docker compose up -d --build
# Migrations and admin creation run automatically on startup
```

Open **http://localhost** in your browser. Login: `admin@ecoshop.ru` + your password.

<details>
<summary>Seed demo data</summary>

<br>

```bash
docker compose exec app php artisan db:seed
docker compose exec app php artisan cache:clear
```

Creates test products, categories, banners, orders, and users. Default password for all test accounts: `password`.

</details>

<details>
<summary>Test accounts (after db:seed)</summary>

<br>

Default password for all test accounts: `password`.

| Role | Email |
|:--|:--|
| Administrator | `admin@ecoshop.ru` |
| Order Manager | `manager@ecoshop.ru` |
| Content Manager | `content@ecoshop.ru` |
| Customer | `ivanov@example.com` |

</details>

<details>
<summary>Local development (without Docker)</summary>

<br>

Requirements: PHP 8.2+, Node.js 24+, Composer, PostgreSQL, Redis.

```bash
composer install && npm install
cp .env.example .env
php artisan key:generate
php artisan migrate && php artisan db:seed
composer dev
```

`composer dev` starts in parallel: PHP server, queue worker, logs (Pail), and Vite.

</details>

<p align="right"><a href="#top">back to top</a></p>

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Backend

| | Technology |
|:--|:--|
| Framework | **Laravel 12**, PHP 8.2+ |
| Search | **Laravel Scout** + Meilisearch |
| Authentication | **Laravel Sanctum** |
| Roles & Permissions | **Spatie Permission** |
| URL Slugs | **Spatie Sluggable** |
| Sorting | **Spatie Sortable** |
| Testing | **Pest** |
| Static Analysis | **Larastan** (PHPStan) |
| Formatting | **Laravel Pint** |

</td>
<td valign="top" width="50%">

### Frontend

| | Technology |
|:--|:--|
| UI | **React 19** + TypeScript 5.9 |
| Styling | **Tailwind CSS 4** |
| State | **Zustand** |
| Server State | **React Query** |
| Animations | **Framer Motion** |
| Components | **Headless UI** |
| Icons | **Lucide React** |
| Build | **Vite 7** |
| Testing | **Vitest** + Testing Library |
| Architecture | **Feature-Sliced Design** |
| Linting | **ESLint** + Steiger (FSD) |

</td>
</tr>
</table>

<p align="right"><a href="#top">back to top</a></p>

---

## Testing

The project is tested at both backend and frontend levels:

```bash
# Backend — Pest (Feature + Unit)
php artisan test

# Frontend — Vitest
npm run test:run

# PHP static analysis
vendor/bin/phpstan analyse

# TypeScript type checking
npm run type-check
```

| Level | Framework | Coverage |
|:--|:--|:--|
| **Feature tests** | Pest | Auth, Cart, Catalog, Checkout, Admin, Home, Account, Contact, Page |
| **Unit tests** | Pest | Models, Enums |
| **Frontend** | Vitest + Testing Library | Utils, hooks, API client, routes |
| **Static analysis** | Larastan + TypeScript | Type safety for backend and frontend |
| **Architecture** | Steiger | Feature-Sliced Design compliance |

<p align="right"><a href="#top">back to top</a></p>

---

## Architecture

### Feature-Sliced Design (frontend)

```
resources/js/
├── app/        — Layouts, router, global providers
├── pages/      — Pages (home, catalog, cart, checkout, admin/*)
├── widgets/    — Composite UI blocks (header, footer, admin sidebar)
├── features/   — User scenarios (auth)
├── entities/   — Business entities (product, category, cart, order, user, banner)
└── shared/     — UI kit, hooks, utils, types, API client
```

### Docker Infrastructure

```
  Nginx (:80) ──▶ PHP-FPM (:9000) ──▶ PostgreSQL (:5432)
                      │
  Vite (:5173)        ├──▶ Redis (:6379)
                      │
                      └──▶ Meilisearch (:7700)

                           Mailpit (:8025)
```

<details>
<summary>Services & Ports</summary>

<br>

| Service | Port | Purpose |
|:--|:--|:--|
| **Nginx** | `80` | Web server (reverse proxy → PHP-FPM) |
| **Vite** | `5173` | HMR dev server |
| **PostgreSQL** | `5432` | Primary database |
| **Redis** | `6379` | Cache, sessions, queues |
| **Meilisearch** | `7700` | Full-text search engine |
| **Mailpit** | `1025` / `8025` | Email testing (SMTP / Web UI) |

</details>

<details>
<summary>Project Structure</summary>

<br>

```
ecoshop/
├── app/
│   ├── Actions/          # Single-action classes
│   ├── Enums/            # PHP enums (UserRole, OrderStatus, ...)
│   ├── Events/           # Domain events
│   ├── Http/
│   │   ├── Controllers/  # Controllers (Web + Admin)
│   │   ├── Middleware/    # Role-based authorization
│   │   ├── Requests/     # Form validation
│   │   └── Resources/    # API resources
│   ├── Listeners/        # Event listeners
│   ├── Mail/             # Mailable classes
│   ├── Models/           # Eloquent models
│   └── Providers/        # Service providers
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # Database migrations
│   └── seeders/          # Demo data seeders
├── docker/
│   ├── nginx/            # Nginx configuration
│   └── php/              # Dockerfile, entrypoint, php.ini, opcache
├── resources/
│   ├── css/              # Global styles
│   ├── js/               # Frontend (FSD)
│   └── views/            # Blade templates
├── routes/               # web.php, api.php
├── tests/
│   ├── Feature/          # Integration tests
│   └── Unit/             # Unit tests
├── docker-compose.yml
└── vite.config.ts
```

</details>

<details>
<summary>Available Scripts</summary>

<br>

| Command | Description |
|:--|:--|
| `composer dev` | Start all dev processes in parallel |
| `composer test` | Run backend tests (Pest) |
| `composer setup` | Full project setup |
| `vendor/bin/phpstan analyse` | PHP static analysis |
| `vendor/bin/pint` | PHP auto-formatting |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run test` | Frontend tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run lint:fsd` | FSD architecture check |
| `npm run type-check` | TypeScript type checking |

</details>

<p align="right"><a href="#top">back to top</a></p>

---

## Roadmap

- [ ] **Analytics & Metrics** — sales funnel dashboard, conversions, average order value, LTV
- [ ] **UTM Tags** — ad campaign tracking, traffic source attribution for orders
- [ ] **Cookie Banner & GDPR** — consent management, cookie categorization (analytics, marketing, essential)
- [ ] **Yandex.Metrica Integration** — e-commerce goals, add-to-cart & checkout events
- [ ] **A/B Testing** — split tests for banners, product cards, checkout flow
- [ ] **Order Reports** — Excel export, filtering by date, status, source
- [ ] **Loyalty Program** — bonus points, promo codes, referral system
- [ ] **Notifications** — Telegram/email alerts for orders, returns, low stock
- [ ] **SEO Module** — auto-generated sitemap, OpenGraph meta tags, Schema.org markup
- [ ] **Internationalization** — frontend i18n and content translation via admin panel

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

<p align="right"><a href="#top">back to top</a></p>
