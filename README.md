# 🛒 NXT Store - Modern Full-Stack E-Commerce Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Auth0-EB5424?style=for-the-badge&logo=auth0&logoColor=white" alt="Auth0" />
  <img src="https://img.shields.io/badge/Stripe-6772E5?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 🌐 Live Demo

The project is live and deployed on Vercel:  
👉 **[NXT Store Live Demo](https://nxt-store-ecommerce.vercel.app)**

---

## 📸 Screenshots & Visual Preview

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <h4 align="center">🛍️ Storefront & Catalog</h4>
        <img src="https://raw.githubusercontent.com/muge-yilmaz/NXT-Store-Ecommerce/main/assets/homepage.png" alt="NXT Store Homepage" width="100%" />
       </td>
      <td width="50%">
        <h4 align="center">👤 User Orders Management</h4>
        <img src="https://raw.githubusercontent.com/muge-yilmaz/NXT-Store-Ecommerce/main/assets/user-orders-page.png" alt="User Orders Page" />
      </td>
     </tr>
     <tr>
      <td width="50%">
        <h4 align="center">🛡️ Admin Dashboard Lifecycle</h4>
        <img src="https://raw.githubusercontent.com/muge-yilmaz/NXT-Store-Ecommerce/main/assets/admin-dashboard.png" alt="Admin Dashboard" />
      </td>
      <td width="50%">
        <h4 align="center">🛡️ Admin Order Management</h4>
        <img src="https://raw.githubusercontent.com/muge-yilmaz/NXT-Store-Ecommerce/main/assets/admin-order-management.png" alt="Admin Order Management" />
      </td>
    </tr>
  </table>
</div>

---

## 📌 About The Project

**NXT Store** is a modern full-stack e-commerce platform that combines a seamless user shopping experience with a robust administrator management panel. Built on the Next.js App Router architecture, it features secure authentication, relational database management, integrated payment processing, and end-to-end (E2E) automation testing.

---

## ✨ Key Features

### 👤 Standard User Experience
* **Catalog & Search:** Dynamic product listings, category filtering, and search architecture.
* **Profile Management:** Edit profile information with real-time database persistence.
* **Access Control:** Restricted access to administrative routes with automated redirection.

### 🛡️ Admin Panel (Product Lifecycle)
* **Product CRUD Operations:** Full capabilities to create, edit, and delete products with modal confirmations.
* **Inventory & Category Management:** Manage product stock statuses, pricing, and content details.

### 🔐 Authentication & Security
* **Auth0 Integration:** Secure login, registration, and Role-Based Access Control (RBAC).

### 💳 Payment Infrastructure
* **Stripe & Webhooks:** Secure checkout workflows with background webhook validation.

### 🧪 Quality Assurance & Testing
* **Playwright E2E Tests:** End-to-end automation test suites covering user profiles and admin lifecycles.
* **Unit Testing:** Unit tests for critical core components and business logic services.

---

## 🛠️ Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons |
| **Database & ORM** | PostgreSQL / SQLite, Prisma ORM |
| **Authentication** | Auth0 |
| **Payments** | Stripe SDK & Webhooks |
| **Testing** | Playwright (E2E), Jest / React Testing Library (Unit) |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```text
NXT-Store/
├── ecom-backend/                   # Node.js / Express Backend API Directory
│   ├── src/                        # API routes, controllers, and services
│   └── package.json
├── ecom-nextjs-project/            # Primary Next.js Application Directory (Frontend & App Router)
│   ├── e2e/                        # Playwright E2E Test Suites
│   │   ├── logged-in-admin/        # Admin workflow tests
│   │   └── logged-in-user/         # Standard user workflow tests
│   ├── src/
│   │   ├── app/                    # Next.js App Router (Pages & API Routes)
│   │   ├── components/             # Reusable UI Components
│   │   ├── lib/                    # Validation schemas, utilities, Prisma client
│   │   └── services/               # Business logic & database services
│   ├── prisma/                     # Database schema & migrations
│   └── package.json
├── assets/                         # Documentation & README screenshot assets
└── README.md

```

## 🚀 Getting Started

Follow these steps to set up and run both the backend service and the Next.js frontend application on your local machine:

### 1. Clone the Repository

```bash
git clone [https://github.com/muge-yilmaz/NXT-Store-Ecommerce.git](https://github.com/muge-yilmaz/NXT-Store-Ecommerce.git)
cd NXT-Store-Ecommerce/ecom-nextjs-project

```

### 2. Set Up & Run the Backend (ecom-backend)
Open a terminal window and navigate to the backend service folder:

```bash
cd ecom-backend
npm install
npm run dev

```

### 3. Set Up & Run the Next.js Application (ecom-nextjs-project)
Open a new terminal window and navigate to the Next.js application directory:

```bash
cd ecom-nextjs-project
npm install

```

### 4. Environment Variables Configuration

Create a `.env.local` file inside the `ecom-nextjs-project` directory and populate it with your keys:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nxtstore"

# Auth0 Configuration
AUTH0_SECRET='your-32-byte-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

```

### 5. Database Setup & Start Application Server

```bash
npx prisma generate
npx prisma db push

```

### 6. Start Development Server

```bash
npm run dev

```

Open **`http://localhost:3000`** in your browser to view the application.

## 🧪 Running Tests

### Playwright E2E Tests

To run the automated end-to-end tests inside ecom-nextjs-project:

```bash
cd ecom-nextjs-project

# Run tests in headless mode:
npx playwright test

# Run tests with interactive UI mode:
npx playwright test --ui

```
### Unit Tests
To run the unit test suites:

```bash
cd ecom-nextjs-project
npm run test

```
## 🤝 Contributing

1. Fork the Repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed for educational and portfolio demonstration purposes.

---

## 👩‍💻 Author & Contact

**Müge Yılmaz** — Full-Stack AI Developer & UI/UX Engineer

* **Email:** [mugeyilmaz.web@gmail.com](https://www.google.com/search?q=mailto%3Amugeyilmaz.web%40gmail.com)
* **LinkedIn:** [linkedin.com/in/muge-yilmaz](https://linkedin.com/in/muge-yilmaz)
* **GitHub:** [github.com/muge-yilmaz](https://github.com/muge-yilmaz)
