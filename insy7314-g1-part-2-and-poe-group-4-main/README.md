# HustleHub+

HustleHub+ is a secure freelance services marketplace platform developed for the African and international freelance economies. The system enables clients to discover, book, and fund verified service listings under an escrow milestone model, allows freelancers to manage listings and track service delivery earnings with tax estimation, and provides administrators with system-wide telemetry, user management, and transactional audit logs.

---
- **video-Link: https://youtu.be/QNN7AQrIksY ** 
## Academic Project Information

- **Module:** Information Systems 3D (INSY7314) / Application Development Security (APDS7311)
- **Group:** Group 4
- **Group Members:**
  - Mthunzi Sibiya (ST10448156)
  - Jean-Remy Mugenga (ST10360194)
  - Nyasha Marova (ST10456923)
- **Live Production URL:** https://hustlehub-api-production.up.railway.app/
- **Interactive Swagger Documentation:** https://hustlehub-api-production.up.railway.app/api-docs/

---

## 1. Overview

The purpose of HustleHub+ is to provide a reliable, secure environment for freelance transactions. In addition to standard marketplace listing and discovery capabilities, the system records financial transactions generated through bookings, maintains cryptographic audit logs, and calculates estimated income and tax obligations for independent contractors.

Security has been architected into every layer rather than introduced retroactively. The solution adheres to OWASP Top 10 recommendations, implementing defense-in-depth through input sanitization, NoSQL injection prevention, security headers, role-based access control (RBAC), and stateless authentication.

---

## 2. User Roles and Workflows

The platform enforces strict role separation across three primary user archetypes:

### 2.1 Clients
- Browse and filter verified service listings across categories (Web Development, Design, AI, Marketing, Writing).
- Inspect expanded gig cards detailing scope, location, delivery timelines, and pricing in South African Rand (ZAR).
- Book services with simulated escrow milestone funding.
- Review order statuses in the Orders management panel and confirm delivery completion to release escrow funds.

### 2.2 Freelancers
- Create, publish, update, and manage service listings.
- Monitor active client bookings and update delivery milestones.
- Access the Freelancer Hub containing real-time earnings telemetry, order progress trackers, and estimated income tax calculations.

### 2.3 Administrators
- Access the centralized Admin Dashboard with real-time system metrics (total registered users, total listings, active bookings, gross platform escrow volume).
- Review all registered user accounts with automated role detection.
- Inspect immutable transactional records and export complete audit trails via CSV for compliance reporting.

---

## 3. Technology Stack

### 3.1 Backend API
- **Runtime:** Node.js (v20+ / v22 LTS)
- **Framework:** Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JSON Web Tokens (jsonwebtoken) with 1-hour expiration
- **Password Security:** Bcrypt with 12 salt rounds
- **API Documentation:** OpenAPI 3.0 via Swagger UI Express
- **Security Middleware:** Helmet, Express Rate Limit, Custom NoSQL & XSS Sanitizer

### 3.2 Frontend Client
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom hardware-accelerated design tokens
- **Icons:** Lucide SVG glyphs
- **Animations:** Hardware-accelerated CSS transitions with GPU layer promotion (`translateZ(0)`)

### 3.3 Infrastructure and CI/CD
- **Cloud Hosting:** Railway Cloud Container Platform
- **CI/CD Pipeline:** GitHub Actions workflow executing automated linting, unit testing, and production builds on push/PR

---

## 4. Architecture and Request Flow

```
+-------------------------------------------------------------------------+
|                  Client Layer (React 19 + Vite Frontend)                |
|             Responsive UI - Dynamic Modals - Orders & Hub Views         |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTPS (TLS 1.3) / JSON Payloads
                                     v
+-------------------------------------------------------------------------+
|                     Express.js API Gateway & Middleware                 |
|   +-----------------------------------------------------------------+   |
|   | Helmet CSP - CORS - Rate Limiting - Input Sanitization (XSS/NoSQL)|   |
|   +-----------------------------------------------------------------+   |
|   | Token Verification (JWT Bearer) - RBAC Role Enforcement Guards  |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
+-----------------------------+               +-----------------------------+
|    Controllers & Business   |               |     Swagger OpenAPI 3.0     |
|   Auth - Gigs - Bookings -  |               |    Interactive API Docs     |
|         Transactions        |               |          /api-docs          |
+--------------+--------------+               +-----------------------------+
               |
               v
+-----------------------------+
|    Mongoose Data Models     |
|   User - Gig - Booking -    |
|         Transaction         |
+--------------+--------------+
               |
               v
+-----------------------------+
|     MongoDB Atlas Cluster   |
|    Persistent Cloud Storage |
+-----------------------------+
```

