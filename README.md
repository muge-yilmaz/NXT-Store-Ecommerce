# 🛒 NXT Store — E-Commerce Web Application

A full-stack, modern e-commerce web application engineered for high-performance server-side rendering, secure identity management, dynamic query optimization, and accessible transactional flows.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nxt-store-ecommerce.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/muge-yilmaz/NXT-Store-Ecommerce)

---

## 🚀 Key Features

### 🛍️ Core E-Commerce Experience
- **Dynamic Product Catalog:** Fast client rendering combined with Next.js App Router for server-side optimization.
- **Cart & State Control:** Seamless item addition, updates, and persistent state management across views.
- **Payment Gateway:** Secure checkout workflows powered by **Stripe API** integration.

### 🔐 Authentication & Data Pipelines
- **Identity Platform:** Integrated **Auth0** for user sessions, profile management, and securing private API endpoints.
- **Type-Safe ORM:** **Prisma ORM** layer modeling dynamic schemas and queries with **MongoDB Atlas**.

### 🧪 Reliability & Standards
- **Automated E2E Testing:** Critical transaction flows tested with **Playwright**.
- **Unit Testing:** Modular components and API routes verified with **Jest**.
- **WCAG 2.1 Accessibility:** Responsive Tailwind CSS UI built according to Web Content Accessibility Guidelines.

---

## 🛠 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Backend & DB** | Node.js, RESTful APIs, Prisma ORM, MongoDB Atlas |
| **Auth & Security** | Auth0 Identity Platform |
| **Payments** | Stripe API |
| **Testing** | Playwright (E2E), Jest (Unit) |
| **Deployment** | Vercel |

---

## ⚙️ Architecture & Data Flow


```

[ Client / Browser ]
│
├──► Auth0 (Identity & Session Tokens)
├──► Next.js App Router (SSR & Client State)
│         │
│         ├──► Prisma ORM ──► MongoDB Atlas (Data Persistence)
│         └──► Stripe API (Secure Payment Checkout)
│
[ Playwright / Jest ] ──► Automated Quality Assurance

```

---

## 💻 Local Setup & Installation

Follow these steps to run the application locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/muge-yilmaz/NXT-Store-Ecommerce.git](https://github.com/muge-yilmaz/NXT-Store-Ecommerce.git)
cd NXT-Store-Ecommerce

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your-mongodb-prisma-connection-string"
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

```

### 4. Database Sync & Launch

```bash
# Push Prisma schema to MongoDB
npx prisma db push

# Start development server
npm run dev

```

Open `http://localhost:3000` in your browser.

---

## 🧪 Running Tests

```bash
# Run Unit Tests with Jest
npm run test

# Run End-to-End Tests with Playwright
npx playwright test

```

---

## 👩‍💻 Author & Contact

**Müge Yılmaz** — Full-Stack AI Developer & UI/UX Engineer

* **Email:** [mugeyilmaz.web@gmail.com](https://www.google.com/search?q=mailto%3Amugeyilmaz.web%40gmail.com)
* **LinkedIn:** [linkedin.com/in/muge-yilmaz](https://linkedin.com/in/muge-yilmaz)
* **GitHub:** [github.com/muge-yilmaz](https://github.com/muge-yilmaz)
