# Software Requirements Specification

## For DriveX - Car Rental Web Application

### Version 2.0

---

## Revision History

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 20/Feb/2026 | 1.0 | Initial SRS document for DriveX Car Rental Web Application | Development Team |
| 21/Feb/2026 | 2.0 | Updated SRS reflecting new features: coupon system, trip reports, identity verification, announcements, saved searches, recently viewed, referral program, blacklist system, cancellation policies, peak season pricing, surge pricing, late return fees, geo-search, owner analytics, admin CRUD, bulk operations, platform config, fraud alerts, and enhanced UI components | Development Team |

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

The purpose of this Software Requirements Specification (SRS) document is to provide a complete and comprehensive description of the requirements for the DriveX Car Rental Web Application, Version 2.0. This document fully describes the external behavior of the system, including all functional requirements, non-functional requirements, design constraints, and other factors necessary for the development, testing, and deployment of the application.

This version supersedes Version 1.0 and incorporates significant new features including a coupon and discount system, pre/post trip inspection reports, identity and document verification, system announcements, saved searches, recently viewed tracking, a referral program, user blacklisting, multiple cancellation policies, peak season and surge pricing, late return fees, geolocation-based search, owner analytics, expanded admin CRUD operations, bulk administrative actions, platform configuration management, and an enhanced frontend with interactive UI components and animations.

This SRS is intended for use by the development team, testers, project managers, and stakeholders involved in the construction and maintenance of the DriveX platform.

### 1.2 Scope

DriveX is a full-stack web-based car rental platform that connects vehicle owners with renters. The application enables three categories of users -- Renters (Users), Vehicle Owners, and Administrators -- to interact through a unified system for listing, searching, booking, paying for, and managing vehicle rentals.

The application consists of two major subsystems:

- **Frontend**: A Single Page Application (SPA) built with React 18 and TypeScript, providing an interactive and responsive user interface with rich animations, micro-interactions, and mobile-optimized navigation for all user roles.
- **Backend**: A RESTful API server built with Python FastAPI, handling business logic, authentication, data persistence, background task processing, and administrative operations across 12 route modules.

The system supports the full vehicle rental lifecycle: user registration with referral tracking, vehicle listing by owners, vehicle discovery with geo-search and saved searches, booking creation with coupon support and hold-based reservation, simulated payment processing, booking status management with multiple cancellation policies, pre-trip and post-trip vehicle inspection reports, reviews and ratings, notifications and system announcements, dispute resolution, late return fee calculation, identity verification, and comprehensive administrative oversight with analytics, configuration management, bulk operations, and fraud detection.

The system does not include a physical payment gateway integration (payments are simulated), does not include a mobile native application, and does not include real-time GPS tracking of vehicles.

### 1.3 Definitions, Acronyms and Abbreviations