---

## 5. Security Implementation

### 5.1 Password Hashing with Bcrypt
All user passwords are encrypted using Bcrypt with 12 salt rounds before storage. Plain text passwords are never stored in the database or logged in server telemetry. Bcrypt incorporates an adaptive work factor, providing strong resilience against brute-force attacks and pre-computed rainbow table lookups.

### 5.2 Stateless Token-Based Authentication (JWT)
Upon successful authentication, the server generates a signed JSON Web Token with a minimal claim payload containing the user ID and assigned role (`{ id, role }`). Tokens are configured with a 1-hour expiration window. Incoming requests to protected routes validate the cryptographic signature and expiration timestamp via the `verifyToken` middleware.

### 5.3 Privilege Escalation Prevention
User registration strictly defaults client-submitted roles to authorized baseline values. Attempts to self-assign administrative privileges during registration are intercepted and overridden by the server, ensuring that administrative access cannot be granted through client request tampering.

### 5.4 Input Sanitization & NoSQL Injection Defense
The `sanitizeInput` middleware recursively strips HTML tags from request bodies and query parameters to mitigate Cross-Site Scripting (XSS). Additionally, keys containing MongoDB query operators (such as `$gt`, `$ne`, `$where`, `$regex`) are removed, blocking NoSQL injection vectors.

### 5.5 Security Headers via Helmet
The API applies Helmet to configure standard security headers:
- `Content-Security-Policy (CSP)`: Restricts script, style, and frame sources.
- `X-Frame-Options / frameAncestors`: Protects against clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Strict-Transport-Security (HSTS)`: Enforces secure transport over HTTPS.

### 5.6 Brute-Force Rate Limiting
Authentication endpoints are guarded by a rate limiter configured to restrict rapid-fire authentication attempts, protecting against automated credential stuffing and denial-of-service attempts.

---

## 6. Default Seed and Demonstration Accounts

The database includes pre-configured, verified test accounts for evaluation:

| Role | Email Address | Password | Intended Workflow |
|---|---|---|---|
| **Client** | `mthunzi.sibiya2005@gmail.com` | `Paris123!` | Explore gigs, book services, confirm milestone delivery |
| **Freelancer** | `mthunzi.sibiya2006@gmail.com` | `Paris123!` | Manage published listings, review incoming orders, track tax metrics |
| **Admin** | `mthunzi.sibiya2007@gmail.com` | `Paris123!` | Review platform telemetry, inspect users, export audit logs to CSV |

*Note: The system features email dot-invariance support for Google Mail addresses, ensuring equivalent routing regardless of dot placement.*

---

## 7. Automated Testing and Verification

### 7.1 Unit and Integration Testing (Jest)
The backend test suite is executed using Jest. Test suites validate authentication workflows, RBAC enforcement, data model constraints, input sanitization, rate limiting, and email normalization.

Run tests:
```bash
cd api
npm test
```

### 7.2 Postman API Testing & Newman Execution
Automated Postman test collections are located in the `postman/` directory:
- `postman/HustleHub-Plus-Part1.postman_collection.json`
- `postman/HustleHub-Plus-Part2.postman_collection.json`

To execute via Newman CLI:
```bash
npm install -g newman
newman run postman/HustleHub-Plus-Part2.postman_collection.json -e postman/HustleHub-Plus-Part2.postman_environment.json
```

Detailed scenario matrices and execution evidence are available in `docs/POSTMAN_TESTING_EVIDENCE.md`.

---

## 8. Installation and Local Execution

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB instance (local or MongoDB Atlas connection string)

### 8.1 Backend Setup
```bash
cd api
npm install

# Create environment configuration (.env)
# Required variables:
# PORT=4000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secure_jwt_secret_key
# CLIENT_ORIGIN=http://localhost:5173

# Execute linter and test suite
npm run lint
npm test

# Launch backend in development mode
npm run dev
```

### 8.2 Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
```

The application will be accessible locally at `http://localhost:5173`, with the backend API running at `http://localhost:4000`.
