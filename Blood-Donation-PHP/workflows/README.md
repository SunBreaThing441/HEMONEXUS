# 🩸 B24U Blood Donation Management System — System Architecture & Workflow Guide

Welcome to the comprehensive workflow documentation for the **B24U (Blood 24 You) Blood Donation Management System**. This directory contains detailed architectural diagrams, process flows, state machines, and technical blueprints covering the Frontend, Backend, and Database tiers of the system.

---

## 📁 Workflow Documentation Structure

| Document | Focus Area | Description |
| :--- | :--- | :--- |
| **[`frontend-workflow.md`](frontend-workflow.md)** | **Presentation Tier** | User personas, portal navigation, client-side validation rules, responsive layouts, sidebar states, and page routing. |
| **[`backend-workflow.md`](backend-workflow.md)** | **Application Tier** | Procedural PHP processing lifecycle, session hydration, authentication & OTP email pipeline, business logic, and security controls. |
| **[`database-workflow.md`](database-workflow.md)** | **Data Tier** | Complete ERD, static table schemas (`donorlogin`, `eventlogin`, `requestblood`, `contribution`, `feedback`), dynamic per-user/event tables, and data lifecycles. |
| **[`frontend-modernization-architecture.md`](frontend-modernization-architecture.md)** | **HemoNexus Modernization** | UNESCO-inspired UI design system, glassmorphic palette, typography, biometric gauges, and decoupled SPA architecture. |
| **[`security-authentication-workflow.md`](security-authentication-workflow.md)** | **Full-Stack Security** | Session guards, workspace isolation engine, `auth_status.php` introspection, CSRF mitigation, and session flush handlers. |
| **[`data-integration-workflow.md`](data-integration-workflow.md)** | **Data Integration** | URLSearchParams HTTP client, two-step OTP verification, emergency request broadcast, donor claim, camp check-in, and dynamic MariaDB queries. |

---

## 🏗️ High-Level System Architecture

The B24U portal is architected using a traditional LAMP/WAMP stack (Linux/Windows, Apache, MySQL/MariaDB, Core PHP) with procedural scripting and session-driven state management.

```mermaid
flowchart TD
    subgraph Client["Presentation Tier (Frontend)"]
        UI_Guest["Public Guest Portal\n(Home, Blood Tips, Contribute, Contact)"]
        UI_Req["Emergency Blood Portal\n(Request Blood, View Pending)"]
        UI_Donor["Donor Dashboard & Sidenav\n(History, Health Reports, Profile)"]
        UI_Event["Event Organizer Dashboard\n(Event Status, Camp Check-in)"]
    end

    subgraph Server["Application Tier (Backend - Core PHP)"]
        Router["Apache / PHP Web Server (Port 80 / 8000)"]
        AuthModule["Auth & Session Manager\n(Session start, MD5 Verification, State Hydration)"]
        EmailModule["Email / OTP Dispatcher\n(PHPMailer SMTP Pipeline)"]
        DonorModule["Donor Business Logic\n(Registration, Profile Updates, Soft Delete)"]
        EventModule["Event & Camp Engine\n(Event Scheduling, Camp Attendee Check-in)"]
        ReqModule["Blood Request Engine\n(Matching, Donor Claim & Fulfillment)"]
    end

    subgraph Data["Data Tier (MySQL / MariaDB: b24u)"]
        DB_Static[("Static Tables\n- donorlogin\n- eventlogin\n- requestblood\n- contribution\n- feedback")]
        DB_Dynamic[("Dynamic Per-Entity Tables\n- Donor History: `{user_name}`\n- Event Attendees: `{user_email}`")]
    end

    %% Client to Server Links
    UI_Guest -->|HTTP GET/POST| Router
    UI_Req -->|HTTP GET/POST| Router
    UI_Donor -->|HTTP GET/POST + Session Cookie| Router
    UI_Event -->|HTTP GET/POST + Session Cookie| Router

    %% Server Internal Routing
    Router --> AuthModule
    Router --> DonorModule
    Router --> EventModule
    Router --> ReqModule

    %% Backend Dependencies
    DonorModule -->|Trigger OTP| EmailModule
    AuthModule -->|Query/Verify| DB_Static
    DonorModule -->|CRUD| DB_Static
    DonorModule -->|Create / Update| DB_Dynamic
    EventModule -->|CRUD| DB_Static
    EventModule -->|Create Table / Check-in| DB_Dynamic
    ReqModule -->|Claim & Fulfill| DB_Static
    ReqModule -->|Append to History| DB_Dynamic
```

---

## 🔄 End-to-End User Journey Overview

```mermaid
sequenceDiagram
    autonumber
    actor Requester as Patient / Requester
    actor Donor as Registered Donor
    actor Organizer as Event Organizer
    participant Frontend as Web Client (HTML/CSS/JS)
    participant Backend as Core PHP Server
    participant DB as MariaDB (b24u)

    %% 1. Blood Request Flow
    Note over Requester,DB: Phase 1: Emergency Blood Request
    Requester->>Frontend: Submits blood request form
    Frontend->>Backend: POST /request_blood.php (Patient, Hospital, Blood Group)
    Backend->>DB: INSERT INTO requestblood (status=0)
    Backend-->>Frontend: Confirmation Alert ("Details recorded...")

    %% 2. Donor Claim Flow
    Note over Donor,DB: Phase 2: Donor Claim & Fulfillment
    Donor->>Frontend: Logs in & views pending requests
    Frontend->>Backend: GET /pending_request_donor.php
    Backend->>DB: SELECT * FROM requestblood WHERE status=0 AND blood_group = donor_group
    DB-->>Backend: Matched blood requests
    Backend-->>Frontend: Display claimable requests table
    Donor->>Frontend: Clicks "Accept" on Patient ID
    Frontend->>Backend: POST /pending_request_donor.php (patient_id)
    Backend->>DB: UPDATE requestblood SET status=1, donor_id=donor.id
    Backend->>DB: UPDATE donorlogin SET blood_donation += 1, total_donation += 1
    Backend->>DB: INSERT INTO `{donor_username}` (donation_date, patient_name, type="Blood")
    Backend-->>Frontend: Alert ("Patient details sent to registered phone")

    %% 3. Camp Event Flow
    Note over Organizer,DB: Phase 3: Donation Camp & Donor Check-in
    Organizer->>Frontend: Logs in to Event Portal
    Frontend->>Backend: GET /donor_entry.php
    Organizer->>Frontend: Enters Donor ID & Vitals (BP, Pulse, Weight, Hb)
    Frontend->>Backend: POST /eventdata_entry.php
    Backend->>DB: UPDATE donorlogin SET vitals, donation_counts, attend_event += 1
    Backend->>DB: INSERT INTO `{event_email}` (donor_id, name, vitals, donation_type)
    Backend->>DB: INSERT INTO `{donor_username}` (event_name, donation_date, type)
    Backend-->>Frontend: Alert ("Donor Checked In & Metrics Recorded")
```

---

## 🔐 Key System Characteristics

1. **Procedural Modular Scripts**: Every action has a dedicated handling script (e.g. `eventdata_entry.php`, `process.php`, `connection.php`).
2. **Dual-Portal Access**: Dedicated dashboards for Donors (`donor_page.php`, `health_report.php`) and Event Organizers (`event_status.php`, `donor_entry.php`).
3. **Dynamic Tabular Storage**: In addition to static relational tables, the database dynamically provisions isolated history tables per donor and attendee tables per event organizer.
4. **Soft Deletions**: User accounts are retired using `status = 1` flags to preserve historical audit trails before dynamic tables are detached.
