# Software Requirements Specification

## For DriveX - Car Rental Web Application

### Version 1.0

---

## Revision History

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 20/Feb/2026 | 1.0 | Initial SRS document for DriveX Car Rental Web Application | Development Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions, Acronyms and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - 1.4 [References](#14-references)
   - 1.5 [Overview](#15-overview)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Characteristics](#23-user-characteristics)
   - 2.4 [Constraints](#24-constraints)
   - 2.5 [Assumptions and Dependencies](#25-assumptions-and-dependencies)
3. [Specific Requirements](#3-specific-requirements)
   - 3.1 [Functionality](#31-functionality)
   - 3.2 [Usability](#32-usability)
   - 3.3 [Reliability](#33-reliability)
   - 3.4 [Performance](#34-performance)
   - 3.5 [Supportability](#35-supportability)
   - 3.6 [Design Constraints](#36-design-constraints)
   - 3.7 [Online User Documentation and Help System Requirements](#37-online-user-documentation-and-help-system-requirements)
   - 3.8 [Purchased Components](#38-purchased-components)
   - 3.9 [Interfaces](#39-interfaces)
   - 3.10 [Licensing Requirements](#310-licensing-requirements)
   - 3.11 [Legal, Copyright and Other Notices](#311-legal-copyright-and-other-notices)
   - 3.12 [Applicable Standards](#312-applicable-standards)
4. [Supporting Information](#4-supporting-information)

---

## 1. Introduction

### 1.1 Purpose

The purpose of this Software Requirements Specification (SRS) document is to provide a complete and comprehensive description of the requirements for the DriveX Car Rental Web Application. This document fully describes the external behavior of the system, including all functional requirements, non-functional requirements, design constraints, and other factors necessary for the development, testing, and deployment of the application.

This SRS is intended for use by the development team, testers, project managers, and stakeholders involved in the construction and maintenance of the DriveX platform. It serves as a binding agreement between stakeholders regarding what the software will deliver.

### 1.2 Scope

DriveX is a full-stack web-based car rental platform that connects vehicle owners with renters. The application enables three categories of users -- Renters (Users), Vehicle Owners, and Administrators -- to interact through a unified system for listing, searching, booking, paying for, and managing vehicle rentals.

The application consists of two major subsystems:

- **Frontend**: A Single Page Application (SPA) built with React 18 and TypeScript, providing an interactive and responsive user interface for all user roles.
- **Backend**: A RESTful API server built with Python FastAPI, handling business logic, authentication, data persistence, and background task processing.

The system supports the full vehicle rental lifecycle: user registration, vehicle listing by owners, vehicle discovery and search by renters, booking creation with hold-based reservation, simulated payment processing, booking status management, reviews and ratings, notifications, dispute resolution, and administrative oversight with analytics.

The system does not include a physical payment gateway integration (payments are simulated), does not include a mobile native application, and does not include real-time GPS tracking of vehicles.

### 1.3 Definitions, Acronyms and Abbreviations

| Term | Definition |
|------|-----------|
| SPA | Single Page Application - a web application that dynamically rewrites the current page rather than loading entire new pages |
| API | Application Programming Interface - a set of protocols for building and integrating application software |
| REST | Representational State Transfer - an architectural style for distributed hypermedia systems |
| JWT | JSON Web Token - a compact, URL-safe means of representing claims to be transferred between two parties |
| CORS | Cross-Origin Resource Sharing - a mechanism that allows restricted resources on a web page to be requested from another domain |
| CRUD | Create, Read, Update, Delete - the four basic operations of persistent storage |
| TTL | Time To Live - a mechanism that limits the lifespan of data or a process |
| Hold | A temporary reservation placed on a vehicle for a fixed duration, awaiting payment to confirm |
| Idempotency Key | A unique identifier sent with booking requests to prevent duplicate bookings on retry |
| Base Rate | The daily rental charge for a vehicle on weekdays |
| Weekend Rate | An optional premium daily rate applied on Saturdays and Sundays |
| Security Deposit | A refundable amount charged upfront as protection against damage |
| Cleaning Fee | A one-time fee charged per booking for vehicle cleaning |
| Service Fee | A percentage-based platform fee applied on the rental subtotal |
| GST | Goods and Services Tax - indirect tax applied at 18% on the service subtotal |
| RBAC | Role-Based Access Control - access control mechanism based on user roles |
| Motor | An asynchronous Python driver for MongoDB |
| Zustand | A lightweight state management library for React applications |
| Vite | A modern frontend build tool providing fast development server and optimized production builds |
| Tailwind CSS | A utility-first CSS framework for rapidly building custom user interfaces |
| Bcrypt | A password hashing algorithm based on the Blowfish cipher |
| MongoDB | A document-oriented NoSQL database program |
| FastAPI | A modern, high-performance web framework for building APIs with Python |
| Docker | A platform for developing, shipping, and running applications in containers |
| SRS | Software Requirements Specification |

### 1.4 References

| Document / Resource | Description |
|---------------------|-------------|
| IEEE 830-1998 | IEEE Recommended Practice for Software Requirements Specifications |
| FastAPI Documentation (https://fastapi.tiangolo.com) | Official documentation for the FastAPI framework |
| React Documentation (https://react.dev) | Official documentation for the React library |
| MongoDB Manual (https://www.mongodb.com/docs/manual/) | Official MongoDB documentation |
| Tailwind CSS Documentation (https://tailwindcss.com/docs) | Official Tailwind CSS documentation |
| Pydantic v2 Documentation (https://docs.pydantic.dev) | Data validation library used in the backend |
| JSON Web Token RFC 7519 | Internet standard for creating access tokens |
| Motor Documentation (https://motor.readthedocs.io) | Async MongoDB driver for Python |

### 1.5 Overview

The remainder of this SRS document is organized as follows:

- **Section 2 -- Overall Description**: Provides a high-level overview of the product, including its perspective within the broader ecosystem, a summary of product functions, user characteristics, constraints, and assumptions.
- **Section 3 -- Specific Requirements**: Contains the detailed software requirements organized by functionality, usability, reliability, performance, supportability, design constraints, interfaces, licensing, legal notices, and applicable standards.
- **Section 4 -- Supporting Information**: Contains supplementary material including a data model summary and API endpoint reference.

---

## 2. Overall Description

### 2.1 Product Perspective

DriveX is a self-contained web application designed as a peer-to-peer vehicle rental marketplace. It operates as an independent system comprising a client-side frontend, a server-side backend API, and a database layer. The system is not a replacement for or extension of any existing system; it is a new, standalone product.

The system architecture follows a three-tier model:

1. **Presentation Tier (Frontend)**: React 18 SPA served via Vite development server or Nginx in production. Communicates with the backend exclusively through RESTful HTTP API calls.
2. **Application Tier (Backend)**: Python FastAPI application handling authentication, authorization, business logic, pricing calculations, background task scheduling, and data access. Exposes a RESTful API at the `/api` prefix.
3. **Data Tier**: MongoDB 7 document database storing all persistent data across eight collections: `users`, `vehicles`, `bookings`, `payments`, `reviews`, `notifications`, `audit_logs`, and `config`.

The system also integrates Redis 7 as a supporting service for rate limiting and caching. The entire stack is containerized using Docker Compose for deployment, consisting of four services: MongoDB, Redis, Backend (FastAPI), and Frontend (React/Nginx).

### 2.2 Product Functions

The major functions of the DriveX system are:

1. **User Management**: Registration, authentication, profile management, and role-based access (User, Owner, Admin).
2. **Vehicle Management**: Vehicle listing creation, image upload, specification and pricing configuration, status management (active, paused, removed), and availability blocking by owners.
3. **Vehicle Discovery**: Full-text search, multi-criteria filtering (fuel type, transmission, seat count, price range, location), sorting, and paginated browsing.
4. **Booking Management**: Hold-based booking creation with idempotency, availability conflict detection, automatic pricing calculation, booking confirmation, cancellation with tiered refund policy, status lifecycle transitions (draft, pending, held, confirmed, active, completed, cancelled, disputed, refunded, archived).
5. **Payment Processing**: Simulated payment charge, payment failure simulation, refund processing, and payment history per booking.
6. **Review System**: Rating (1-5 stars) and comment submission for completed bookings, average rating calculation per vehicle.
7. **Notification System**: In-app notifications for booking events, pagination, and bulk mark-as-read.
8. **Admin Dashboard**: Platform analytics (user counts, booking stats, revenue, conversion rate), monthly revenue trend charts, top vehicles by bookings, booking status distribution, vehicle moderation (approve/reject), user management, audit log review, and CSV export of booking data.
9. **Background Task Processing**: Automated hold expiry, booking activation on start date, booking completion on end date, and archival of old bookings.
10. **Audit Logging**: Immutable record of all significant system actions for compliance and debugging.

### 2.3 User Characteristics

The system serves three distinct user roles:

1. **Renter (User Role)**:
   - General public users who want to rent vehicles.
   - Expected to have basic internet browsing skills.
   - Primary activities: browsing vehicles, creating bookings, making payments, submitting reviews, managing personal bookings.
   - Access to: Vehicle search, vehicle details, user dashboard, booking history, profile management, notifications.

2. **Vehicle Owner (Owner Role)**:
   - Individuals or businesses who own vehicles and want to rent them out.
   - Expected to have moderate technical skills for managing listings.
   - Primary activities: creating and managing vehicle listings, uploading images, setting pricing and availability, monitoring bookings for their vehicles, tracking earnings.
   - Access to: Owner dashboard, vehicle CRUD operations, image upload, booking management for owned vehicles, profile management, notifications.

3. **Administrator (Admin Role)**:
   - Platform operators responsible for overseeing the entire system.
   - Expected to have advanced technical and business understanding.
   - Primary activities: viewing analytics, moderating vehicles (approve/reject), managing users, reviewing audit logs, resolving disputes, exporting data, processing refunds.
   - Access to: Admin dashboard, analytics, all vehicle and booking data, user management, audit logs, CSV export, dispute resolution, refund processing.

### 2.4 Constraints

1. **Technology Stack Constraint**: The frontend must be built with React 18 and TypeScript, and the backend must use Python FastAPI with MongoDB as the database.
2. **Authentication Constraint**: The system uses stateless JWT-based authentication. Token management is client-side (sessionStorage); server-side session management is not implemented.
3. **Payment Constraint**: Payment processing is simulated (mock). No real payment gateway (such as Razorpay, Stripe, or PayPal) is integrated. The system uses a mock card method that always succeeds unless the method name contains "fail".
4. **Single Currency Constraint**: The system operates with Indian Rupees (INR) as the default currency.
5. **Image Storage Constraint**: Vehicle images are stored on the local file system in the `/uploads` directory. No cloud storage service (such as AWS S3 or Cloudinary) is integrated.
6. **Deployment Constraint**: The application is containerized using Docker Compose and designed to run on a single server. No cloud-native auto-scaling, load balancing, or CDN integration is implemented.
7. **Email Constraint**: The system does not send email notifications. All notifications are in-app only.
8. **Rate Limiting**: API rate limiting is enforced using SlowAPI based on client IP address.

### 2.5 Assumptions and Dependencies

**Assumptions:**

1. Users have access to a modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
2. Users have a stable internet connection to access the web application.
3. The server environment has Docker and Docker Compose installed for deployment.
4. MongoDB 7 and Redis 7 are available either as Docker containers or as standalone services.
5. Vehicle owners will provide accurate information about their vehicles.
6. Users will complete the booking payment within the hold TTL window (default: 15 minutes).
7. The tax rate (GST) is fixed at 18% and the service fee at 5% unless changed via environment configuration.
8. The system operates in a single timezone context (UTC) for all date/time calculations.

**Dependencies:**

1. **MongoDB 7**: Required for all data persistence. The system cannot function without MongoDB.
2. **Redis 7**: Required for rate limiting functionality. The application can start without Redis but rate limiting will not work.
3. **Node.js and npm**: Required for building the frontend application.
4. **Python 3.10+**: Required for running the backend application.
5. **Docker and Docker Compose**: Required for containerized deployment.
6. **External Image URLs**: Seed data references external image URLs from Unsplash. These images require internet connectivity to load.

---

## 3. Specific Requirements

### 3.1 Functionality

#### 3.1.1 User Registration

**Description**: The system shall allow new users to create accounts by providing their name, email address, password, and selecting a role (User or Owner).

**Inputs**:
- Name: String, 2 to 100 characters, required.
- Email: Valid email address format, required, must be unique in the system.
- Password: String, 6 to 128 characters, required.
- Role: One of "user" or "owner", defaults to "user".

**Processing**:
- The system shall validate that the email is not already registered.
- The system shall hash the password using bcrypt before storing.
- The system shall create a user document with `verified` set to `false`.
- The system shall generate a JWT access token containing the user ID and role.
- The system shall create an audit log entry for the signup action.

**Outputs**:
- On success: HTTP 201 response with the access token and user profile object.
- On duplicate email: HTTP 400 response with "Email already registered" error.

#### 3.1.2 User Login

**Description**: The system shall allow registered users to authenticate using their email and password.

**Inputs**:
- Email: Valid email address, required.
- Password: String, required.

**Processing**:
- The system shall look up the user by email in the database.
- The system shall verify the provided password against the stored bcrypt hash.
- The system shall generate a JWT access token valid for 60 minutes (configurable).

**Outputs**:
- On success: HTTP 200 response with the access token and user profile object.
- On invalid credentials: HTTP 401 response with "Invalid email or password" error.

#### 3.1.3 User Profile Retrieval

**Description**: The system shall allow authenticated users to retrieve their profile information.

**Inputs**: Valid JWT access token in the Authorization header.

**Processing**:
- The system shall decode the JWT token and extract the user ID.
- The system shall fetch the user document from the database, excluding the password hash.

**Outputs**:
- On success: HTTP 200 response with the user profile (ID, name, email, role, verified status, creation date, profile metadata).
- On invalid/expired token: HTTP 401 response.

#### 3.1.4 Vehicle Listing Creation

**Description**: The system shall allow users with the "owner" or "admin" role to create new vehicle listings.

**Inputs**:
- Title: String, 3 to 200 characters, required.
- Description: String, up to 2000 characters, optional (defaults to empty).
- Specs: Object containing seats (integer, default 5), transmission ("auto" or "manual"), fuel type ("petrol", "diesel", "electric", or "hybrid"), make, model, year, and color.
- Pricing: Object containing base rate (required), currency (default "INR"), weekend rate (optional), minimum days (default 1), discounts (optional weekly/monthly percentages), cleaning fee (default 0), and security deposit (default 0).
- Location: String, optional.
- Approval Mode: "auto" or "manual" (default "auto").
- Availability Blocks: Array of blocked date ranges with type ("blocked" or "maintenance").

**Processing**:
- The system shall verify the user has "owner" or "admin" role.
- The system shall create a vehicle document with status set to "active".
- The system shall store the owner's user ID as the vehicle's `ownerId`.
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 201 response with the created vehicle document.
- On insufficient permissions: HTTP 403 response.

#### 3.1.5 Vehicle Image Upload

**Description**: The system shall allow vehicle owners to upload images for their vehicle listings.

**Inputs**:
- Vehicle ID: Valid MongoDB ObjectId, required.
- Files: One or more image files (JPEG, PNG, or WebP format), required.

**Processing**:
- The system shall verify the user is the vehicle owner or an admin.
- The system shall validate each file's content type (image/jpeg, image/png, or image/webp).
- The system shall enforce a maximum file size of 5 MB per image (configurable).
- The system shall generate unique filenames using UUID and save files to the `/uploads/{vehicleId}/` directory.
- The first image uploaded to a vehicle with no existing images shall be marked as the primary image.
- The system shall append new image references to the vehicle's `images` array.

**Outputs**:
- On success: HTTP 201 response with the uploaded image metadata.
- On invalid file type: HTTP 400 response.
- On file too large: HTTP 400 response.
- On insufficient permissions: HTTP 403 response.

#### 3.1.6 Vehicle Search and Filtering

**Description**: The system shall allow all users (authenticated or not) to search and browse available vehicles with multiple filter criteria.

**Inputs (all optional)**:
- query: Full-text search string against vehicle title and description.
- fuel: Filter by fuel type ("petrol", "diesel", "electric", "hybrid").
- transmission: Filter by transmission type ("auto", "manual").
- seats: Minimum number of seats (greater than or equal to).
- min_price: Minimum base rate.
- max_price: Maximum base rate.
- location: Location substring (case-insensitive regex match).
- ownerId: Filter by specific owner (shows all statuses for that owner).
- page: Page number for pagination (default 1).
- limit: Number of results per page (default 12, maximum 100).
- sort: Sort order -- "createdAt" (default, newest first), "price_asc" (lowest price first), or "price_desc" (highest price first).

**Processing**:
- If no `ownerId` is provided, the system shall filter only vehicles with "active" status.
- If `ownerId` is provided, the system shall return all vehicles belonging to that owner regardless of status.
- The system shall apply all specified filters to the database query.
- The system shall calculate pagination metadata (total count, current page, total pages).
- The system uses a MongoDB text index on title and description fields for full-text search.

**Outputs**:
- HTTP 200 response containing: `items` (array of vehicle objects), `total` (total matching count), `page` (current page), `pages` (total pages).

#### 3.1.7 Vehicle Detail Retrieval

**Description**: The system shall allow users to view complete details of a specific vehicle, including its booked date ranges.

**Inputs**: Vehicle ID (path parameter).

**Processing**:
- The system shall fetch the vehicle document by ID.
- The system shall query all bookings for this vehicle with status "confirmed", "active", or "held" to build a list of booked date ranges.
- The system shall include the booked ranges in the response.

**Outputs**:
- On success: HTTP 200 response with vehicle details and `bookedRanges` array.
- On not found: HTTP 404 response.

#### 3.1.8 Vehicle Update

**Description**: The system shall allow vehicle owners to update their vehicle listing details.

**Inputs**:
- Vehicle ID: Path parameter.
- Any combination of: title, description, specs, pricing, status, location, approval mode, availability blocks.

**Processing**:
- The system shall verify the user is the vehicle owner or an admin.
- The system shall apply only the provided (non-null) fields as updates.
- The system shall set the `updatedAt` timestamp.
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 200 response with the updated vehicle document.
- On not found: HTTP 404 response.
- On insufficient permissions: HTTP 403 response.

#### 3.1.9 Vehicle Deletion

**Description**: The system shall allow vehicle owners to soft-delete their vehicles by setting the status to "removed".

**Processing**:
- The system shall verify the user is the vehicle owner or an admin.
- The system shall check for future bookings (confirmed, active, or held with end date in the future).
- If future bookings exist and the user is not an admin, the system shall reject the deletion.
- On success, the system shall set the vehicle status to "removed".

**Outputs**:
- On success: HTTP 200 with confirmation message.
- On conflict (future bookings): HTTP 409 response with the count of active bookings.
- On insufficient permissions: HTTP 403 response.

#### 3.1.10 Booking Creation

**Description**: The system shall allow authenticated users to create a booking (reservation) for a vehicle.

**Inputs**:
- idempotencyKey: String, minimum 5 characters, required. Used to prevent duplicate bookings on retry.
- vehicleId: Valid MongoDB ObjectId, required.
- startDate: ISO datetime, required.
- endDate: ISO datetime, required.
- paymentMethod: String, default "mock_card".

**Processing**:
- The system shall first check for an existing booking with the same idempotency key and return it if found (idempotent behavior).
- The system shall validate that the start date is before the end date.
- The system shall validate that the start date is not in the past (with a 1-hour grace period).
- The system shall perform an atomic availability check against:
  - Vehicle blocked/maintenance date ranges.
  - Existing bookings with status "confirmed", "active", or "held" that overlap the requested dates.
- The system shall calculate the price breakdown server-side using the vehicle's pricing configuration:
  - Per-day rates (base rate on weekdays, weekend rate on Saturdays/Sundays if configured).
  - Long-term discounts: 10% weekly discount for bookings of 7+ days, 20% monthly discount for 30+ days (if configured).
  - Cleaning fee (one-time).
  - Service fee (5% of subtotal after discount).
  - Security deposit.
  - Tax (18% GST on subtotal).
- The system shall set the initial status based on the vehicle's approval mode:
  - "auto" approval mode: Status set to "held" with a `holdExpiresAt` timestamp (default 15 minutes).
  - "manual" approval mode: Status set to "pending" (awaiting owner approval).
- The system shall record an audit log entry and send a notification to the vehicle owner.

**Outputs**:
- On success: HTTP 201 response with the booking document and `nextSteps` guidance.
- On date conflict: HTTP 409 response.
- On invalid dates: HTTP 400 response.

#### 3.1.11 Booking Confirmation

**Description**: The system shall allow booking confirmation after successful payment or owner approval.

**Processing**:
- The system shall verify the user is the booking's renter, the vehicle owner, or an admin.
- The system shall verify the booking is in "held" or "pending" status.
- For held bookings, the system shall check if the hold has expired. If expired, the booking is automatically cancelled.
- The system shall re-check vehicle availability atomically before confirming.
- If the booking start date has already passed, the status shall be set to "active" instead of "confirmed".
- The system shall send a confirmation notification to the renter.

**Outputs**:
- On success: HTTP 200 response with the updated booking.
- On expired hold: HTTP 400 response with "Hold has expired" error.
- On availability conflict: HTTP 409 response.

#### 3.1.12 Booking Cancellation

**Description**: The system shall allow renters, vehicle owners, or admins to cancel bookings with automatic refund calculation.

**Processing**:
- The system shall verify the booking is in a cancellable status: "draft", "pending", "held", or "confirmed".
- For confirmed or held bookings, the system shall calculate the refund amount based on the cancellation policy:
  - More than 48 hours before start: Full refund of the refundable amount.
  - 24 to 48 hours before start: 50% refund of the refundable amount.
  - Less than 24 hours before start: No refund.
  - Security deposit is always refunded regardless of timing.
- The system shall update the booking status to "cancelled" and record the cancel reason.
- The system shall send a notification to the other party (renter or owner).

**Outputs**:
- On success: HTTP 200 response with the updated booking and refund amount.
- On invalid status: HTTP 400 response.

#### 3.1.13 Booking Dispute

**Description**: The system shall allow renters or vehicle owners to open a dispute on an active or completed booking.

**Processing**:
- The system shall verify the booking is in "active" or "completed" status.
- The system shall set the booking status to "disputed".
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 200 response with confirmation.
- On invalid status: HTTP 400 response.

#### 3.1.14 Dispute Resolution (Admin)

**Description**: The system shall allow administrators to resolve booking disputes.

**Inputs**:
- resolution: "refund" or "no_refund", required.
- notes: Optional admin notes.

**Processing**:
- The system shall verify the user has the "admin" role.
- The system shall verify the booking is in "disputed" status.
- If resolution is "refund", the system shall calculate and record the refund amount and set status to "refunded".
- If resolution is "no_refund", the system shall set status to "completed" with no refund.
- The system shall record an audit log entry and notify the renter.

**Outputs**:
- On success: HTTP 200 response with the updated booking.
- On insufficient permissions: HTTP 403 response.

#### 3.1.15 Booking Listing

**Description**: The system shall allow authenticated users to view their bookings with filtering and pagination.

**Processing**:
- Regular users see only their own bookings.
- Owners see bookings for their vehicles and their own bookings.
- Admins see all bookings in the system.
- Optional filter by booking status.
- Results are sorted by creation date (newest first) with pagination.

**Outputs**:
- HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.16 Payment Charge

**Description**: The system shall simulate a payment charge for a booking.

**Inputs**:
- bookingId: Valid MongoDB ObjectId, required.
- method: Payment method string, default "mock_card".
- amount: Payment amount (float), required.

**Processing**:
- The system shall verify the booking is in "held" or "pending" status.
- The system shall verify the user is the booking's renter or an admin.
- For method "mock_card" (or any method not containing "fail"): payment succeeds with a generated transaction reference.
- For any method containing "fail": payment is marked as failed (for testing).
- On successful payment: booking status is updated to "confirmed".
- On failed payment: booking status is updated to "cancelled".
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 201 response with payment details including status and transaction reference.
- On invalid booking status: HTTP 400 response.

#### 3.1.17 Payment Refund (Admin)

**Description**: The system shall allow administrators to process refunds for bookings.

**Inputs**:
- bookingId: Required.
- amount: Optional (defaults to full original payment amount).

**Processing**:
- The system shall verify the user has the "admin" role.
- The system shall find the original successful payment for the booking.
- The system shall validate the refund amount does not exceed the original payment.
- The system shall create a refund payment record with negative amount.
- The system shall update the original payment status to "refunded".
- The system shall update the booking status to "refunded" with the refund amount.

**Outputs**:
- On success: HTTP 200 response with refund details.
- On no payment found: HTTP 404 response.

#### 3.1.18 Payment History

**Description**: The system shall allow users to view all payments associated with a specific booking.

**Processing**:
- The system shall verify the user is the renter, vehicle owner, or an admin.
- The system shall return all payment records for the booking, sorted by creation date (newest first).

**Outputs**:
- HTTP 200 response with `payments` array.

#### 3.1.19 Review Creation

**Description**: The system shall allow renters to submit a review for a completed booking.

**Inputs**:
- bookingId: Required.
- vehicleId: Required.
- rating: Integer from 1 to 5, required.
- comment: String up to 1000 characters, optional.

**Processing**:
- The system shall verify the user is the booking's renter.
- The system shall verify the booking status is "completed" or "archived".
- The system shall prevent duplicate reviews (one review per user per booking).
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 201 response with the review document.
- On duplicate review: HTTP 409 response.
- On invalid booking status: HTTP 400 response.

#### 3.1.20 Vehicle Reviews Retrieval

**Description**: The system shall allow users to view all reviews for a specific vehicle.

**Processing**:
- The system shall fetch all reviews for the vehicle, sorted by creation date (newest first).
- The system shall calculate the average rating across all reviews.

**Outputs**:
- HTTP 200 response with `reviews` array, `averageRating`, and `count`.

#### 3.1.21 Notifications Listing

**Description**: The system shall allow authenticated users to view their in-app notifications.

**Inputs**:
- page: Page number (default 1).
- limit: Results per page (default 20, max 50).

**Processing**:
- The system shall fetch notifications for the current user, sorted by creation date (newest first).
- The system shall calculate total count and unread count separately.

**Outputs**:
- HTTP 200 response with `items`, `total`, `unread`/`unreadCount`, and `page`.

#### 3.1.22 Mark Notifications as Read

**Description**: The system shall allow users to mark specific notifications or all notifications as read.

**Inputs**:
- ids: Optional array of notification IDs. If omitted, all notifications for the user are marked as read.

**Processing**:
- The system shall update the `read` field to `true` for matching notifications belonging to the current user.

**Outputs**:
- HTTP 200 response with `modified` count.

#### 3.1.23 Admin Analytics

**Description**: The system shall provide aggregated analytics data for administrators.

**Inputs**:
- range: "weekly", "monthly", or "yearly" (default "monthly").

**Processing**:
- The system shall calculate summary statistics: total users, total owners, total active vehicles, total bookings.
- The system shall calculate period-specific statistics: bookings created, cancelled, completed, revenue, and conversion rate.
- The system shall aggregate monthly revenue trend data (last 12 months) using MongoDB aggregation pipeline.
- The system shall determine top 5 vehicles by booking count.
- The system shall calculate booking status distribution.

**Outputs**:
- HTTP 200 response with `summary`, `period`, `monthlyTrend`, `topVehicles`, and `statusDistribution`.

#### 3.1.24 Admin Vehicle Moderation

**Description**: The system shall allow administrators to approve or reject vehicle listings.

**Processing for Approve**:
- The system shall set the vehicle status to "active".
- The system shall record an audit log entry.

**Processing for Reject**:
- The system shall take a `reason` parameter.
- The system shall set the vehicle status to "removed" and record the rejection reason.
- The system shall record an audit log entry.

**Outputs**:
- HTTP 200 response with confirmation message.

#### 3.1.25 Admin User Management

**Description**: The system shall allow administrators to list all users with optional role filtering and pagination.

**Processing**:
- The system shall exclude password hashes from the response.
- The system shall support filtering by role and pagination.

**Outputs**:
- HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.26 Admin Booking Management and CSV Export

**Description**: The system shall allow administrators to list all bookings with filters and export booking data as CSV.

**Processing for Listing**:
- The system shall support filtering by status, start date, and end date.
- The system shall support pagination.

**Processing for CSV Export**:
- The system shall generate a CSV file containing: Booking ID, Vehicle ID, User ID, Owner ID, Start Date, End Date, Days, Total Amount, Status, and Created At.
- The system shall return the CSV as a streaming response with appropriate content-disposition header.

**Outputs**:
- Listing: HTTP 200 response with paginated booking data.
- Export: Streaming CSV file download.

#### 3.1.27 Audit Log Retrieval

**Description**: The system shall allow administrators to view the audit trail of system actions.

**Processing**:
- The system shall support filtering by action type.
- The system shall support pagination.
- Each audit log entry contains: actor ID, action, resource type, resource ID, optional payload, and timestamp.

**Possible audit actions recorded**: user_signup, vehicle_create, vehicle_update, vehicle_delete, vehicle_approve, vehicle_reject, booking_create, booking_confirm, booking_cancel, booking_dispute, booking_resolve, payment_charge, payment_refund, review_create, hold_expired.

**Outputs**:
- HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.28 Background Task Processing

**Description**: The system shall run automated background tasks on a periodic schedule.

**Tasks (executed every 60 seconds)**:

1. **Hold Expiry**: The system shall find all bookings with status "held" where `holdExpiresAt` has passed. For each, the system shall set the status to "cancelled" with reason "Hold expired", record an audit log, and send a notification to the renter.

2. **Booking Activation**: The system shall find all bookings with status "confirmed" where `startDate` has passed. The system shall batch-update their status to "active".

3. **Booking Completion**: The system shall find all bookings with status "active" where `endDate` has passed. The system shall batch-update their status to "completed".

4. **Archival** (configured but not called in periodic loop): The system can archive bookings that have been completed, cancelled, or refunded for more than 90 days by setting their status to "archived".

#### 3.1.29 Database Indexing

**Description**: The system shall create database indexes on application startup to ensure query performance.

**Indexes created**:
- `users`: Unique index on `email`.
- `vehicles`: Indexes on `ownerId`, `status`, and a text index on `title` and `description`.
- `bookings`: Indexes on `vehicleId`, `userId`, `ownerId`, `status`, `holdExpiresAt`, unique index on `idempotencyKey`, and a compound index on `(vehicleId, startDate, endDate)`.
- `payments`: Index on `bookingId`.
- `notifications`: Index on `userId` and compound index on `(userId, read)`.
- `audit_logs`: Indexes on `actorId`, `action`, and `createdAt`.

#### 3.1.30 Health Check

**Description**: The system shall provide a health check endpoint at `GET /api/health` that returns the application status and version without requiring authentication.

**Outputs**: `{"status": "healthy", "version": "1.0.0"}`

---

### 3.2 Usability

#### 3.2.1 Responsive Design

The user interface shall be fully responsive and functional across desktop (1280px+), tablet (768px-1279px), and mobile (320px-767px) screen widths. The layout shall adapt using CSS grid and flexbox with Tailwind CSS responsive breakpoints (sm, md, lg, xl).

#### 3.2.2 Navigation Consistency

The application shall provide a persistent navigation bar on all pages with access to: Home, Search/Browse, Dashboard (role-specific), Notifications, and User Profile. The navbar shall adapt for mobile with a collapsible menu and shall indicate the currently active page.

#### 3.2.3 Loading State Feedback

All data-fetching operations shall display skeleton loading placeholders (shimmer animation) while data is being retrieved. The system provides four skeleton components: VehicleCardSkeleton, BookingRowSkeleton, StatCardSkeleton, and PageSkeleton.

#### 3.2.4 Error State Communication

When data loading fails, the system shall display a dedicated error state component with: an error icon, a descriptive error message, and a "Try again" button to retry the failed operation.

#### 3.2.5 Empty State Guidance

When a list or collection contains no items, the system shall display an empty state component with: a relevant icon, a descriptive title, a helpful message, and an optional action button (such as "Browse Vehicles" when a user has no bookings).

#### 3.2.6 Toast Notifications

The system shall display toast notifications (non-blocking, auto-dismissing messages) for user actions such as successful booking creation, payment completion, errors, and login/logout events. Toasts shall appear in the top-right corner and auto-dismiss after 3 seconds.

#### 3.2.7 Form Validation Feedback

Registration and login forms shall provide immediate visual feedback. The signup form shall include:
- A password strength indicator with four colored segments (red for weak, amber for fair, green for strong).
- Inline validation messages for invalid inputs.

#### 3.2.8 Booking Progress Indicator

The booking flow shall display a multi-step progress indicator (stepper component) showing: the current step highlighted, completed steps with a check mark, and upcoming steps grayed out. Steps are connected by visual lines that change color on completion.

#### 3.2.9 Status Visualization

Booking statuses shall be displayed as color-coded badges with a colored dot indicator and label text:
- Neutral (gray): Draft, Archived
- Warning (amber): Pending, On Hold
- Success (green): Confirmed, Completed
- Info (blue): Active, Refunded
- Danger (red): Cancelled, Disputed

#### 3.2.10 Accessibility

All interactive elements shall have appropriate `aria-label` attributes. The booking stepper shall use `aria-current="step"` for the current step. Vehicle cards shall use `role="article"` with descriptive aria labels. Buttons and links shall be keyboard accessible.

---

### 3.3 Reliability

#### 3.3.1 Idempotent Booking Creation

The system shall support idempotent booking creation using a client-generated idempotency key. If a booking request is received with an idempotency key that already exists in the database, the system shall return the existing booking instead of creating a duplicate. This prevents double bookings due to network retries or duplicate form submissions.

#### 3.3.2 Atomic Availability Checking

Before creating or confirming a booking, the system shall perform an atomic availability check against the vehicle's blocked date ranges and all existing bookings (confirmed, active, or held). This check occurs:
- During booking creation.
- During booking confirmation (re-check before finalizing).

#### 3.3.3 Hold Expiry Safety Net

The background task system shall run every 60 seconds to detect and cancel bookings where the hold timer has expired. This ensures that held inventory is released even if the client-side timer fails or the user abandons the booking flow.

#### 3.3.4 Graceful Error Handling

The backend shall implement a global exception handler that catches all unhandled exceptions and returns a generic HTTP 500 response with "Internal server error" message, preventing internal stack traces from being exposed to clients.

#### 3.3.5 Authentication Token Handling

The frontend shall automatically detect HTTP 401 (Unauthorized) responses and redirect the user to the login page. The auth store shall clear the stored token on detection of an invalid or expired token. The system shall not redirect if the user is already on an authentication page.

#### 3.3.6 Data Consistency on Cancellation

When a booking is cancelled, the system shall atomically update the booking status, record the cancellation reason, and calculate the refund amount in a single database operation. The system shall ensure the hold expiry and cancellation checks are performed before confirming any booking.

---

### 3.4 Performance

#### 3.4.1 API Response Time

Under normal load conditions (single server, fewer than 100 concurrent users), API response times shall meet the following targets:
- Simple read operations (GET profile, GET notifications): Less than 200 milliseconds.
- List operations with pagination (GET vehicles, GET bookings): Less than 500 milliseconds.
- Write operations (POST booking, POST payment): Less than 1000 milliseconds.
- Aggregation operations (GET admin analytics): Less than 2000 milliseconds.

#### 3.4.2 Database Query Optimization

All frequently queried fields shall be indexed (as specified in Section 3.1.29). Text search on vehicle title and description shall utilize MongoDB's built-in text index. Pagination shall be implemented using skip/limit to avoid loading entire collections into memory.

#### 3.4.3 Frontend Bundle Size

The frontend production build shall maintain a total JavaScript bundle size under 800 KB (before gzip) and CSS under 50 KB (before gzip). Gzipped transfer sizes shall be under 230 KB for JavaScript and under 10 KB for CSS.

#### 3.4.4 Image Loading Performance

Vehicle images in listing cards shall use the `loading="lazy"` attribute for deferred loading. Image URLs in seed data shall include width parameters (`w=800`) to request appropriately sized images from the image hosting service.

#### 3.4.5 Background Task Frequency

Background tasks (hold expiry, booking activation, booking completion) shall execute every 60 seconds. This interval ensures timely status transitions without excessive database polling.

#### 3.4.6 Pagination Limits

API endpoints shall enforce the following pagination limits to prevent excessive data retrieval:
- Vehicles: Maximum 100 items per page (default 12).
- Bookings: Maximum 200 items per page (default 20).
- Notifications: Maximum 50 items per page (default 20).
- Audit Logs: Maximum 100 items per page (default 50).
- Admin Users: Maximum 100 items per page (default 20).

#### 3.4.7 Rate Limiting

The API shall implement rate limiting using SlowAPI based on client IP address to prevent abuse. Rate limiting protects against denial-of-service attacks and API abuse patterns.

---

### 3.5 Supportability

#### 3.5.1 Modular Architecture

The backend shall follow a modular structure:
- `app/models.py`: All Pydantic data models and schemas.
- `app/config.py`: Environment-based configuration using Pydantic Settings.
- `app/database.py`: Database connection and collection references.
- `app/auth.py`: Authentication and authorization utilities.
- `app/pricing.py`: Pricing calculation and refund logic.
- `app/tasks.py`: Background task definitions.
- `app/audit.py`: Audit logging utility.
- `app/routes/`: Individual route modules for each resource (auth, vehicles, bookings, payments, admin, notifications, reviews).

The frontend shall follow a component-based structure:
- `src/components/`: Reusable UI components (Navbar, Footer, Layout, VehicleCard, Skeletons, States, BookingStepper, StatusBadge, ProtectedRoute).
- `src/pages/`: Page-level components (Landing, Auth, SearchPage, VehicleDetails, UserDashboard, OwnerDashboard, AdminDashboard, ProfilePage, NotificationsPage).
- `src/store/`: State management (authStore).
- `src/lib/`: API client configuration.
- `src/types/`: TypeScript type definitions.

#### 3.5.2 TypeScript Type Safety

The frontend shall use TypeScript strict mode for compile-time type checking. All data models (User, Vehicle, Booking, Payment, Review, Notification, AuditLog) shall have corresponding TypeScript interfaces. API responses shall be typed to catch integration errors at build time.

#### 3.5.3 Environment-Based Configuration

All configurable values shall be loaded from environment variables (via `.env` file), including:
- `MONGO_URI`: MongoDB connection string.
- `DB_NAME`: Database name.
- `JWT_SECRET`: Secret key for JWT signing.
- `JWT_ALGORITHM`: Algorithm for JWT (default HS256).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry duration (default 60).
- `REDIS_URL`: Redis connection URL.
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins.
- `UPLOAD_DIR`: Directory path for uploaded files.
- `MAX_IMAGE_SIZE_MB`: Maximum image upload size (default 5).
- `HOLD_TTL_MINUTES`: Booking hold duration (default 15).
- `TAX_PERCENTAGE`: GST rate (default 18.0).
- `SERVICE_FEE_PERCENTAGE`: Platform fee rate (default 5.0).
- `SENTRY_DSN`: Optional Sentry error tracking DSN.

#### 3.5.4 API Documentation

The backend shall automatically generate API documentation available at:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI JSON schema: `/api/openapi.json`

#### 3.5.5 Seed Data Generation

The system shall include a seed data script (`seed.py`) that generates realistic demo data using the Faker library:
- 1 admin user, 8 vehicle owners, 15 regular users with known credentials.
- 30 vehicles with randomized specs, pricing, images, and locations across 12 Indian cities.
- 100 bookings with various statuses and realistic date distributions.
- Associated payments, reviews, notifications, and audit logs.
- Pre-configured demo credentials: admin@carrental.com/admin123, owner1@carrental.com/owner123, user1@carrental.com/user123.

#### 3.5.6 Automated Testing

The backend shall include a test suite using pytest with pytest-asyncio for asynchronous test execution. Tests are located in the `backend/tests/` directory and can be run with `python -m pytest tests/ -v`.

#### 3.5.7 Containerized Deployment

The system shall be deployable using Docker Compose with a single `docker-compose up` command. The Docker Compose configuration defines four services (MongoDB, Redis, Backend, Frontend) with health checks, volume persistence, and inter-service networking.

---

### 3.6 Design Constraints

#### 3.6.1 Frontend Technology Stack

The frontend shall be built with:
- React 18.2 as the UI library.
- TypeScript 5.3 for type-safe development.
- Vite 5.0 as the build tool and development server.
- Tailwind CSS 3.4 for styling.
- React Router DOM 6.21 for client-side routing.
- Zustand 4.5 for state management.
- Axios 1.6 for HTTP requests.
- Recharts 2.12 for data visualization in the admin dashboard.
- Lucide React 0.316 for icons.
- React Hot Toast 2.4 for toast notifications.
- date-fns 3.3 for date formatting and manipulation.
- clsx 2.1 for conditional CSS class composition.

#### 3.6.2 Backend Technology Stack

The backend shall be built with:
- Python 3.10+ as the programming language.
- FastAPI 0.109 as the web framework.
- Uvicorn 0.27 as the ASGI server.
- Motor 3.3 as the asynchronous MongoDB driver.
- PyMongo 4.6 as the MongoDB driver.
- Pydantic 2.5 with email support for data validation.
- Pydantic Settings 2.1 for configuration management.
- python-jose 3.3 with cryptography for JWT handling.
- passlib 1.7 with bcrypt 3.2 for password hashing.
- SlowAPI 0.1 for rate limiting.
- Pillow 10.2 for image processing.
- python-multipart 0.0.6 for file upload handling.
- Faker 22.2 for seed data generation.
- Sentry SDK 1.39 for optional error tracking.

#### 3.6.3 Database Constraint

MongoDB 7 shall be used as the primary database. The system shall use eight collections: `users`, `vehicles`, `bookings`, `payments`, `reviews`, `notifications`, `audit_logs`, and `config`.

#### 3.6.4 Authentication Architecture

Authentication shall be implemented using stateless JWT tokens. Tokens are stored in the browser's sessionStorage (not localStorage). Token expiry is 60 minutes by default. There is no refresh token mechanism implemented; users must re-login after token expiry.

#### 3.6.5 Routing Architecture

The frontend shall use client-side routing with React Router v6. Protected routes shall be implemented using an `Outlet`-based ProtectedRoute component that checks authentication status and user role before rendering child routes.

#### 3.6.6 State Management Architecture

Client-side state management shall use Zustand with a single `authStore` for authentication state. Page-level data fetching shall use React's `useState` and `useEffect` hooks with the API client library.

---

### 3.7 Online User Documentation and Help System Requirements

The application shall provide the following in-application guidance:

1. **Demo Account Credentials**: The login page shall display collapsible demo account credentials for all three roles (admin, owner, user) to enable easy testing.
2. **Booking Next Steps**: After booking creation, the system shall return a `nextSteps` message guiding the user on what to do next (complete payment or wait for owner approval).
3. **Empty State Guidance**: When sections are empty (no bookings, no vehicles, no notifications), the system shall display contextual messages with action buttons guiding users to the appropriate next step.
4. **How It Works Section**: The landing page shall include a "How It Works" section explaining the rental process in three steps: Search, Book, and Drive.

No external documentation portal or help desk system is required for this version.

---

### 3.8 Purchased Components

The system uses the following open-source libraries and components (all available under permissive licenses):

| Component | Version | License | Usage |
|-----------|---------|---------|-------|
| React | 18.2 | MIT | Frontend UI library |
| FastAPI | 0.109 | MIT | Backend web framework |
| MongoDB Community | 7.x | SSPL | Database |
| Redis | 7.x | BSD | Caching and rate limiting |
| Tailwind CSS | 3.4 | MIT | CSS framework |
| Zustand | 4.5 | MIT | State management |
| Recharts | 2.12 | MIT | Charts and graphs |
| Lucide React | 0.316 | ISC | Icon library |
| Motor | 3.3 | Apache 2.0 | Async MongoDB driver |
| Pydantic | 2.5 | MIT | Data validation |
| python-jose | 3.3 | MIT | JWT processing |
| passlib | 1.7 | BSD | Password hashing |
| Faker | 22.2 | MIT | Test data generation |
| Axios | 1.6 | MIT | HTTP client |
| Vite | 5.0 | MIT | Build tool |
| Docker | Latest | Apache 2.0 | Containerization |

No commercially licensed or proprietary purchased components are used.

---

### 3.9 Interfaces

#### 3.9.1 User Interfaces

The application shall provide the following user interface screens:

1. **Landing Page**: Hero section with search input, brand marquee, "How It Works" timeline, feature bento grid, testimonial cards, and call-to-action section.

2. **Login Page**: Split-screen layout with decorative side panel and login form. Includes collapsible demo credentials, email and password fields, and a link to the signup page.

3. **Signup Page**: Split-screen layout with registration form including name, email, password (with strength indicator), and role selection (user/owner) with visual cards.

4. **Search/Browse Page**: Full-width vehicle listing with search bar, filter panel (fuel type, transmission, seat count, price range, location), active filter chips, sort options (newest, price ascending, price descending), paginated vehicle grid, and result count.

5. **Vehicle Details Page**: Vehicle image gallery, title, specs, location, pricing breakdown, availability calendar showing booked ranges, booking form with date selection, review section with average rating and individual reviews.

6. **User Dashboard**: Tab-based view (All, Confirmed, Active, Completed, Cancelled) of user's bookings. Each booking displays vehicle information, dates, status badge, and price. Sliding panel for booking details with cancel/dispute actions.

7. **Owner Dashboard**: Tab-based view with Vehicles and Bookings tabs. Vehicles tab shows owned vehicles in a card grid with edit/delete actions. Bookings tab shows bookings for owner's vehicles. Includes a vehicle creation/editing form.

8. **Admin Dashboard**: Tab-based view with Overview, Bookings, Vehicles, Users, and Audit tabs. Overview shows stat cards, monthly revenue chart (Recharts), top vehicles by bookings, and booking status distribution. Bookings tab includes CSV export. Vehicles tab includes approve/reject moderation actions.

9. **Profile Page**: User profile display and edit form with name, contact information, and password change functionality.

10. **Notifications Page**: Paginated list of notifications with read/unread visual distinction, type-based icons, relative timestamps, and mark-as-read functionality.

11. **404 Not Found Page**: Minimal page with "404" heading, "Page not found" message, and a "Go Home" link.

#### 3.9.2 Hardware Interfaces

The system does not have any direct hardware interface requirements. It is a web application accessed through standard web browsers. The server hardware requirements are:
- Any system capable of running Docker containers.
- Minimum 2 GB RAM for running all services (MongoDB, Redis, Backend, Frontend).
- Sufficient disk space for the database and uploaded vehicle images.

#### 3.9.3 Software Interfaces

| Interface | Description |
|-----------|-------------|
| MongoDB 7 | The backend communicates with MongoDB through the Motor async driver over the MongoDB Wire Protocol (default port 27017). Connection string is configured via the `MONGO_URI` environment variable. |
| Redis 7 | The backend connects to Redis for rate limiting via the `REDIS_URL` environment variable (default port 6379). Communication uses the Redis RESP protocol. |
| File System | Vehicle images are stored on the server's local file system in the directory specified by `UPLOAD_DIR` (default: `./uploads`). Images are served as static files mounted at the `/uploads` URL path. |
| Browser APIs | The frontend uses `sessionStorage` for JWT token persistence, `IntersectionObserver` for scroll-based animations, and `fetch` (via Axios) for HTTP communication. |

#### 3.9.4 Communications Interfaces

| Protocol | Description |
|----------|-------------|
| HTTP/HTTPS | All client-server communication uses HTTP. The frontend sends RESTful API requests to the backend at the `/api` prefix. In development, Vite proxies API requests to the backend. In production, Nginx reverse-proxies API requests. |
| JSON | All API request and response bodies use JSON format with `Content-Type: application/json`, except for file uploads which use `multipart/form-data` and CSV exports which use `text/csv`. |
| JWT Bearer Token | Authenticated requests include the JWT in the `Authorization: Bearer <token>` header. |
| WebSocket | Not used. All communication is request-response based HTTP. |

---

### 3.10 Licensing Requirements

- The DriveX application source code is proprietary and not distributed under any open-source license.
- All third-party dependencies used in the project are open-source and distributed under permissive licenses (MIT, BSD, Apache 2.0, ISC) as detailed in Section 3.8.
- MongoDB Community Edition is used under the Server Side Public License (SSPL). The application does not offer MongoDB as a service, so SSPL obligations do not apply.
- No commercial license purchases are required for any component of the system.

---

### 3.11 Legal, Copyright and Other Notices

- The application displays "2025 DriveX. All rights reserved." in the footer.
- The footer includes the tagline "Built with care, not templates." as a brand statement.
- Vehicle images used in seed data are sourced from Unsplash and are used under the Unsplash License (free for commercial and non-commercial use).
- The application does not collect or process personally identifiable information beyond account registration data (name, email, hashed password). No GDPR consent mechanism is currently implemented.
- No warranty is provided, express or implied, for the simulated payment processing functionality. The mock payment system is for demonstration purposes only.

---

### 3.12 Applicable Standards

| Standard | Application |
|----------|-------------|
| RESTful API Design | All backend endpoints follow RESTful conventions: proper HTTP methods (GET, POST, PUT, DELETE), meaningful status codes (200, 201, 400, 401, 403, 404, 409, 500), and resource-oriented URL paths. |
| OpenAPI 3.0 | The API specification is auto-generated by FastAPI and available at `/api/openapi.json`, conforming to the OpenAPI 3.0 standard. |
| WCAG 2.1 (Partial) | The UI implements basic accessibility features: ARIA labels on interactive elements, keyboard-navigable controls, semantic HTML elements, and `aria-current` attributes on the booking stepper. Full WCAG 2.1 AA compliance is not guaranteed. |
| ISO 8601 | All dates and timestamps in API requests and responses use ISO 8601 format. All server-side timestamps are stored in UTC. |
| bcrypt | Password hashing follows the bcrypt standard for secure storage. Plaintext passwords are never stored or logged. |
| IEEE 830-1998 | This SRS document follows the IEEE 830 recommended practice for software requirements specifications. |

---

## 4. Supporting Information

### 4.1 Data Model Summary

The system uses eight MongoDB collections:

| Collection | Key Fields | Description |
|------------|-----------|-------------|
| `users` | _id, name, email, passwordHash, role, verified, createdAt, profile | Stores all user accounts with bcrypt-hashed passwords. Role determines access level. |
| `vehicles` | _id, ownerId, title, description, images[], specs{}, pricing{}, status, location, approvalMode, availability[], createdAt | Stores vehicle listings with nested specs (seats, transmission, fuel, make, model, year, color), pricing configuration, and availability blocks. |
| `bookings` | _id, vehicleId, userId, ownerId, startDate, endDate, days, priceBreakdown{}, status, holdExpiresAt, idempotencyKey, paymentMethod, cancelReason, createdAt, updatedAt | Stores booking records with full price breakdown and status lifecycle management. |
| `payments` | _id, bookingId, method, amount, status, transactionRef, createdAt | Stores payment transaction records (charges and refunds). |
| `reviews` | _id, bookingId, vehicleId, userId, rating, comment, createdAt | Stores user reviews with 1-5 star ratings. One review per user per booking. |
| `notifications` | _id, userId, message, type, read, link, createdAt | Stores in-app notification messages with read status tracking. |
| `audit_logs` | _id, actorId, action, resourceType, resourceId, payload, createdAt | Immutable log of all significant system actions for audit trail. |
| `config` | _id, key, value | Stores system configuration values such as schema version. |

### 4.2 API Endpoint Reference

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | /api/auth/signup | No | - | Register a new user |
| POST | /api/auth/login | No | - | Authenticate and receive JWT |
| POST | /api/auth/logout | No | - | Client-side logout acknowledgement |
| GET | /api/auth/profile | Yes | Any | Get current user profile |
| GET | /api/vehicles | No | - | Search/list vehicles with filters |
| GET | /api/vehicles/:id | No | - | Get vehicle details with booked ranges |
| POST | /api/vehicles | Yes | Owner, Admin | Create a new vehicle listing |
| PUT | /api/vehicles/:id | Yes | Owner (own), Admin | Update vehicle details |
| DELETE | /api/vehicles/:id | Yes | Owner (own), Admin | Soft-delete (remove) a vehicle |
| POST | /api/vehicles/:id/images | Yes | Owner (own), Admin | Upload vehicle images |
| GET | /api/bookings | Yes | Any (scoped) | List bookings (role-scoped) |
| GET | /api/bookings/:id | Yes | Renter, Owner, Admin | Get booking details |
| POST | /api/bookings | Yes | Any | Create a new booking with hold |
| POST | /api/bookings/:id/confirm | Yes | Renter, Owner, Admin | Confirm a booking |
| POST | /api/bookings/:id/cancel | Yes | Renter, Owner, Admin | Cancel a booking |
| POST | /api/bookings/:id/dispute | Yes | Renter, Owner | Open a dispute |
| POST | /api/bookings/:id/resolve | Yes | Admin | Resolve a dispute |
| POST | /api/payments/charge | Yes | Renter, Admin | Process a payment charge |
| POST | /api/payments/refund | Yes | Admin | Process a refund |
| GET | /api/payments/booking/:id | Yes | Renter, Owner, Admin | Get payment history for a booking |
| POST | /api/reviews | Yes | User | Submit a review for a completed booking |
| GET | /api/reviews/vehicle/:id | No | - | Get all reviews for a vehicle |
| GET | /api/notifications | Yes | Any | Get paginated notifications |
| POST | /api/notifications/mark-read | Yes | Any | Mark notifications as read |
| GET | /api/admin/analytics | Yes | Admin | Get platform analytics |
| GET | /api/admin/bookings | Yes | Admin | List all bookings (admin) |
| GET | /api/admin/bookings/export | Yes | Admin | Export bookings as CSV |
| GET | /api/admin/vehicles | Yes | Admin | List all vehicles (moderation) |
| POST | /api/admin/vehicles/:id/approve | Yes | Admin | Approve a vehicle listing |
| POST | /api/admin/vehicles/:id/reject | Yes | Admin | Reject a vehicle listing |
| GET | /api/admin/audit-logs | Yes | Admin | View audit trail |
| GET | /api/admin/users | Yes | Admin | List all users |
| GET | /api/health | No | - | System health check |

### 4.3 Booking Status Lifecycle

```
                                  +-- auto approval --> [HELD] --+--> payment --> [CONFIRMED] --> [ACTIVE] --> [COMPLETED] --> [ARCHIVED]
                                  |                              |                    |              |              |
[BOOKING CREATED] ----------------+                              |                    |              |              |
                                  |                              v                    v              v              |
                                  +-- manual approval --> [PENDING]             [CANCELLED]    [DISPUTED] --------+
                                                            |                                      |
                                                            +-- owner approves --> [CONFIRMED]     +-- admin resolves
                                                                                                   |
                                                                                             [REFUNDED] or [COMPLETED]
```

- **HELD**: Temporary reservation, expires after 15 minutes if payment is not completed.
- **PENDING**: Awaiting owner approval for vehicles with manual approval mode.
- **CONFIRMED**: Payment received or owner approved. Awaiting start date.
- **ACTIVE**: Rental is currently in progress (start date reached).
- **COMPLETED**: Rental period has ended.
- **CANCELLED**: Booking was cancelled by user, owner, or system (hold expired).
- **DISPUTED**: A dispute has been opened by the renter or owner.
- **REFUNDED**: Admin resolved a dispute with a refund.
- **ARCHIVED**: Old completed/cancelled/refunded bookings (90+ days).

### 4.4 Pricing Calculation Formula

```
For each day in the booking period:
    if day is Saturday or Sunday AND weekendRate is set:
        dailyCost = weekendRate
    else:
        dailyCost = baseRate

baseTotal = sum of all dailyCosts

Discount Calculation:
    if days >= 30 AND monthlyDiscount is set:
        discountAmount = baseTotal * monthlyDiscount (e.g., 20%)
    else if days >= 7 AND weeklyDiscount is set:
        discountAmount = baseTotal * weeklyDiscount (e.g., 10%)
    else:
        discountAmount = 0

baseAfterDiscount = baseTotal - discountAmount

Fees:
    serviceFee = baseAfterDiscount * serviceFeePercentage / 100 (default 5%)
    cleaningFee = vehicle.cleaningFee (one-time)

Subtotal = baseAfterDiscount + serviceFee + cleaningFee

Tax:
    tax = subtotal * taxPercentage / 100 (default 18% GST)

Total = subtotal + tax + securityDeposit
```

### 4.5 Refund Policy

```
Cancellation Timing (hours before start date):
    > 48 hours:  100% refund of refundable amount
    24-48 hours: 50% refund of refundable amount
    < 24 hours:  0% refund

Note: Security deposit is always fully refunded regardless of cancellation timing.
Refundable amount = Total - Security Deposit
```

---

### Sections Not Included

The following sections from the SRS template were evaluated and determined to be not applicable to the DriveX project:

1. **Section 3.7 (Online User Documentation and Help System Requirements)** -- This section was included with a simplified scope. A full external help system or documentation portal is not part of this project; only in-app guidance elements are provided.
2. **Refresh Token Mechanism** -- The template's reference to multiple authentication flows was simplified as the system uses only short-lived access tokens without refresh tokens.
3. **Hardware Interfaces (Section 3.9.2)** -- Included with minimal content as the system is a web application with no direct hardware interface dependencies beyond standard server infrastructure.

All other sections from the template have been fully populated with project-specific requirements.
