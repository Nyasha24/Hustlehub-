# HustleHub+ Part 1: Postman API Testing & Verification Evidence

This document provides comprehensive verification evidence for the **HustleHub+ RESTful API** developed for **INSY7314 / APDS7311 (Part 1 - Secure Foundations)**.

---

## 1. Test Suite Summary Table

| Test # | Test Scenario / Endpoint | Method | Input Parameters / Body | Expected Status | Actual Status | Evidence Reference | Result |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **Server Initialization** (`/health`) | `GET` | N/A | `200 OK` | `200 OK` | `node Running.png` | **PASSED** |
| **02** | **Freelancer Registration - Success** (`/api/auth/register`) | `POST` | `fullName`, `email`, `password`, `role: 'freelancer'` | `201 Created` | `201 Created` | `correct Registration.png` | **PASSED** |
| **03** | **Registration - Missing Email** (`/api/auth/register`) | `POST` | `fullName`, `password` (email omitted) | `400 Bad Request` | `400 Bad Request` | `test register without email.png` | **PASSED** |
| **04** | **Registration - Missing Full Name** (`/api/auth/register`) | `POST` | `email`, `password` (fullName omitted) | `400 Bad Request` | `400 Bad Request` | `test rigester without full name.png` | **PASSED** |
| **05** | **Registration - Privilege Escalation Prevention** (`/api/auth/register`) | `POST` | User requesting `role: 'admin'` | `201 Created` (Defaulted to Client) | `201 Created` | `trying to register as a adimin.png` | **PASSED** |
| **06** | **Registration - Duplicate Account** (`/api/auth/register`) | `POST` | Repeated email address | `409 Conflict` | `409 Conflict` | `sendig user that already exists.png` | **PASSED** |
| **07** | **Second User Registration** (`/api/auth/register`) | `POST` | New unique user credentials | `201 Created` | `201 Created` | `register kau.png` | **PASSED** |
| **08** | **Protected Route - Bearer JWT Token** (`/api/auth/me`) | `GET` | `Authorization: Bearer <valid_jwt>` | `200 OK` | `200 OK` | `bear Token Testing.png` | **PASSED** |
| **09** | **Protected Route - Missing Token** (`/api/auth/me`) | `GET` | No Authorization Header | `401 Unauthorized` | `401 Unauthorized` | `me url without token.png` | **PASSED** |
| **10** | **Gig Creation - Authenticated Freelancer** (`/api/gigs`) | `POST` | `title`, `category`, `description`, `price`, `deliveryDays` + JWT | `201 Created` | `201 Created` | `gig Creation.png`, `greating a gig p2.png` | **PASSED** |
| **11** | **Get All Available Gigs - Public** (`/api/gigs`) | `GET` | N/A | `200 OK` | `200 OK` | `getting all avaible gigs.png` | **PASSED** |
| **12** | **Get Gig By Valid ID** (`/api/gigs/:id`) | `GET` | Valid MongoDB `ObjectId` | `200 OK` | `200 OK` | `getting gigs by id.png` | **PASSED** |
| **13** | **Get Non-existent Gig** (`/api/gigs/:id`) | `GET` | Non-existent `ObjectId` | `404 Not Found` | `404 Not Found` | `getting a gig that does not exist.png` | **PASSED** |
| **14** | **Gig Update - Authorized Owner** (`/api/gigs/:id`) | `PUT` | Updated `price` and `description` + JWT | `200 OK` | `200 OK` | `updating a gig.png` | **PASSED** |
| **15** | **MongoDB Database Persistence** | N/A | Atlas Cloud Cluster Verification | Verified | Verified | `values in the dataBase.png` | **PASSED** |

---

## 2. Postman Collection & Automated CLI Execution

The automated Postman Collection v2.1 exports are available at:
* Part 1 Collection: `postman/HustleHub-Plus-Part1.postman_collection.json`
* Part 1 Environment: `postman/HustleHub-Plus-Part1.postman_environment.json`
* Part 2 / POE Collection: `postman/HustleHub-Plus-Part2.postman_collection.json`
* Part 2 / POE Environment: `postman/HustleHub-Plus-Part2.postman_environment.json`

To execute the test collection via command line with Newman:
```bash
npm install -g newman
newman run postman/HustleHub-Plus-Part2.postman_collection.json -e postman/HustleHub-Plus-Part2.postman_environment.json
```

---

## 3. Part 2 & POE Extended Verification Scenarios

| Test # | Test Scenario / Endpoint | Method | Input Parameters / Body | Expected Status | Actual Status | Result |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| **16** | **Google OAuth 2.0 Auth Bridge** (`/api/auth/google`) | `POST` | `idToken`, requested `role` | `200 OK` | `200 OK` | **PASSED** |
| **17** | **Password Reset - OTP Request** (`/api/auth/forgot-password`) | `POST` | `email: 'mthunzisibiya2005@gmail.com'` | `200 OK` | `200 OK` | **PASSED** |
| **18** | **Password Reset - Dot Invariance** (`/api/auth/forgot-password`) | `POST` | `email: 'mthunzi.sibiya2005@gmail.com'` | `200 OK` | `200 OK` | **PASSED** |
| **19** | **Password Reset - OTP Execution** (`/api/auth/reset-password`) | `POST` | `email`, 6-digit `otp`, `newPassword` | `200 OK` | `200 OK` | **PASSED** |
| **20** | **Booking Creation & Escrow Hold** (`/api/bookings`) | `POST` | `gigId`, milestone details + JWT | `201 Created` | `201 Created` | **PASSED** |
| **21** | **Escrow Milestone Completion** (`/api/bookings/:id/complete`) | `PUT` | Authorized Client confirmation | `200 OK` | `200 OK` | **PASSED** |
| **22** | **Admin Platform Audit Telemetry** (`/api/transactions`) | `GET` | Admin Authorization Bearer Token | `200 OK` | `200 OK` | **PASSED** |
| **23** | **Unauthorized Escrow Access Defense** (`/api/transactions`) | `GET` | Non-admin Client Token | `403 Forbidden` | `403 Forbidden` | **PASSED** |