| Term | Definition |
|------|-----------|
| SPA | Single Page Application -- a web application that dynamically rewrites the current page rather than loading entire new pages |
| API | Application Programming Interface -- a set of protocols for building and integrating application software |
| REST | Representational State Transfer -- an architectural style for distributed hypermedia systems |
| JWT | JSON Web Token -- a compact, URL-safe means of representing claims to be transferred between two parties |
| CORS | Cross-Origin Resource Sharing -- a mechanism that allows restricted resources on a web page to be requested from another domain |
| CRUD | Create, Read, Update, Delete -- the four basic operations of persistent storage |
| TTL | Time To Live -- a mechanism that limits the lifespan of data or a process |
| GMV | Gross Merchandise Value -- the total value of all completed transactions on the platform |
| Hold | A temporary reservation placed on a vehicle for a fixed duration, awaiting payment to confirm |
| Idempotency Key | A unique identifier sent with booking requests to prevent duplicate bookings on retry |
| Base Rate | The daily rental charge for a vehicle on weekdays |
| Weekend Rate | An optional premium daily rate applied on Saturdays and Sundays |
| Peak Season Rate | An optional premium daily rate applied during defined peak season date ranges |
| Surge Pricing | A demand-based price multiplier applied during high-demand periods |
| Security Deposit | A refundable amount charged upfront as protection against damage |
| Cleaning Fee | A one-time fee charged per booking for vehicle cleaning |
| Service Fee | A percentage-based platform fee applied on the rental subtotal |
| GST | Goods and Services Tax -- indirect tax applied at 18% on the service subtotal |
| RBAC | Role-Based Access Control -- access control mechanism based on user roles |
| Coupon | A discount code that can be applied during booking to reduce the total price |
| Trip Report | A pre-trip or post-trip inspection document capturing vehicle condition, odometer, fuel level, and damage |
| Verification | The process of validating a user's identity or a vehicle's insurance through document submission and admin review |
| Blacklist | A system for suspending user accounts, preventing login and booking operations |
| Referral Code | A unique code assigned to each user for inviting new users to the platform |
| Cancellation Policy | A configurable policy (flexible, moderate, strict, non-refundable) determining refund amounts based on cancellation timing |
| Haversine | A formula used to calculate the great-circle distance between two points on a sphere, used for geo-search |
| Motor | An asynchronous Python driver for MongoDB |
| Zustand | A lightweight state management library for React applications |
| Vite | A modern frontend build tool providing fast development server and optimized production builds |
| Tailwind CSS | A utility-first CSS framework for rapidly building custom user interfaces |
| Bcrypt | A password hashing algorithm based on the Blowfish cipher |
| MongoDB | A document-oriented NoSQL database program |
| FastAPI | A modern, high-performance web framework for building APIs with Python |
| Docker | A platform for developing, shipping, and running applications in containers |
| SRS | Software Requirements Specification |
| Aadhaar | Indian government-issued 12-digit unique identity number |

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
| OpenStreetMap (https://www.openstreetmap.org) | Open-source map data used for vehicle location display |
| canvas-confetti (https://github.com/catdad/canvas-confetti) | Library used for celebration animations |

### 1.5 Overview

The remainder of this SRS document is organized as follows:

- **Section 2 -- Overall Description**: Provides a high-level overview of the product, including its perspective within the broader ecosystem, a summary of product functions, user characteristics, constraints, and assumptions.
- **Section 3 -- Specific Requirements**: Contains the detailed software requirements organized by functionality, usability, reliability, performance, supportability, design constraints, interfaces, licensing, legal notices, and applicable standards.
- **Section 4 -- Supporting Information**: Contains supplementary material including a data model summary, API endpoint reference, booking status lifecycle, pricing formula, refund policies, and coupon discount logic.

---

## 2. Overall Description

### 2.1 Product Perspective

DriveX is a self-contained web application designed as a peer-to-peer vehicle rental marketplace. It operates as an independent system comprising a client-side frontend, a server-side backend API, and a database layer. The system is not a replacement for or extension of any existing system; it is a new, standalone product.

The system architecture follows a three-tier model:

1. **Presentation Tier (Frontend)**: React 18 SPA served via Vite development server or Nginx in production. Communicates with the backend exclusively through RESTful HTTP API calls. Features rich animations, micro-interactions, and a mobile-optimized bottom navigation bar.
2. **Application Tier (Backend)**: Python FastAPI application handling authentication, authorization, business logic, pricing calculations (including coupons, surge pricing, and peak season rates), background task scheduling, trip report management, identity verification, and data access. Exposes a RESTful API at the `/api` prefix across 12 route modules.
3. **Data Tier**: MongoDB 7 document database storing all persistent data across 14 collections: `users`, `vehicles`, `bookings`, `payments`, `reviews`, `notifications`, `audit_logs`, `config`, `coupons`, `trip_reports`, `verifications`, `announcements`, `saved_searches`, `recently_viewed`, `referrals`, and `blacklist`.

The system also integrates Redis 7 as a supporting service for rate limiting and caching. The entire stack is containerized using Docker Compose for deployment, consisting of four services: MongoDB, Redis, Backend (FastAPI), and Frontend (React/Nginx).

### 2.2 Product Functions

The major functions of the DriveX system are:

1. **User Management**: Registration with referral code support, authentication, profile management, password change, emergency contact management, and role-based access (User, Owner, Admin).
2. **Referral Program**: Each user receives a unique referral code. New users can sign up with a referral code, granting the referrer a reward count. Referral statistics are tracked per user.
3. **Vehicle Management**: Vehicle listing creation, image upload, specification and pricing configuration (including peak season rates, late return fees, and cancellation policy), geo-location tagging, instant booking toggle, status management (active, paused, removed), and availability blocking by owners.
4. **Vehicle Discovery**: Full-text search, multi-criteria filtering (fuel type, transmission, seat count, price range, location, instant booking), geo-proximity search with haversine distance calculation, availability filtering by date range, sorting (newest, price, rating, popularity, distance), saved searches, and recently viewed vehicle tracking.
5. **Booking Management**: Hold-based booking creation with idempotency, coupon code validation and application, first-time user discount, blacklist enforcement, atomic availability conflict detection, server-side pricing calculation (with peak season, surge, and coupon support), configurable cancellation policies (flexible, moderate, strict, non-refundable), auto/manual approval modes, booking confirmation with re-check, cancellation with tiered refund, late return reporting with fee calculation, and status lifecycle transitions (draft, pending, held, confirmed, active, completed, cancelled, disputed, refunded, archived).
6. **Payment Processing**: Simulated payment charge, payment failure simulation, refund processing (admin), and payment history per booking.
7. **Coupon System**: Admin-managed coupon creation with percentage or fixed discount types, minimum booking amount, maximum discount cap, expiry dates, total usage limits, per-user usage limits, first-time-only restriction, coupon validation endpoint, and automatic discount application during booking.
8. **Trip Reports**: Pre-trip and post-trip inspection reports with configurable checklists (10 pre-trip items, 7 post-trip items), odometer readings, fuel level recording, damage descriptions, extra charge assessment, and photo uploads for condition documentation.
9. **Identity Verification**: Document submission (Aadhaar, driving license, vehicle insurance, owner badge), supporting document upload (images and PDFs), admin review and approval/rejection workflow, automatic user/vehicle flag updates on approval.
10. **Review System**: Rating (1-5 stars) and comment submission for completed bookings, average rating calculation per vehicle, one review per user per booking enforcement.
11. **Notification System**: In-app notifications for booking events, and bulk mark-as-read.
12. **System Announcements**: Admin-created announcements with role-based targeting, optional expiry dates, broadcast to all users as in-app notifications, and announcement management (create, list, delete).
13. **Owner Analytics**: Revenue tracking, occupancy rate calculation, cancellation rate, monthly earnings projection, monthly trend data, and platform commission deduction.
14. **Admin Dashboard**: Platform analytics (GMV, commission revenue, user counts, booking stats, conversion rate, cancellation rate), monthly revenue trend charts, top vehicles by bookings, top cities by vehicle count, user growth trends, fraud detection (users with 2+ disputes), booking status distribution, vehicle moderation (approve/reject with bulk operations), full user CRUD (create, update, delete/deactivate, blacklist/unblacklist), booking CRUD (admin-create, cancel, bulk-cancel), vehicle CRUD (update, delete), payment management (list, refund), dispute listing and resolution, platform configuration management, audit log review with filters, and CSV export of booking data.
15. **Background Task Processing**: Automated hold expiry, booking activation on start date, booking completion on end date, and archival of old bookings.
16. **Audit Logging**: Immutable record of all significant system actions for compliance and debugging.

### 2.3 User Characteristics

The system serves three distinct user roles:

1. **Renter (User Role)**:
   - General public users who want to rent vehicles.
   - Expected to have basic internet browsing skills.
   - Primary activities: browsing vehicles, saving searches, viewing recently viewed vehicles, creating bookings with coupon codes, making payments, completing pre/post trip reports, submitting reviews, managing personal bookings, submitting identity verification documents, sharing referral codes.
   - Access to: Vehicle search with geo-proximity, vehicle details, user dashboard, booking history, trip reports, profile management (including password change and emergency contacts), notifications, referral information, saved searches, verification submissions.

2. **Vehicle Owner (Owner Role)**:
   - Individuals or businesses who own vehicles and want to rent them out.
   - Expected to have moderate technical skills for managing listings.
   - Primary activities: creating and managing vehicle listings (including geo-location, cancellation policies, peak season rates, late fees), uploading images, setting pricing and availability, monitoring bookings for their vehicles, tracking earnings with owner analytics (revenue, occupancy, projections), completing trip reports, reporting late returns, submitting owner badge verification.
   - Access to: Owner dashboard with analytics, vehicle CRUD operations, image upload, booking management for owned vehicles, trip report submission, late return reporting, profile management, notifications, verification submissions.

3. **Administrator (Admin Role)**:
   - Platform operators responsible for overseeing the entire system.
   - Expected to have advanced technical and business understanding.
   - Primary activities: viewing platform analytics (GMV, commission, fraud alerts, user growth, city distribution), moderating vehicles (approve/reject/bulk-approve), full user management (create/update/deactivate/blacklist/unblacklist), booking management (admin-create/cancel/bulk-cancel), payment management (list/refund), managing coupons (create/toggle/delete), creating system announcements, reviewing identity verifications (approve/reject), updating platform configuration (GST, service fee, commission, discounts), reviewing audit logs, resolving disputes, exporting data.
   - Access to: Admin dashboard with all tabs, full analytics, all CRUD operations, coupon management, announcement management, verification review, configuration panel, audit logs, CSV export, blacklist management, dispute resolution, platform-wide refund processing.

### 2.4 Constraints

1. **Technology Stack Constraint**: The frontend must be built with React 18 and TypeScript, and the backend must use Python FastAPI with MongoDB as the database.
2. **Authentication Constraint**: The system uses stateless JWT-based authentication. Token management is client-side (sessionStorage); server-side session management is not implemented.
3. **Payment Constraint**: Payment processing is simulated (mock). No real payment gateway (such as Razorpay, Stripe, or PayPal) is integrated. The system uses a mock card method that always succeeds unless the method name contains "fail".
4. **Single Currency Constraint**: The system operates with Indian Rupees (INR) as the default currency.
5. **Image Storage Constraint**: Vehicle images, trip report photos, and verification documents are stored on the local file system in the `/uploads` directory. No cloud storage service (such as AWS S3 or Cloudinary) is integrated.
6. **Deployment Constraint**: The application is containerized using Docker Compose and designed to run on a single server. No cloud-native auto-scaling, load balancing, or CDN integration is implemented.
7. **Email Constraint**: The system does not send email notifications. All notifications are in-app only.
8. **Rate Limiting**: API rate limiting is enforced using SlowAPI based on client IP address.
9. **Map Integration Constraint**: The map view uses OpenStreetMap iframe embeds rather than a full-featured map SDK. Geolocation is stored as lat/lng coordinates but no address geocoding API is integrated.
10. **Verification Constraint**: Identity verification is a manual admin review process. No automated document verification or OCR is implemented.

### 2.5 Assumptions and Dependencies

**Assumptions:**

1. Users have access to a modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
2. Users have a stable internet connection to access the web application.
3. The server environment has Docker and Docker Compose installed for deployment.
4. MongoDB 7 and Redis 7 are available either as Docker containers or as standalone services.
5. Vehicle owners will provide accurate information about their vehicles.
6. Users will complete the booking payment within the hold TTL window (default: 15 minutes).
7. The tax rate (GST), service fee, platform commission, and other configurable values can be changed via the admin configuration panel at runtime.
8. The system operates in a single timezone context (UTC) for all date/time calculations.
9. Peak season date ranges are defined in MM-DD format and can span across year boundaries (e.g., December 15 to January 15).

**Dependencies:**

1. **MongoDB 7**: Required for all data persistence. The system cannot function without MongoDB.
2. **Redis 7**: Required for rate limiting functionality. The application can start without Redis but rate limiting will not work.
3. **Node.js and npm**: Required for building the frontend application.
4. **Python 3.10+**: Required for running the backend application.
5. **Docker and Docker Compose**: Required for containerized deployment.
6. **External Image URLs**: Seed data references external image URLs from Unsplash. These images require internet connectivity to load.
7. **canvas-confetti**: Frontend dependency for celebration animations on key user actions.
8. **OpenStreetMap**: Map tiles are loaded from OpenStreetMap servers for the map view component.

---

## 3. Specific Requirements

### 3.1 Functionality

#### 3.1.1 User Registration

**Description**: The system shall allow new users to create accounts by providing their name, email address, password, selecting a role, and optionally providing a referral code.

**Inputs**:
- Name: String, 2 to 100 characters, required.
- Email: Valid email address format, required, must be unique in the system.
- Password: String, 6 to 128 characters, required.
- Role: One of "user" or "owner", defaults to "user".
- Referral Code: Optional string. If provided, must match an existing user's referral code.

**Processing**:
- The system shall validate that the email is not already registered.
- If a referral code is provided, the system shall verify it belongs to an existing user. If invalid, the request is rejected.
- The system shall hash the password using bcrypt before storing.
- The system shall generate a unique referral code for the new user using a cryptographically secure token (8-character URL-safe string).
- The system shall create a user document with `verified` set to `false`, `isVerified` set to `false`, `isBlacklisted` set to `false`, and `referralCount` set to `0`.
- If a valid referral code was provided, the system shall create a referral tracking record linking the referrer to the new user and increment the referrer's `referralCount` by 1.
- The system shall generate a JWT access token containing the user ID and role.
- The system shall create an audit log entry for the signup action.

**Outputs**:
- On success: HTTP 201 response with the access token, user profile object (including referral code).
- On duplicate email: HTTP 400 response with "Email already registered" error.
- On invalid referral code: HTTP 400 response with "Invalid referral code" error.

#### 3.1.2 User Login

**Description**: The system shall allow registered users to authenticate using their email and password, with blacklist enforcement.

**Inputs**:
- Email: Valid email address, required.
- Password: String, required.

**Processing**:
- The system shall look up the user by email in the database.
- The system shall verify the provided password against the stored bcrypt hash.
- The system shall check if the user is blacklisted. If so, login is rejected with a suspension message.
- The system shall check if the user account has been deactivated. If so, login is rejected.
- The system shall generate a JWT access token valid for 60 minutes (configurable).
- The system shall create an audit log entry for the login action.

**Outputs**:
- On success: HTTP 200 response with the access token and user profile object.
- On invalid credentials: HTTP 401 response with "Invalid email or password" error.
- On blacklisted account: HTTP 403 response with "Your account has been suspended. Contact support." error.
- On deactivated account: HTTP 403 response with "Account has been deactivated." error.

#### 3.1.3 User Profile Management

**Description**: The system shall allow authenticated users to view and update their profile, change their password, and view referral information.

**Profile Retrieval**: GET request returns the user's profile (ID, name, email, role, verified status, verification status, blacklist status, referral code, referral count, emergency contact, creation date, profile metadata).

**Profile Update Inputs**:
- Name: Optional string.
- Phone: Optional string.
- Address: Optional string.
- Emergency Contact: Optional object containing name, phone, and relation fields.

**Password Change Inputs**:
- Current Password: Required string.
- New Password: Required string, minimum 6 characters.

**Processing**: The system shall verify the current password before allowing password change.

**Referral Info**: Returns the user's referral code, total referral count, configured referral discount percentage, and list of referral records.

#### 3.1.4 Vehicle Listing Creation

**Description**: The system shall allow users with the "owner" or "admin" role to create new vehicle listings with extended configuration options.

**Inputs**:
- Title: String, 3 to 200 characters, required.
- Description: String, up to 2000 characters, optional (defaults to empty).
- Specs: Object containing seats (integer, default 5), transmission ("auto" or "manual"), fuel type ("petrol", "diesel", "electric", or "hybrid"), make, model, year, color, and mileage (km/l).
- Pricing: Object containing base rate (required), currency (default "INR"), weekend rate (optional), peak season rate (optional), minimum days (default 1), discounts (optional weekly/monthly percentages), cleaning fee (default 0), security deposit (default 0), and late fee per hour (default 0).
- Location: String, optional.
- GeoLocation: Optional object with lat, lng, and address for map-based display and proximity search.
- Approval Mode: "auto" or "manual" (default "auto").
- Instant Booking: Boolean (default true).
- Cancellation Policy: One of "flexible", "moderate", "strict", or "non_refundable" (default "moderate").
- Peak Season Ranges: Array of date ranges in MM-DD format with optional labels.
- Availability Blocks: Array of blocked date ranges with type ("blocked" or "maintenance").

**Processing**:
- The system shall verify the user has "owner" or "admin" role.
- The system shall create a vehicle document with status "active", avgRating 0.0, totalRatings 0, totalBookings 0, ownerVerified false, and insuranceVerified false.
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
- On success: HTTP 201 response with the uploaded image metadata and count.
- On invalid file type: HTTP 400 response.
- On file too large: HTTP 400 response.
- On insufficient permissions: HTTP 403 response.

#### 3.1.6 Vehicle Search and Filtering

**Description**: The system shall allow all users (authenticated or not) to search and browse available vehicles with comprehensive filter criteria, including geo-proximity search.

**Inputs (all optional)**:
- query: Full-text search string against vehicle title and description.
- fuel: Filter by fuel type ("petrol", "diesel", "electric", "hybrid").
- transmission: Filter by transmission type ("auto", "manual").
- seats: Minimum number of seats (greater than or equal to).
- min_price: Minimum base rate.
- max_price: Maximum base rate.
- location: Location substring (case-insensitive regex match).
- ownerId: Filter by specific owner (shows all statuses for that owner).
- instant_booking: Filter for vehicles with instant booking enabled.
- available_now: If true, exclude vehicles with an active booking at the current time.
- start_date / end_date: Filter to only show vehicles available during the specified date range.
- user_lat / user_lng: User's geographic coordinates for proximity-based search.
- max_distance_km: Maximum distance in kilometers (used with user coordinates).
- page: Page number for pagination (default 1).
- limit: Number of results per page (default 12, maximum 100).
- sort: Sort order -- "createdAt" (default, newest first), "price_asc" (lowest price first), "price_desc" (highest price first), "rating" or "best_rated" (highest rated first), "popular" or "most_popular" (most booked first), or "distance" (nearest first, requires user coordinates).

**Processing**:
- If no `ownerId` is provided, the system shall filter only vehicles with "active" status.
- If `ownerId` is provided, the system shall return all vehicles belonging to that owner regardless of status.
- The system shall apply all specified filters to the database query.
- For geo-proximity search, the system shall calculate the haversine distance between the user's coordinates and each vehicle's geoLocation. Vehicles exceeding `max_distance_km` are excluded and the calculated distance is included in the response.
- For `available_now` filtering, the system shall exclude vehicles that have an active/confirmed/held booking overlapping the current time.
- For date-range filtering, the system shall exclude vehicles with any booking (confirmed, active, held) overlapping the requested dates.
- The system shall calculate pagination metadata (total count, current page, total pages).

**Outputs**:
- HTTP 200 response containing: `items` (array of vehicle objects, with optional `distanceKm` field), `total`, `page`, `pages`.

#### 3.1.7 Vehicle Detail Retrieval

**Description**: The system shall allow authenticated users to view complete details of a specific vehicle, including its booked date ranges, and track it as recently viewed.

**Inputs**: Vehicle ID (path parameter).

**Processing**:
- The system shall fetch the vehicle document by ID.
- The system shall query all bookings for this vehicle with status "confirmed", "active", or "held" to build a list of booked date ranges (including status per range).
- The system shall track this vehicle as recently viewed for the authenticated user by upserting into the `recently_viewed` collection.

**Outputs**:
- On success: HTTP 200 response with vehicle details and `bookedRanges` array.
- On not found: HTTP 404 response.

#### 3.1.8 Vehicle Update

**Description**: The system shall allow vehicle owners to update their vehicle listing details, including all new fields.

**Inputs**:
- Vehicle ID: Path parameter.
- Any combination of: title, description, specs, pricing, status, location, geoLocation, approvalMode, instantBooking, cancellationPolicy, peakSeasonRanges, availability blocks.

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

**Description**: The system shall allow authenticated users to create a booking (reservation) for a vehicle, with blacklist enforcement, first-time discounts, and coupon support.

**Inputs**:
- idempotencyKey: String, minimum 5 characters, required.
- vehicleId: Valid MongoDB ObjectId, required.
- startDate: ISO datetime, required.
- endDate: ISO datetime, required.
- paymentMethod: String, default "mock_card".
- couponCode: Optional string.

**Processing**:
- The system shall check if the user is blacklisted. If so, the request is rejected with a 403 error.
- The system shall check for an existing booking with the same idempotency key and return it if found (idempotent behavior).
- The system shall validate that the start date is before the end date.
- The system shall validate that the start date is not in the past (with a 1-hour grace period).
- The system shall perform an atomic availability check against:
  - Vehicle blocked/maintenance date ranges.
  - Existing bookings with status "confirmed", "active", or "held" that overlap the requested dates.
- The system shall check if this is the user's first booking. If so, a first-time discount (configurable, default 10%) is applied.
- If a coupon code is provided, the system shall:
  - Validate the coupon exists and is active.
  - Check coupon expiry.
  - Check total usage limit.
  - Check per-user usage limit.
  - Check first-time-only restriction.
  - Calculate and apply the coupon discount.
  - Increment the coupon's used count.
- The system shall calculate the price breakdown server-side using the vehicle's pricing configuration:
  - Per-day rates: peak season rate on peak days (if configured), weekend rate on Saturdays/Sundays (if configured), base rate on other days.
  - Surge pricing multiplier (if active, default 1.5x).
  - Long-term discounts: 10% weekly discount for bookings of 7+ days, 20% monthly discount for 30+ days (if configured).
  - Cleaning fee (one-time).
  - Service fee (configurable, default 5% of subtotal after discount).
  - Security deposit.
  - Coupon discount.
  - Tax (configurable, default 18% GST on subtotal).
- The system shall set the initial status based on the vehicle's approval mode:
  - "auto" approval mode: Status set to "held" with a `holdExpiresAt` timestamp (default 15 minutes).
  - "manual" approval mode: Status set to "pending" (awaiting owner approval).
- The booking shall store the vehicle's cancellation policy.
- The system shall increment the vehicle's `totalBookings` counter.
- The system shall record an audit log entry and send a notification to the vehicle owner.

**Outputs**:
- On success: HTTP 201 response with the booking document and `nextSteps` guidance.
- On blacklisted user: HTTP 403 response.
- On date conflict: HTTP 409 response.
- On invalid dates: HTTP 400 response.
- On invalid coupon: HTTP 400 response with specific coupon error.

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
- On expired hold: HTTP 400 response with "Hold has expired, booking cancelled" error.
- On availability conflict: HTTP 409 response.

#### 3.1.12 Booking Cancellation

**Description**: The system shall allow renters, vehicle owners, or admins to cancel bookings with automatic refund calculation based on the booking's cancellation policy.

**Processing**:
- The system shall verify the booking is in a cancellable status: "draft", "pending", "held", or "confirmed".
- For confirmed or held bookings, the system shall calculate the refund amount based on the booking's stored cancellation policy:
  - **Flexible**: More than 24 hours before start -- full refund; 12 to 24 hours -- 50% refund; less than 12 hours -- no refund.
  - **Moderate** (default): More than 48 hours before start -- full refund; 24 to 48 hours -- 50% refund; less than 24 hours -- no refund.
  - **Strict**: More than 72 hours before start -- 50% refund; less than 72 hours -- no refund.
  - **Non-refundable**: No refund regardless of timing.
  - Security deposit is always refunded regardless of policy or timing.
- The system shall update the booking status to "cancelled" and record the cancel reason.
- The system shall send a notification to the other party (renter or owner).

**Outputs**:
- On success: HTTP 200 response with the updated booking and refund amount.
- On invalid status: HTTP 400 response.

#### 3.1.13 Late Return Reporting

**Description**: The system shall allow vehicle owners (or admins) to report a late return and calculate the late return fee.

**Inputs**:
- bookingId: Path parameter.
- returnTime: Actual return datetime, required.
- notes: Optional string.

**Processing**:
- The system shall verify the user is the vehicle owner or an admin.
- The system shall verify the booking is in "active" or "confirmed" status.
- The system shall calculate the late return fee based on the number of late hours:
  - If the vehicle has a configured `lateFeePerHour`, that rate is used.
  - Otherwise, the default is 1.5x the hourly base rate (baseRate / 24 * 1.5).
- The system shall update the booking with the late return fee, actual return time, and set status to "completed".
- The system shall send a warning notification to the renter about the applied fee.

**Outputs**:
- On success: HTTP 200 response with the late return fee amount.
- On invalid status: HTTP 400 response.
- On insufficient permissions: HTTP 403 response.

#### 3.1.14 Booking Dispute

**Description**: The system shall allow renters or vehicle owners to open a dispute on an active or completed booking.

**Processing**:
- The system shall verify the booking is in "active" or "completed" status.
- The system shall set the booking status to "disputed".
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 200 response with confirmation.
- On invalid status: HTTP 400 response.

#### 3.1.15 Dispute Resolution (Admin)

**Description**: The system shall allow administrators to resolve booking disputes using the booking's cancellation policy for refund calculation.

**Inputs**:
- resolution: "refund" or "no_refund", required.
- notes: Optional admin notes.

**Processing**:
- The system shall verify the user has the "admin" role.
- The system shall verify the booking is in "disputed" status.
- If resolution is "refund", the system shall calculate the refund amount using the booking's cancellation policy and set status to "refunded".
- If resolution is "no_refund", the system shall set status to "completed" with no refund.
- The system shall record an audit log entry and notify the renter.

**Outputs**:
- On success: HTTP 200 response with the updated booking.
- On insufficient permissions: HTTP 403 response.

#### 3.1.16 Booking Listing

**Description**: The system shall allow authenticated users to view their bookings with filtering and pagination.

**Processing**:
- Regular users see only their own bookings.
- Owners see bookings for their vehicles and their own bookings.
- Admins see all bookings in the system.
- Optional filter by booking status.
- Results are sorted by creation date (newest first) with pagination (max 200 per page).

**Outputs**:
- HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.17 Payment Charge

**Description**: The system shall simulate a payment charge for a booking.

**Inputs**:
- bookingId: Valid MongoDB ObjectId, required.
- method: Payment method string, default "mock_card".
- amount: Payment amount (float), required.

**Processing**:
- The system shall verify the booking is in "held" or "pending" status.
- The system shall verify the user is the booking's renter or an admin.
- For any method not containing "fail": payment succeeds with a generated transaction reference.
- For any method containing "fail": payment is marked as failed (for testing).
- On successful payment: booking status is updated to "confirmed".
- On failed payment: booking status is updated to "cancelled".
- The system shall record an audit log entry.

**Outputs**:
- On success: HTTP 201 response with payment details including status and transaction reference.
- On invalid booking status: HTTP 400 response.

#### 3.1.18 Payment History

**Description**: The system shall allow users to view all payments associated with a specific booking.

**Processing**:
- The system shall verify the user is the renter, vehicle owner, or an admin.
- The system shall return all payment records for the booking, sorted by creation date (newest first).

**Outputs**:
- HTTP 200 response with `payments` array.

#### 3.1.19 Coupon Management (Admin)

**Description**: The system shall allow administrators to create, list, toggle, and delete discount coupons.

**Creation Inputs**:
- code: String, 3 to 30 characters, required. Stored as uppercase. Must be unique.
- type: "percentage" or "fixed", required.
- value: Positive number, required. For percentage type, represents the discount percentage. For fixed type, represents the discount amount in INR.
- minBookingAmount: Minimum booking total required to use the coupon (default 0).
- maxDiscount: Maximum discount amount cap (optional, applicable to percentage type).
- expiresAt: Optional expiry datetime.
- usageLimit: Total number of times the coupon can be used (default 100).
- perUserLimit: Number of times a single user can use the coupon (default 1).
- description: Optional descriptive text.
- forFirstTimeOnly: Boolean, whether the coupon is restricted to first-time users (default false).

**Processing**:
- The system shall reject creation if the coupon code already exists.
- Listing supports active-only filtering and pagination.
- Toggle switches the coupon's `isActive` flag.
- Delete permanently removes the coupon document.
- Each operation records an audit log entry.

#### 3.1.20 Coupon Validation

**Description**: The system shall allow authenticated users to validate a coupon code before applying it to a booking.

**Inputs**:
- code: Coupon code string, required.
- bookingAmount: Total booking amount for discount calculation, required.

**Processing**:
- The system shall look up the coupon by uppercase code with `isActive` set to true.
- The system shall check: expiry, total usage limit, per-user usage limit, first-time-only restriction, and minimum booking amount.
- The system shall calculate the discount:
  - Percentage type: `bookingAmount * value / 100`, capped at `maxDiscount` if set.
  - Fixed type: `min(value, bookingAmount)`.

**Outputs**:
- On valid: HTTP 200 response with `valid: true`, code, type, value, calculated discount amount, and description.
- On invalid/expired/exceeded: HTTP 400 or 404 response with specific error message.

#### 3.1.21 Review Creation

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

#### 3.1.22 Vehicle Reviews Retrieval

**Description**: The system shall allow users to view all reviews for a specific vehicle.

**Processing**:
- The system shall fetch all reviews for the vehicle, sorted by creation date (newest first).
- The system shall calculate the average rating across all reviews.

**Outputs**:
- HTTP 200 response with `reviews` array, `averageRating`, and `count`.

#### 3.1.23 Trip Report Management

**Description**: The system shall support pre-trip and post-trip vehicle inspection reports.

**Checklist Templates**:
- Pre-trip checklist (10 items): Engine oil level OK, Tire pressure checked, Fuel level noted, Odometer reading captured, No visible exterior damage, Headlights and taillights functional, Brakes responsive, AC/Heater functional, All documents present (RC, insurance), Interior clean and undamaged.
- Post-trip checklist (7 items): Fuel level confirmed, Odometer reading captured, No new exterior damage, Interior returned in clean condition, All personal items removed, Keys returned, Parking in designated spot.

**Report Creation Inputs**:
- bookingId: Required.
- reportType: "pre_trip" or "post_trip", required.
- checklist: Array of items with label and checked status.
- odometerReading: Optional float.
- fuelLevel: Optional string.
- notes: Optional string.
- damageDescription: Optional string.
- extraCharges: Float (default 0).
- extraChargesReason: Optional string.

**Processing**:
- The system shall verify the user is the renter, vehicle owner, or admin.
- Only one report of each type (pre_trip, post_trip) is allowed per booking.
- Pre-trip reports can only be created for confirmed or active bookings.
- Post-trip reports can only be created for active or completed bookings.
- The report is linked to the booking via `tripStartReportId` or `tripEndReportId`.
- If a post-trip report includes extra charges, they are added to the booking.

**Photo Upload**: The system allows uploading condition photos (JPEG, PNG, WebP, max 5MB) for trip reports, stored in `/uploads/trip_reports/{reportId}/`.

**Retrieval**: Users can view all trip reports for a booking or a single report by ID.

#### 3.1.24 Identity Verification

**Description**: The system shall support identity verification for users and insurance verification for vehicles.

**Verification Types**:
- `aadhaar`: Aadhaar card verification (updates user `isVerified` flag on approval).
- `license`: Driving license verification (updates user `isVerified` flag on approval).
- `insurance`: Vehicle insurance verification (updates vehicle `insuranceVerified` flag on approval).
- `owner_badge`: Owner badge verification (updates user `ownerVerified` flag on approval).

**Submission Inputs**:
- verificationType: One of the four types, required.
- documentNumber: Optional string.
- notes: Optional string.
- vehicleId: Optional (for insurance verification).

**Processing**:
- The system shall check for existing pending/submitted verifications of the same type to prevent duplicates.
- Initial status is set to "pending".
- Verification statuses progress: pending, submitted (after documents uploaded), approved, or rejected.

**Document Upload**: Supporting documents (images and PDFs, max 5MB) can be uploaded and are stored in `/uploads/verifications/{verificationId}/`. After upload, the status changes to "submitted".

**Admin Review**: Administrators can approve or reject verifications with optional notes. On approval, the system automatically updates the relevant user or vehicle flags.

**User Access**: Users can view their own verification submissions.
**Admin Access**: Administrators can list all verifications with optional filters by status and type.

#### 3.1.25 Notifications Listing

**Description**: The system shall allow authenticated users to view their in-app notifications.

**Inputs**:
- page: Page number (default 1).
- limit: Results per page (default 20, max 50).

**Processing**:
- The system shall fetch notifications for the current user, sorted by creation date (newest first).
- The system shall calculate total count and unread count separately.

**Outputs**:
- HTTP 200 response with `items`, `total`, `unread`/`unreadCount`, and `page`.

#### 3.1.26 Mark Notifications as Read

**Description**: The system shall allow users to mark specific notifications or all notifications as read.

**Inputs**:
- ids: Optional array of notification IDs. If omitted, all notifications for the user are marked as read.

**Processing**:
- The system shall update the `read` field to `true` for matching notifications belonging to the current user.

**Outputs**:
- HTTP 200 response with `modified` count.

#### 3.1.27 System Announcements

**Description**: The system shall allow administrators to create and broadcast system-wide announcements.

**Creation Inputs**:
- title: String, 3 to 200 characters, required.
- message: String, 5 to 2000 characters, required.
- targetRole: Optional role filter ("user", "owner", or "admin"). If null, announcement targets all roles.
- link: Optional URL for the announcement.
- expiresAt: Optional expiry datetime.
- broadcast: Boolean query parameter (default true). If true, the announcement is sent as an in-app notification to all targeted users.

**Processing**:
- The system shall create an announcement document.
- If broadcast is true, the system shall query all users matching the target role and create individual notification records for each user with the announcement message.
- Listing returns all announcements (active and expired), with pagination.
- Delete permanently removes the announcement.

**Outputs**:
- On creation: HTTP 201 response with the announcement document.
- On listing: HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.28 Saved Searches

**Description**: The system shall allow authenticated users to save and manage search queries for later use.

**Save Input**:
- name: String, 1 to 100 characters, required.
- filters: Object containing the search parameters, required.

**Processing**:
- The system shall limit each user to 10 saved searches. When the limit is reached, the oldest saved search is automatically removed.
- Users can list their saved searches (sorted by newest first) and delete individual saved searches.

#### 3.1.29 Recently Viewed Vehicles

**Description**: The system shall track and display recently viewed vehicles for authenticated users.

**Tracking**: When a user views a vehicle detail page, the system upserts a record in the `recently_viewed` collection with the current timestamp.

**Retrieval**: Returns up to 10 (configurable, max 20) recently viewed vehicles, sorted by most recently viewed, with full vehicle details for active vehicles.

#### 3.1.30 Admin Analytics

**Description**: The system shall provide comprehensive aggregated analytics data for administrators, including financial metrics, fraud detection, geographic distribution, and user growth.

**Inputs**:
- range: "weekly", "monthly", or "yearly" (default "monthly").

**Processing**:
- **Summary statistics**: Total users, total owners, total active vehicles, total bookings.
- **Period statistics**: Bookings created, cancelled, completed within the period.
- **Financial metrics**:
  - GMV (Gross Merchandise Value): Total value of confirmed/active/completed bookings in the period.
  - Commission Revenue: GMV multiplied by platform commission percentage (configurable, default 15%).
  - Period Revenue: Total of succeeded payments in the period.
  - Conversion Rate: Completed bookings divided by total period bookings.
  - Cancellation Rate: Cancelled bookings divided by total period bookings.
- **Monthly revenue trend**: Last 12 months of payment revenue and booking count.
- **Top 5 vehicles**: Vehicles with the highest booking count, with titles.
- **Booking status distribution**: Count of bookings per status.
- **Top 10 cities**: Cities with the most active vehicles.
- **User growth**: New user registrations per month for the last 12 months.
- **Fraud alerts**: Users with 2 or more disputed bookings, including name and email.

**Outputs**:
- HTTP 200 response with `summary`, `period` (including GMV, commission, conversion/cancellation rates), `monthlyTrend`, `topVehicles`, `statusDistribution`, `topCities`, `userGrowth`, and `fraudAlerts`.

#### 3.1.31 Owner Analytics

**Description**: The system shall provide analytics data for vehicle owners, including earnings, occupancy, and projections.

**Access**: Available to owners via `/api/owner/analytics/me` or to admins via `/api/admin/owner-analytics/{ownerId}`.

**Processing**:
- The system calculates: total bookings, period bookings, period revenue, owner earnings (revenue minus platform commission), occupancy rate (booked days divided by total possible days across all vehicles), cancellation rate, monthly projection (daily average extrapolated to 30 days), and monthly trend data.

**Outputs**:
- Response with `totalBookings`, `periodBookings`, `periodRevenue`, `ownerEarnings`, `occupancyRate`, `cancellationRate`, `monthlyProjection`, and `monthlyTrend`.

#### 3.1.32 Admin User CRUD

**Description**: The system shall allow administrators to fully manage user accounts.

**Operations**:
- **List Users**: Paginated listing with optional role filter and name/email search.
- **Create User**: Create a user with specified name, email, password, and role. A referral code and verification flags are auto-generated.
- **Update User**: Update name, role, verified status, and isVerified status.
- **Delete/Deactivate User**: Soft-delete by setting `isDeleted` flag (user cannot login).
- **Blacklist User**: Set `isBlacklisted` flag to true with a reason. Creates a record in the blacklist collection. Blacklisted users cannot login or create bookings.
- **Unblacklist User**: Remove the blacklist flag and delete the blacklist record.
- **List Blacklisted Users**: View all blacklisted users with their reasons and user details.

Each operation records an audit log entry.

#### 3.1.33 Admin Booking Management

**Description**: The system shall allow administrators to manage bookings with extended operations.

**Operations**:
- **List Bookings**: Paginated listing with filters by status, date range, user ID, and vehicle ID.
- **Create Booking**: Admin can create a booking on behalf of any user, with automatic pricing calculation and "confirmed" status.
- **Cancel Booking**: Admin can cancel any booking with automatic refund calculation based on the booking's cancellation policy.
- **Bulk Cancel**: Admin can cancel multiple bookings at once with a shared reason. Errors per booking are reported individually.
- **CSV Export**: Export filtered booking data as CSV with columns: BookingID, VehicleID, UserID, OwnerID, StartDate, EndDate, Days, Total, Status, CreatedAt.

#### 3.1.34 Admin Vehicle Management

**Description**: The system shall allow administrators to manage vehicles with extended operations.

**Operations**:
- **List Vehicles**: Paginated listing with optional status and owner ID filters.
- **Approve Vehicle**: Set vehicle status to "active".
- **Reject Vehicle**: Set vehicle status to "removed" with a rejection reason.
- **Bulk Approve**: Approve multiple vehicles at once. Errors per vehicle are reported individually.
- **Update Vehicle**: Admin can update any vehicle's fields directly.
- **Delete Vehicle**: Admin can soft-delete any vehicle by setting status to "removed".

Each operation records an audit log entry.

#### 3.1.35 Admin Payment Management

**Description**: The system shall allow administrators to view and manage payments.

**Operations**:
- **List Payments**: Paginated listing with optional booking ID and status filters.
- **Refund Payment**: Process a full or partial refund for a booking. The system creates a refund payment record (negative amount), updates the original payment status to "refunded", and updates the booking status to "refunded".

#### 3.1.36 Admin Dispute Management

**Description**: The system shall allow administrators to view all disputed bookings in a dedicated view, sorted by most recently updated.

#### 3.1.37 Platform Configuration Management

**Description**: The system shall allow administrators to view and update platform configuration values at runtime.

**Configurable Keys**:
- `gstPercentage`: GST percentage (default 18.0).
- `serviceFeePercentage`: Platform service fee percentage (default 5.0).
- `firstTimeDiscountPercent`: Discount for first-time users (default 10.0).
- `referralDiscountPercent`: Referral reward discount percentage (default 5.0).
- `platformCommissionPercent`: Platform commission on bookings (default 15.0).
- `surgePricingEnabled`: Toggle for surge pricing.
- `maxLateHours`: Maximum late return hours.
- `maintenanceMode`: Toggle for platform maintenance mode.

**Processing**:
- Only the whitelisted keys above can be updated.
- Each update is audit-logged with the new value.
- Default config values are seeded on application startup.

#### 3.1.38 Audit Log Retrieval

**Description**: The system shall allow administrators to view the audit trail of system actions with extended filtering.

**Filters**:
- action: Filter by action type.
- resourceType: Filter by resource type (e.g., "booking", "vehicle", "user").
- actorId: Filter by the user who performed the action.

**Possible audit actions recorded**: user_signup, user_login, user_admin_create, user_admin_update, user_admin_delete, user_blacklist, user_unblacklist, vehicle_create, vehicle_update, vehicle_delete, vehicle_approve, vehicle_reject, vehicle_bulk_approve, vehicle_admin_update, vehicle_admin_delete, booking_create, booking_confirm, booking_cancel, booking_admin_create, booking_admin_cancel, booking_bulk_cancel, booking_dispute, booking_resolve, booking_late_return, payment_charge, payment_refund, payment_admin_refund, review_create, hold_expired, coupon_create, coupon_toggle, coupon_delete, trip_report_pre_trip, trip_report_post_trip, verification_submit, verification_approved, verification_rejected, announcement_create, announcement_delete, config_update.

**Outputs**:
- HTTP 200 response with `items`, `total`, and `page`.

#### 3.1.39 Background Task Processing

**Description**: The system shall run automated background tasks on a periodic schedule.

**Tasks (executed every 60 seconds)**:

1. **Hold Expiry**: The system shall find all bookings with status "held" where `holdExpiresAt` has passed. For each, the system shall set the status to "cancelled" with reason "Hold expired", record an audit log, and send a notification to the renter.

2. **Booking Activation**: The system shall find all bookings with status "confirmed" where `startDate` has passed. The system shall batch-update their status to "active".

3. **Booking Completion**: The system shall find all bookings with status "active" where `endDate` has passed. The system shall batch-update their status to "completed".

4. **Archival**: The system can archive bookings that have been completed, cancelled, or refunded for more than 90 days by setting their status to "archived".

#### 3.1.40 Database Indexing

**Description**: The system shall create database indexes on application startup to ensure query performance.

**Indexes created**:
- `users`: Unique index on `email`.
- `vehicles`: Indexes on `ownerId`, `status`, and a text index on `title` and `description`.
- `bookings`: Indexes on `vehicleId`, `userId`, `ownerId`, `status`, `holdExpiresAt`, unique index on `idempotencyKey`, and a compound index on `(vehicleId, startDate, endDate)`.
- `payments`: Index on `bookingId`.
- `notifications`: Index on `userId` and compound index on `(userId, read)`.
- `audit_logs`: Indexes on `actorId`, `action`, and `createdAt`.
- `coupons`: Unique index on `code` and index on `isActive`.
- `trip_reports`: Indexes on `bookingId` and `reportType`.
- `verifications`: Indexes on `userId` and `status`.
- `announcements`: Index on `createdAt`.
- `saved_searches`: Index on `userId`.
- `recently_viewed`: Compound index on `(userId, vehicleId)` and index on `viewedAt`.
- `referrals`: Index on `referrerId` and unique index on `refereeId`.
- `blacklist`: Unique index on `userId`.

#### 3.1.41 Health Check

**Description**: The system shall provide a health check endpoint at `GET /api/health` that returns the application status and version without requiring authentication.

**Outputs**: `{"status": "healthy", "version": "1.0.0"}`

#### 3.1.42 Database Connection Lifecycle

**Description**: The system shall properly manage the database connection lifecycle. On startup, the system initializes indexes, starts background tasks, and creates the upload directory. On shutdown, the system cancels background tasks and closes the database connection.

---

### 3.2 Usability

#### 3.2.1 Responsive Design

The user interface shall be fully responsive and functional across desktop (1280px+), tablet (768px-1279px), and mobile (320px-767px) screen widths. The layout shall adapt using CSS grid and flexbox with Tailwind CSS responsive breakpoints (sm, md, lg, xl).

#### 3.2.2 Navigation Consistency

The application shall provide a persistent navigation bar on all pages with access to: Home, Search/Browse, Dashboard (role-specific), Notifications, and User Profile. The navbar shall adapt for mobile with a collapsible menu and shall indicate the currently active page.

#### 3.2.3 Mobile Bottom Navigation

The application shall provide a fixed bottom navigation bar on mobile devices with quick access to: Home, Search, Bookings, Notifications, and Profile. This provides thumb-friendly navigation for mobile users as an alternative to the top navbar.

#### 3.2.4 Loading State Feedback

All data-fetching operations shall display skeleton loading placeholders (shimmer animation) while data is being retrieved. The system provides four skeleton components: VehicleCardSkeleton, BookingRowSkeleton, StatCardSkeleton, and PageSkeleton.

#### 3.2.5 Error State Communication

When data loading fails, the system shall display a dedicated error state component with: an error icon, a descriptive error message, and a "Try again" button to retry the failed operation.

#### 3.2.6 Empty State Guidance

When a list or collection contains no items, the system shall display an empty state component with: a relevant icon, a descriptive title, a helpful message, and an optional action button (such as "Browse Vehicles" when a user has no bookings).

#### 3.2.7 Custom Toast Notifications

The system shall display themed toast notifications for user actions with the following types:
- **Success**: Green-themed toast for successful operations.
- **Error**: Red-themed toast for errors.
- **Warning**: Amber-themed toast for warnings.
- **Info**: Blue-themed toast for informational messages.
- **Booking**: Custom booking-themed toast for booking events.
- **Payment**: Custom payment-themed toast for payment events.
- **Review**: Custom review-themed toast for review submissions.
- **Celebration**: Confetti-styled toast for key achievements.

Toasts shall appear in the top-right corner and auto-dismiss after 3 seconds.

#### 3.2.8 Form Validation Feedback

Registration and login forms shall provide immediate visual feedback. The signup form shall include:
- A password strength indicator with four colored segments (red for weak, amber for fair, green for strong).
- Inline validation messages for invalid inputs.
- Referral code input field.

#### 3.2.9 Booking Progress Indicator

The booking flow shall display a multi-step progress indicator (stepper component) showing: the current step highlighted, completed steps with a check mark, and upcoming steps grayed out. Steps are connected by visual lines that change color on completion.

#### 3.2.10 Status Visualization

Booking statuses shall be displayed as color-coded badges with a colored dot indicator and label text:
- Neutral (gray): Draft, Archived
- Warning (amber): Pending, On Hold
- Success (green): Confirmed, Completed
- Info (blue): Active, Refunded
- Danger (red): Cancelled, Disputed

#### 3.2.11 Animated Tab Switching

Dashboard tab navigation shall use animated sliding pill indicators that smoothly transition to the active tab's position, providing clear visual feedback of the current view.

#### 3.2.12 Scroll-Based Animations

Content sections shall animate into view when scrolled into the viewport using IntersectionObserver-based reveal animations. Supported animation directions include: slide up, slide left, slide right, and scale in.

#### 3.2.13 Interactive Micro-Interactions

The interface shall include the following micro-interactions for enhanced user engagement:
- **Ripple Effect**: Material Design-style ripple animation on all button and link clicks.
- **Magnetic Effect**: Subtle cursor-following magnetic pull on hover for interactive elements.
- **3D Tilt Effect**: Perspective-based tilt on hover for card elements.
- **Glow Cursor**: Custom neon glowing cursor with trailing afterglow.
- **Mouse Spotlight**: Radial spotlight gradient following the mouse on featured sections.
- **Typewriter Effect**: Character-by-character text reveal with blinking cursor for hero text.
- **Confetti Celebration**: Canvas-based confetti burst animations for key actions (booking confirmation, payment success).

#### 3.2.14 Scroll Progress Indicator

A fixed progress bar shall be displayed at the top of the page showing how far the user has scrolled through the current page content.

#### 3.2.15 Page Transitions

Page navigation shall include smooth fade and slide transitions to provide visual continuity between routes.

#### 3.2.16 Drag Carousel

Vehicle image galleries and featured sections shall use a drag-to-scroll horizontal carousel with mouse and touch support and optional arrow navigation buttons.

#### 3.2.17 FAQ Accordion

The landing page shall include an expandable/collapsible FAQ section with smooth height animation for opening and closing answers.

#### 3.2.18 Decorative Elements

The interface shall include automotive-themed decorative elements:
- **Animated Car**: SVG car illustration with bouncing animation, headlight/taillight glows, and gradient body paint.
- **Road Divider**: Highway-style dashed line or tire track decorative horizontal divider.
- **Speedometer Gauge**: Animated 270-degree arc gauge for analytics visualization.

#### 3.2.19 Map View

The system shall provide a map view component displaying vehicle locations on an OpenStreetMap embed with selectable vehicle pins and navigation capabilities.

#### 3.2.20 Accessibility

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

When a booking is cancelled, the system shall atomically update the booking status, record the cancellation reason, and calculate the refund amount based on the booking's specific cancellation policy in a single database operation.

#### 3.3.7 Blacklist Enforcement

The system shall enforce blacklist status at two points:
- Login: Blacklisted users are denied authentication.
- Booking creation: Blacklisted users are prevented from creating new bookings.

#### 3.3.8 Duplicate Prevention

The system shall prevent duplicate submissions for:
- Trip reports: Only one pre-trip and one post-trip report per booking.
- Reviews: Only one review per user per booking.
- Verifications: Only one pending/submitted verification of each type per user.
- Coupon codes: Unique coupon codes enforced at the database level.

#### 3.3.9 Graceful Database Shutdown

The system shall properly close the MongoDB connection on application shutdown using the lifespan context manager, preventing connection leaks.

---

### 3.4 Performance

#### 3.4.1 API Response Time

Under normal load conditions (single server, fewer than 100 concurrent users), API response times shall meet the following targets:
- Simple read operations (GET profile, GET notifications): Less than 200 milliseconds.
- List operations with pagination (GET vehicles, GET bookings): Less than 500 milliseconds.
- Write operations (POST booking, POST payment): Less than 1000 milliseconds.
- Aggregation operations (GET admin analytics): Less than 2000 milliseconds.
- Geo-proximity search with distance calculation: Less than 1000 milliseconds.

#### 3.4.2 Database Query Optimization

All frequently queried fields shall be indexed (as specified in Section 3.1.40). Text search on vehicle title and description shall utilize MongoDB's built-in text index. Pagination shall be implemented using skip/limit to avoid loading entire collections into memory. The system creates indexes for 14 collections on startup.

#### 3.4.3 Frontend Bundle Optimization

The frontend shall use Vite for optimized production builds with tree-shaking, code splitting, and minification. Gzipped transfer sizes shall be optimized for fast initial load.

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
- Coupons: Maximum 100 items per page (default 20).
- Announcements: Maximum 100 items per page (default 20).
- Verifications: Maximum 100 items per page (default 20).
- Admin Payments: Maximum 100 items per page (default 20).

#### 3.4.7 Rate Limiting

The API shall implement rate limiting using SlowAPI based on client IP address to prevent abuse. Rate limiting protects against denial-of-service attacks and API abuse patterns.

#### 3.4.8 Animation Performance

Frontend animations (ripple effect, magnetic hover, tilt, glow cursor, scroll reveal) shall use direct DOM manipulation and CSS transforms instead of React state updates to minimize re-renders and maintain 60fps performance.

#### 3.4.9 Saved Search Limits

Users shall be limited to 10 saved searches. When the limit is reached, the oldest saved search is automatically removed, preventing unbounded growth.

---

### 3.5 Supportability

#### 3.5.1 Modular Architecture

The backend shall follow a modular structure:
- `app/models.py`: All Pydantic data models and schemas (555 lines covering 30+ models across all features).
- `app/config.py`: Environment-based configuration using Pydantic Settings (including surge, commission, and discount settings).
- `app/database.py`: Database connection, 14 collection references, index creation, default config seeding, and connection lifecycle.
- `app/auth.py`: Authentication and authorization utilities.
- `app/pricing.py`: Pricing calculation (including peak season, surge, coupon), refund logic (4 cancellation policies), late return fee calculation, and coupon discount computation.
- `app/tasks.py`: Background task definitions.
- `app/audit.py`: Audit logging utility.
- `app/routes/`: 12 individual route modules:
  - `auth.py`: Authentication, profile, password change, referral info.
  - `vehicles.py`: Vehicle CRUD, search with geo-proximity, image upload.
  - `bookings.py`: Booking lifecycle, coupon integration, late return, disputes.
  - `payments.py`: Payment charge and refund.
  - `admin.py`: Full admin portal (analytics, CRUD, bulk ops, config, blacklist, disputes, payments).
  - `notifications.py`: Notification listing and mark-read.
  - `reviews.py`: Review creation and retrieval.
  - `coupons.py`: Coupon CRUD and validation.
  - `trip_reports.py`: Trip report creation, photo upload, retrieval.
  - `verifications.py`: Verification submission, document upload, admin review.
  - `announcements.py`: Announcement creation, listing, deletion.
  - `search_utils.py`: Saved searches and recently viewed.

The frontend shall follow a component-based structure:
- `src/components/` (23 components): Navbar, Footer, Layout, VehicleCard, Skeletons, States, BookingStepper, StatusBadge, ProtectedRoute, MobileBottomNav, AnimatedCar, AnimatedTabs, CustomToast, DragCarousel, FAQAccordion, GlowCursor, MapView, MouseSpotlight, PageTransition, RoadDivider, ScrollProgress, ScrollReveal, SpeedometerGauge.
- `src/pages/` (9 pages): Landing, Auth (Login + Signup), SearchPage, VehicleDetails, UserDashboard, OwnerDashboard, AdminDashboard, ProfilePage, NotificationsPage.
- `src/hooks/` (6 custom hooks): useConfetti, useMagnetic, useRippleEffect, useScrollReveal, useTilt, useTypewriter.
- `src/store/`: State management (authStore).
- `src/lib/`: API client configuration (12 API modules).
- `src/types/`: TypeScript type definitions (357 lines, 25+ interfaces).

#### 3.5.2 TypeScript Type Safety

The frontend shall use TypeScript strict mode for compile-time type checking. All data models (User, Vehicle, Booking, Payment, Review, Notification, AuditLog, Coupon, TripReport, Verification, Announcement, SavedSearch, OwnerAnalytics, PlatformConfig) shall have corresponding TypeScript interfaces. API responses shall be typed to catch integration errors at build time.

#### 3.5.3 Environment-Based Configuration

All configurable values shall be loaded from environment variables (via `.env` file), including:
- `MONGO_URI`: MongoDB connection string.
- `DB_NAME`: Database name.
- `JWT_SECRET`: Secret key for JWT signing.
- `JWT_ALGORITHM`: Algorithm for JWT (default HS256).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry duration (default 60).
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiry (default 7, not currently used).
- `REDIS_URL`: Redis connection URL.
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins.
- `UPLOAD_DIR`: Directory path for uploaded files.
- `MAX_IMAGE_SIZE_MB`: Maximum image upload size (default 5).
- `HOLD_TTL_MINUTES`: Booking hold duration (default 15).
- `TAX_PERCENTAGE`: GST rate (default 18.0).
- `SERVICE_FEE_PERCENTAGE`: Platform fee rate (default 5.0).
- `FIRST_TIME_DISCOUNT_PERCENT`: First-time user discount (default 10.0).
- `REFERRAL_DISCOUNT_PERCENT`: Referral reward discount (default 5.0).
- `PLATFORM_COMMISSION_PERCENT`: Platform commission on bookings (default 15.0).
- `SURGE_MULTIPLIER`: Surge pricing multiplier (default 1.5).
- `SENTRY_DSN`: Optional Sentry error tracking DSN.

Additionally, the following config values are stored in the database `config` collection and can be updated at runtime by administrators: gstPercentage, serviceFeePercentage, firstTimeDiscountPercent, referralDiscountPercent, platformCommissionPercent, surgePricingEnabled, maxLateHours, maintenanceMode.

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
- canvas-confetti 1.9 for celebration animations.
- react-hook-form 7.49 for form state management.

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
- python-dateutil 2.8 for date parsing.
- aiofiles 23.2 for async file operations.
- Faker 22.2 for seed data generation.
- Sentry SDK 1.39 for optional error tracking.
- structlog 24.1 for structured logging.
- httpx 0.26 for async HTTP client operations.
- Celery 5.3 with Redis 5.0 for task queue support.

#### 3.6.3 Database Constraint

MongoDB 7 shall be used as the primary database. The system shall use 14 collections: `users`, `vehicles`, `bookings`, `payments`, `reviews`, `notifications`, `audit_logs`, `config`, `coupons`, `trip_reports`, `verifications`, `announcements`, `saved_searches`, `recently_viewed`, `referrals`, and `blacklist`.

#### 3.6.4 Authentication Architecture

Authentication shall be implemented using stateless JWT tokens. Tokens are stored in the browser's sessionStorage (not localStorage). Token expiry is 60 minutes by default. There is no refresh token mechanism implemented; users must re-login after token expiry.

#### 3.6.5 Routing Architecture

The frontend shall use client-side routing with React Router v6. Protected routes shall be implemented using an `Outlet`-based ProtectedRoute component that checks authentication status and user role before rendering child routes. The routing structure is:
- Public: `/`, `/auth/login`, `/auth/signup`, `/search`, `/vehicle/:id`
- Authenticated: `/profile`, `/notifications`
- User role: `/user/dashboard`
- Owner role: `/owner/dashboard`
- Admin role: `/admin`

#### 3.6.6 State Management Architecture

Client-side state management shall use Zustand with a single `authStore` for authentication state. Page-level data fetching shall use React's `useState` and `useEffect` hooks with the API client library. The API client module exports 12 named API objects for different resource domains.

---

### 3.7 Online User Documentation and Help System Requirements

The application shall provide the following in-application guidance:

1. **Demo Account Credentials**: The login page shall display collapsible demo account credentials for all three roles (admin, owner, user) to enable easy testing.
2. **Booking Next Steps**: After booking creation, the system shall return a `nextSteps` message guiding the user on what to do next (complete payment or wait for owner approval).
3. **Empty State Guidance**: When sections are empty (no bookings, no vehicles, no notifications), the system shall display contextual messages with action buttons guiding users to the appropriate next step.
4. **How It Works Section**: The landing page shall include a "How It Works" section explaining the rental process in three steps: Search, Book, and Drive.
5. **FAQ Section**: The landing page shall include an expandable FAQ accordion with answers to common questions about the platform.
6. **Trip Report Checklists**: Pre-trip and post-trip inspection checklists shall provide standardized templates guiding users through the vehicle condition assessment process.

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
| canvas-confetti | 1.9 | ISC | Confetti animations |
| react-hook-form | 7.49 | MIT | Form management |
| Pillow | 10.2 | HPND | Image processing |
| Celery | 5.3 | BSD | Task queue |
| structlog | 24.1 | MIT | Structured logging |
| Sentry SDK | 1.39 | MIT | Error tracking |

No commercially licensed or proprietary purchased components are used.

---

### 3.9 Interfaces

#### 3.9.1 User Interfaces

The application shall provide the following user interface screens:

1. **Landing Page**: Hero section with typewriter animated text, animated car illustration, search input, brand marquee, "How It Works" timeline, feature bento grid, FAQ accordion, testimonial cards, decorative road dividers, speedometer gauge statistics, and call-to-action section. Includes mouse spotlight, scroll reveal animations, and glow cursor effects.

2. **Login Page**: Split-screen layout with decorative side panel and login form. Includes collapsible demo credentials, email and password fields, and a link to the signup page.

3. **Signup Page**: Split-screen layout with registration form including name, email, password (with strength indicator), role selection (user/owner) with visual cards, and optional referral code input.

4. **Search/Browse Page**: Full-width vehicle listing with search bar, filter panel (fuel type, transmission, seat count, price range, location, instant booking), active filter chips, sort options (newest, price ascending, price descending, highest rated, most popular, nearest), paginated vehicle grid with drag carousel, result count, saved search functionality, recently viewed vehicles, and optional map view with vehicle pins.

5. **Vehicle Details Page**: Vehicle image gallery with drag carousel, title, specs (including mileage), location with map pin, cancellation policy badge, pricing breakdown (including peak season and late fees), availability calendar showing booked ranges, booking form with date selection and coupon code input, owner verification badge, review section with average rating and individual reviews.

6. **User Dashboard**: Tab-based view (All, Confirmed, Active, Completed, Cancelled) with animated tab switching. Each booking displays vehicle information, dates, status badge, price, coupon info, and late return fees. Sliding panel for booking details with cancel/dispute actions, trip report access, and payment history.

7. **Owner Dashboard**: Tab-based view with Vehicles, Bookings, and Analytics tabs. Vehicles tab shows owned vehicles in a card grid with edit/delete actions. Bookings tab shows bookings for owner's vehicles with late return reporting. Analytics tab displays revenue, occupancy rate, cancellation rate, monthly projection, and monthly trend chart using speedometer gauges and recharts. Includes vehicle creation/editing form with cancellation policy, geo-location, peak season configuration, and late fee settings.

8. **Admin Dashboard**: Tab-based view with Overview, Bookings, Vehicles, Users, Coupons, Verifications, Announcements, Configuration, and Audit tabs. Overview shows stat cards (GMV, commission, users, bookings), monthly revenue chart, top vehicles, status distribution, top cities, user growth, and fraud alerts. Bookings tab includes admin-create, cancel, bulk-cancel, and CSV export. Vehicles tab includes approve/reject/bulk-approve moderation. Users tab includes create/update/deactivate/blacklist/unblacklist. Coupons tab includes create/toggle/delete. Verifications tab includes approve/reject. Announcements tab includes create/delete. Configuration tab displays and allows editing of runtime config values. Audit tab shows filterable audit logs.

9. **Profile Page**: User profile display and edit form with name, phone, address, emergency contact, password change, referral code display with copy functionality, and verification submission.

10. **Notifications Page**: Paginated list of notifications with read/unread visual distinction, type-based icons, relative timestamps, announcement badges, and mark-as-read functionality.

11. **404 Not Found Page**: Minimal page with "404" heading, "Page not found" message, and a "Go Home" link.

#### 3.9.2 Hardware Interfaces

The system does not have any direct hardware interface requirements. It is a web application accessed through standard web browsers. The server hardware requirements are:
- Any system capable of running Docker containers.
- Minimum 2 GB RAM for running all services (MongoDB, Redis, Backend, Frontend).
- Sufficient disk space for the database, uploaded vehicle images, trip report photos, and verification documents.

#### 3.9.3 Software Interfaces

| Interface | Description |
|-----------|-------------|
| MongoDB 7 | The backend communicates with MongoDB through the Motor async driver over the MongoDB Wire Protocol (default port 27017). Connection string is configured via the `MONGO_URI` environment variable. 14 collections are used. |
| Redis 7 | The backend connects to Redis for rate limiting via the `REDIS_URL` environment variable (default port 6379). Communication uses the Redis RESP protocol. |
| File System | Vehicle images, trip report photos, and verification documents are stored on the server's local file system in the directory specified by `UPLOAD_DIR` (default: `./uploads`). Subdirectories: `/{vehicleId}/` for vehicle images, `/trip_reports/{reportId}/` for trip photos, `/verifications/{verificationId}/` for verification documents. Images are served as static files mounted at the `/uploads` URL path. |
| Browser APIs | The frontend uses `sessionStorage` for JWT token persistence, `IntersectionObserver` for scroll-based animations, `requestAnimationFrame` for cursor effects, and `fetch` (via Axios) for HTTP communication. |
| OpenStreetMap | The MapView component embeds OpenStreetMap tiles via iframe for displaying vehicle locations. |

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
- All third-party dependencies used in the project are open-source and distributed under permissive licenses (MIT, BSD, Apache 2.0, ISC, HPND) as detailed in Section 3.8.
- MongoDB Community Edition is used under the Server Side Public License (SSPL). The application does not offer MongoDB as a service, so SSPL obligations do not apply.
- No commercial license purchases are required for any component of the system.

---

### 3.11 Legal, Copyright and Other Notices

- The application displays "2025 DriveX. All rights reserved." in the footer.
- The footer includes the tagline "Built with care, not templates." as a brand statement.
- Vehicle images used in seed data are sourced from Unsplash and are used under the Unsplash License (free for commercial and non-commercial use).
- Map tiles are sourced from OpenStreetMap and used under the Open Data Commons Open Database License (ODbL).
- The application collects user registration data (name, email, hashed password), identity documents (Aadhaar, license numbers), emergency contact information, and vehicle location coordinates. No GDPR consent mechanism is currently implemented.
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
| Haversine Formula | Geo-distance calculations between user coordinates and vehicle locations use the standard haversine formula for great-circle distances on a sphere (Earth radius = 6371 km). |

---

## 4. Supporting Information

### 4.1 Data Model Summary

The system uses 14 MongoDB collections (expanded from 8 in Version 1.0):

| Collection | Key Fields | Description |
|------------|-----------|-------------|
| `users` | _id, name, email, passwordHash, role, verified, isVerified, isBlacklisted, referralCode, referralCount, referredBy, emergencyContact, createdAt, profile | Stores all user accounts with bcrypt-hashed passwords, referral tracking, blacklist status, and verification flags. |
| `vehicles` | _id, ownerId, title, description, images[], specs{}, pricing{}, status, location, geoLocation{}, approvalMode, instantBooking, cancellationPolicy, peakSeasonRanges[], availability[], avgRating, totalRatings, totalBookings, ownerVerified, insuranceVerified, createdAt | Stores vehicle listings with nested specs (including mileage), extended pricing (peak season rate, late fee), geo-coordinates, cancellation policies, and aggregated rating/booking statistics. |
| `bookings` | _id, vehicleId, userId, ownerId, startDate, endDate, days, priceBreakdown{}, status, holdExpiresAt, idempotencyKey, paymentMethod, couponCode, cancellationPolicy, cancelReason, refundAmount, lateReturnFee, actualReturnTime, tripStartReportId, tripEndReportId, extraCharges, createdAt, updatedAt | Stores booking records with coupon info, cancellation policy, late return tracking, trip report linkage, and extra charges. |
| `payments` | _id, bookingId, method, amount, status, transactionRef, originalPaymentId, initiatedBy, createdAt | Stores payment transaction records (charges and refunds) with admin refund tracking. |
| `reviews` | _id, bookingId, vehicleId, userId, rating, comment, createdAt | Stores user reviews with 1-5 star ratings. One review per user per booking. |
| `notifications` | _id, userId, message, type, read, link, announcementId, createdAt | Stores in-app notification messages with read status tracking and optional announcement linkage. |
| `audit_logs` | _id, actorId, action, resourceType, resourceId, payload, createdAt | Immutable log of all significant system actions (35+ action types). |
| `config` | _id, key, value, description, updatedAt, updatedBy | Stores runtime-configurable platform settings (GST, service fee, commission, discounts, etc.). |
| `coupons` | _id, code, type, value, minBookingAmount, maxDiscount, expiresAt, usageLimit, usedCount, perUserLimit, description, forFirstTimeOnly, isActive, userUsage{}, createdBy, createdAt | Stores discount coupons with usage tracking and restrictions. |
| `trip_reports` | _id, bookingId, reportedBy, reportType, checklist[], odometerReading, fuelLevel, photos[], notes, damageDescription, extraCharges, extraChargesReason, createdAt | Stores pre-trip and post-trip vehicle inspection reports with photo evidence. |
| `verifications` | _id, userId, vehicleId, verificationType, documentNumber, status, documentUrls[], notes, adminNotes, reviewedBy, reviewedAt, createdAt | Stores identity and insurance verification requests with admin review workflow. |
| `announcements` | _id, title, message, targetRole, link, expiresAt, createdBy, createdAt | Stores system-wide announcements with role-based targeting. |
| `saved_searches` | _id, userId, name, filters{}, createdAt | Stores user's saved search queries (max 10 per user). |
| `recently_viewed` | _id, userId, vehicleId, viewedAt | Tracks recently viewed vehicles per user for personalized browsing. |
| `referrals` | _id, referrerId, refereeId, referralCode, createdAt | Tracks referral relationships between users. |
| `blacklist` | _id, userId, reason, blacklistedBy, createdAt | Stores blacklisted user records with reasons. |

### 4.2 API Endpoint Reference

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | /api/auth/signup | No | - | Register a new user (with optional referral code) |
| POST | /api/auth/login | No | - | Authenticate and receive JWT |
| POST | /api/auth/logout | No | - | Client-side logout acknowledgement |
| GET | /api/auth/profile | Yes | Any | Get current user profile |
| PUT | /api/auth/profile | Yes | Any | Update user profile |
| POST | /api/auth/change-password | Yes | Any | Change user password |
| GET | /api/auth/referral | Yes | Any | Get referral info and stats |
| GET | /api/vehicles | No | - | Search/list vehicles with filters and geo-search |
| GET | /api/vehicles/:id | Yes | Any | Get vehicle details with booked ranges (tracks recently viewed) |
| POST | /api/vehicles | Yes | Owner, Admin | Create a new vehicle listing |
| PUT | /api/vehicles/:id | Yes | Owner (own), Admin | Update vehicle details |
| DELETE | /api/vehicles/:id | Yes | Owner (own), Admin | Soft-delete (remove) a vehicle |
| POST | /api/vehicles/:id/images | Yes | Owner (own), Admin | Upload vehicle images |
| GET | /api/bookings | Yes | Any (scoped) | List bookings (role-scoped) |
| GET | /api/bookings/:id | Yes | Renter, Owner, Admin | Get booking details |
| POST | /api/bookings | Yes | Any | Create a new booking (with coupon support) |
| POST | /api/bookings/:id/confirm | Yes | Renter, Owner, Admin | Confirm a booking |
| POST | /api/bookings/:id/cancel | Yes | Renter, Owner, Admin | Cancel a booking |
| POST | /api/bookings/:id/late-return | Yes | Owner, Admin | Report late return with fee |
| POST | /api/bookings/:id/dispute | Yes | Renter, Owner | Open a dispute |
| POST | /api/bookings/:id/resolve | Yes | Admin | Resolve a dispute |
| POST | /api/payments/charge | Yes | Renter, Admin | Process a payment charge |
| POST | /api/payments/refund | Yes | Admin | Process a refund |
| GET | /api/payments/booking/:id | Yes | Renter, Owner, Admin | Get payment history for a booking |
| POST | /api/coupons | Yes | Admin | Create a coupon |
| GET | /api/coupons | Yes | Admin | List all coupons |
| POST | /api/coupons/validate | Yes | Any | Validate a coupon code |
| PUT | /api/coupons/:id/toggle | Yes | Admin | Toggle coupon active status |
| DELETE | /api/coupons/:id | Yes | Admin | Delete a coupon |
| GET | /api/trip-reports/checklist/:type | Yes | Any | Get checklist template |
| POST | /api/trip-reports | Yes | Renter, Owner, Admin | Create a trip report |
| POST | /api/trip-reports/:id/photos | Yes | Reporter, Admin | Upload trip report photos |
| GET | /api/trip-reports/booking/:id | Yes | Renter, Owner, Admin | Get reports for a booking |
| GET | /api/trip-reports/:id | Yes | Any | Get a single trip report |
| POST | /api/verifications | Yes | Any | Submit a verification request |
| POST | /api/verifications/:id/documents | Yes | Submitter, Admin | Upload verification documents |
| GET | /api/verifications/my | Yes | Any | Get user's own verifications |
| GET | /api/verifications | Yes | Admin | List all verifications |
| POST | /api/verifications/:id/review | Yes | Admin | Approve or reject a verification |
| POST | /api/announcements | Yes | Admin | Create an announcement |
| GET | /api/announcements | Yes | Any | List active announcements |
| DELETE | /api/announcements/:id | Yes | Admin | Delete an announcement |
| POST | /api/search/saved | Yes | Any | Save a search query |
| GET | /api/search/saved | Yes | Any | List saved searches |
| DELETE | /api/search/saved/:id | Yes | Any | Delete a saved search |
| POST | /api/search/recently-viewed/:vehicleId | Yes | Any | Track a recently viewed vehicle |
| GET | /api/search/recently-viewed | Yes | Any | Get recently viewed vehicles |
| POST | /api/reviews | Yes | User | Submit a review |
| GET | /api/reviews/vehicle/:id | No | - | Get reviews for a vehicle |
| GET | /api/notifications | Yes | Any | Get paginated notifications |
| POST | /api/notifications/mark-read | Yes | Any | Mark notifications as read |
| GET | /api/admin/analytics | Yes | Admin | Get platform analytics (with GMV, fraud alerts) |
| GET | /api/admin/bookings | Yes | Admin | List all bookings (filtered) |
| POST | /api/admin/bookings | Yes | Admin | Create booking on behalf of user |
| POST | /api/admin/bookings/:id/cancel | Yes | Admin | Cancel a booking (admin) |
| POST | /api/admin/bookings/bulk-cancel | Yes | Admin | Bulk cancel bookings |
| GET | /api/admin/bookings/export | Yes | Admin | Export bookings as CSV |
| GET | /api/admin/vehicles | Yes | Admin | List all vehicles |
| POST | /api/admin/vehicles/:id/approve | Yes | Admin | Approve a vehicle |
| POST | /api/admin/vehicles/:id/reject | Yes | Admin | Reject a vehicle |
| POST | /api/admin/vehicles/bulk-approve | Yes | Admin | Bulk approve vehicles |
| PUT | /api/admin/vehicles/:id | Yes | Admin | Update any vehicle |
| DELETE | /api/admin/vehicles/:id | Yes | Admin | Remove any vehicle |
| GET | /api/admin/users | Yes | Admin | List all users (with search) |
| POST | /api/admin/users | Yes | Admin | Create a user |
| PUT | /api/admin/users/:id | Yes | Admin | Update a user |
| DELETE | /api/admin/users/:id | Yes | Admin | Deactivate a user |
| POST | /api/admin/users/blacklist | Yes | Admin | Blacklist a user |
| POST | /api/admin/users/:id/unblacklist | Yes | Admin | Remove user from blacklist |
| GET | /api/admin/blacklist | Yes | Admin | List blacklisted users |
| GET | /api/admin/audit-logs | Yes | Admin | View audit trail (with filters) |
| GET | /api/admin/config | Yes | Admin | Get platform configuration |
| PUT | /api/admin/config/:key | Yes | Admin | Update a config value |
| GET | /api/admin/payments | Yes | Admin | List all payments |
| POST | /api/admin/payments/refund | Yes | Admin | Process admin refund |
| GET | /api/admin/disputes | Yes | Admin | List disputed bookings |
| GET | /api/admin/owner-analytics/:id | Yes | Admin | Get owner's analytics |
| GET | /api/owner/analytics/me | Yes | Owner | Get own analytics |
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
- **ACTIVE**: Rental is currently in progress (start date reached). Pre-trip report may be submitted. Late return can be reported by owner.
- **COMPLETED**: Rental period has ended. Post-trip report may be submitted. Review can be created.
- **CANCELLED**: Booking was cancelled by user, owner, admin, or system (hold expired). Refund calculated per cancellation policy.
- **DISPUTED**: A dispute has been opened by the renter or owner.
- **REFUNDED**: Admin resolved a dispute with a refund.
- **ARCHIVED**: Old completed/cancelled/refunded bookings (90+ days).

### 4.4 Pricing Calculation Formula

```
For each day in the booking period:
    if peakSeasonRate is set AND day falls within a peakSeasonRange:
        dailyCost = peakSeasonRate
    else if day is Saturday or Sunday AND weekendRate is set:
        dailyCost = weekendRate
    else:
        dailyCost = baseRate

baseTotal = sum of all dailyCosts

Surge Pricing (if active):
    surgeAmount = baseTotal * (SURGE_MULTIPLIER - 1)     (default multiplier: 1.5)
    baseTotal = baseTotal * SURGE_MULTIPLIER

Discount Calculation:
    if days >= 30 AND monthlyDiscount is set:
        discountAmount = baseTotal * monthlyDiscount (e.g., 20%)
    else if days >= 7 AND weeklyDiscount is set:
        discountAmount = baseTotal * weeklyDiscount (e.g., 10%)
    else:
        discountAmount = 0

baseAfterDiscount = baseTotal - discountAmount

Fees:
    surgeFeeLine = surgeAmount (if applicable)
    cleaningFee = vehicle.cleaningFee (one-time)
    serviceFee = baseAfterDiscount * serviceFeePercentage / 100 (default 5%)

Subtotal = baseAfterDiscount + surgeFeeLine + cleaningFee + serviceFee

Coupon Discount (if applied):
    if coupon.type == "percentage":
        couponDiscount = subtotal * coupon.value / 100 (capped at coupon.maxDiscount)
    else if coupon.type == "fixed":
        couponDiscount = min(coupon.value, subtotal)
    subtotal = max(0, subtotal - couponDiscount)

Tax:
    tax = subtotal * taxPercentage / 100 (default 18% GST)

Total = subtotal + tax + securityDeposit
```

### 4.5 Cancellation and Refund Policies

```
Policy: FLEXIBLE
    > 24 hours before start:  100% refund of refundable amount
    12-24 hours:              50% refund
    < 12 hours:               0% refund

Policy: MODERATE (Default)
    > 48 hours before start:  100% refund of refundable amount
    24-48 hours:              50% refund
    < 24 hours:               0% refund

Policy: STRICT
    > 72 hours before start:  50% refund of refundable amount
    < 72 hours:               0% refund

Policy: NON-REFUNDABLE
    Any timing:               0% refund

Note: Security deposit is always fully refunded regardless of cancellation policy or timing.
Refundable amount = Total - Security Deposit
```

### 4.6 Late Return Fee Calculation

```
If actualReturnTime > scheduledEndDate:
    lateHours = ceil((actualReturnTime - scheduledEndDate) in hours)
    if vehicle.lateFeePerHour > 0:
        lateFee = lateHours * vehicle.lateFeePerHour
    else:
        hourlyBaseRate = vehicle.baseRate / 24
        lateFee = lateHours * hourlyBaseRate * 1.5   (default: 1.5x hourly rate)
```

### 4.7 Changes from Version 1.0 to Version 2.0

| Area | Change Description |
|------|-------------------|
| **Database Collections** | Expanded from 8 to 14 collections (added: coupons, trip_reports, verifications, announcements, saved_searches, recently_viewed, referrals, blacklist) |
| **Backend Route Modules** | Expanded from 7 to 12 modules (added: coupons, trip_reports, verifications, announcements, search_utils) |
| **Admin Module** | Expanded from ~306 to ~575 lines with full CRUD for users/vehicles/bookings, bulk operations, config management, blacklist, fraud alerts, GMV/commission analytics, disputes listing, payment management, owner analytics |
| **Pricing Engine** | Added peak season rate support, surge pricing multiplier, coupon discount application, and late return fee calculation |
| **Cancellation System** | Expanded from single moderate policy to four configurable policies (flexible, moderate, strict, non-refundable) stored per booking |
| **User Model** | Added isVerified, isBlacklisted, referralCode, referralCount, referredBy, emergencyContact fields |
| **Vehicle Model** | Added geoLocation, instantBooking, cancellationPolicy, peakSeasonRanges, lateFeePerHour, mileage, avgRating, totalRatings, totalBookings, ownerVerified, insuranceVerified fields |
| **Booking Model** | Added couponCode, cancellationPolicy, lateReturnFee, actualReturnTime, tripStartReportId, tripEndReportId, extraCharges fields |
| **Vehicle Search** | Added geo-proximity search (haversine), available_now filter, date-range availability filter, instant_booking filter, rating/popularity/distance sort options |
| **Auth System** | Added blacklist enforcement on login, referral code generation, referral tracking, password change, profile update, and referral info endpoints |
| **Config System** | Added runtime-configurable platform settings stored in database (GST, service fee, commission, discounts, surge, maintenance) with admin API |
| **Frontend Components** | Expanded from 11 to 23 components (added 12 interactive/animated components) |
| **Frontend Hooks** | Added 6 custom hooks for animations and micro-interactions |
| **Frontend API Modules** | Expanded from 7 to 12 API modules (added: couponsAPI, tripReportsAPI, verificationsAPI, announcementsAPI, searchAPI, ownerAPI) |
| **TypeScript Types** | Expanded from 215 to 357 lines with 25+ interfaces (added: Coupon, TripReport, Verification, Announcement, SavedSearch, OwnerAnalytics, PlatformConfig, etc.) |
| **Environment Config** | Added FIRST_TIME_DISCOUNT_PERCENT, REFERRAL_DISCOUNT_PERCENT, PLATFORM_COMMISSION_PERCENT, SURGE_MULTIPLIER settings |
| **Database Indexes** | Expanded from indexes on 6 collections to indexes on 14 collections |

---

### Sections Not Included

The following sections from the SRS template were evaluated and determined to be not applicable to the DriveX project:

1. **Full External Help System** -- A full external help system or documentation portal is not part of this project; only in-app guidance elements are provided (Section 3.7 covers what exists).
2. **Refresh Token Mechanism** -- The system uses only short-lived access tokens without refresh tokens, despite `REFRESH_TOKEN_EXPIRE_DAYS` being defined in configuration.
3. **Hardware Interfaces (Section 3.9.2)** -- Included with minimal content as the system is a pure web application with no direct hardware interface dependencies beyond standard server infrastructure.
4. **Real Payment Gateway Integration** -- Payments remain simulated. No Razorpay, Stripe, or PayPal integration documentation is included.
5. **Automated Document Verification** -- Identity verification is a manual admin review process. No OCR or automated document validation is documented.

All other sections from the template have been fully populated with project-specific requirements reflecting the current state of the codebase.
