# ⚙️ Backend Workflow — B24U Blood Donation Management System

This document outlines the server-side architecture, procedural request lifecycle, session hydration mechanisms, core business workflows, and security operations implemented across the PHP backend.

---

## 🏗️ Backend Execution Model & Runtime

The backend is built with Core PHP, executing procedurally through Apache or the PHP CLI development server. Every request follows a standard execution cycle:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web Browser
    participant Server as PHP Runtime (Apache / CLI)
    participant Config as connection.php
    participant DB as MariaDB / MySQL (b24u)

    Client->>Server: HTTP POST / GET (e.g. login_donor.php)
    Server->>Server: session_start() & error_reporting(1)
    Server->>Config: include('connection.php')
    Config->>DB: mysqli_connect(host, user, pass, "b24u")
    Config->>DB: mysqli_set_charset($conn, "utf8")
    Server->>Server: Validate $_POST / sanitize input
    Server->>DB: Execute SQL query via mysqli_query()
    DB-->>Server: Query Result / Resource Handle
    Server->>Server: Process Business Logic & Session Hydration
    Server-->>Client: Return HTML + Embedded JS Alert / Redirect
```

---

## 🔐 Authentication & Session Engine

### 1. Donor Authentication & Session Hydration (`login_donor.php`)

When a donor logs in, credentials are verified against `donorlogin` where `status = 0` (active account). Upon verification, the session is populated with comprehensive donor metrics:

```mermaid
flowchart TD
    Submit[POST Username & Password] --> HashPass[Hash password with md5]
    HashPass --> Query["SELECT * FROM donorlogin<br>WHERE user_name='$user_name'<br>AND password='$password'<br>AND status=0"]
    Query --> ExecQuery[Execute mysqli_query]
    
    ExecQuery --> CheckCount{Count == 1?}
    CheckCount -->|No| Reject["alert('Username/password Combination does not match')<br>Stay on login_donor.php"]
    
    CheckCount -->|Yes| Hydrate[Hydrate $_SESSION]
    
    subgraph SessionHydration["Session Keys Populated"]
        Hydrate --> S1["$_SESSION['id'] = $row['id']<br>$_SESSION['user_name'] = $row['user_name']<br>$_SESSION['user_full_name'] = $row['user_full_name']<br>$_SESSION['user_email'] = $row['user_email']<br>$_SESSION['user_number'] = $row['user_number']"]
        Hydrate --> S2["$_SESSION['date_of_birth'] = formatted DOB<br>$_SESSION['blood_group'] = $row['blood_group']<br>$_SESSION['weight'] = $row['weight']<br>$_SESSION['blood_pressure'] = $row['blood_pressure']<br>$_SESSION['pulse'] = $row['pulse']<br>$_SESSION['hemoglobin'] = $row['hemoglobin']"]
        Hydrate --> S3["$_SESSION['blood_donation'] = $row['blood_donation']<br>$_SESSION['total_donation'] = $row['total_donation']<br>$_SESSION['last_donation'] = $row['last_donation']<br>$_SESSION['attend_event'] = $row['attend_event']"]
    end
    
    SessionHydration --> AgeCalc{Has donor had a birthday?}
    AgeCalc -->|Age mismatch| RecalcAge["$from->diff($to)->y<br>UPDATE donorlogin SET age='$new_age'"]
    AgeCalc -->|Age matches| DoneAge[Keep current age]
    
    DoneAge --> RedirectDonor["Redirect to donor_page.php"]
    RecalcAge --> RedirectDonor
```

### 2. Event Organizer Authentication (`login_event.php`)

Similar to donor authentication, event organizer sessions are validated against `eventlogin`:
- Credentials verified: `user_email` and `md5(password)` where `status = 0`.
- Session hydrated with: `$_SESSION['id']`, `$_SESSION['user_full_name']`, `$_SESSION['user_email']`, `$_SESSION['user_number']`, `$_SESSION['event_date']`, `$_SESSION['start_time']`, `$_SESSION['end_time']`, `$_SESSION['city']`.
- Redirects to `event_status.php`.

### 3. Session Termination (`signout_donor.php` / `signout_event.php`)
Both scripts execute:
```php
session_start();
session_destroy();
echo "<script> alert('Logout Successfully'); window.location = 'login_donor.php'; </script>";
```

---

## 📧 Email & OTP Dispatch Pipeline (`sendemail.php`)

The email delivery subsystem utilizes **PHPMailer** via SMTP to deliver verification OTPs and account confirmation letters:

```mermaid
sequenceDiagram
    autonumber
    participant Script as process.php / forgot_donor.php
    participant Mailer as sendemail.php (PHPMailer)
    participant SMTP as Google SMTP (smtp.gmail.com:587)
    participant Recipient as User Mailbox

    Script->>Mailer: sendOTP($email, $subject, $body)
    Mailer->>Mailer: new PHPMailer()
    Mailer->>Mailer: $mail->isSMTP(), $mail->SMTPAuth = true
    Mailer->>Mailer: SMTPOptions (ssl: verify_peer=false)
    Mailer->>SMTP: Connect via TLS (smtp.gmail.com on port 587)
    SMTP->>SMTP: Authenticate via App Password
    SMTP->>Recipient: Deliver Email with 4-Digit OTP
    SMTP-->>Mailer: 250 Message Accepted for Delivery
    Mailer-->>Script: Returns 1 (Success) / 0 (Failure)
```

---

## ⚙️ Core Business Logic Modules

### 1. Donor Registration & Two-Step OTP Verification (`process.php`)

```mermaid
flowchart TD
    Step1[POST Form from registar_donor.php] --> Step1_Check{Password == Confirm Password?}
    Step1_Check -->|No| ErrPass[Alert: Passwords do not match]
    Step1_Check -->|Yes| UniqCheck[Check Unique Constraints in donorlogin]
    
    UniqCheck --> CheckUsername{Username exists?}
    CheckUsername -->|Yes| ErrUser[Alert: Username taken]
    CheckUsername -->|No| CheckEmail{Email exists?}
    CheckEmail -->|Yes| ErrMail[Alert: Email already registered]
    CheckEmail -->|No| CheckPhone{Phone exists?}
    CheckPhone -->|Yes| ErrPhone[Alert: Contact number registered]
    CheckPhone -->|No| GenOTP[Generate rand 1000..9999]
    
    GenOTP --> DispatchOTP[Call sendOTP via PHPMailer]
    DispatchOTP --> StoreTemp[Store Form Data & OTP in $_SESSION]
    StoreTemp --> RedirectOTP[Redirect to otp_form.php]
    
    subgraph Step2Verification["Step 2: OTP Validation"]
        RedirectOTP --> OTPInput[User submits OTP in otp_form.php]
        OTPInput --> VerifyOTP{strcmp $_POST otpno, $_SESSION otp == 0?}
        VerifyOTP -->|Mismatch| ErrOTP[Alert: Invalid OTP]
        VerifyOTP -->|Match| FinalInsert[INSERT INTO donorlogin]
        FinalInsert --> GetID[Fetch generated ID]
        GetID --> CreateHistTable["CREATE TABLE `{user_name}` (<br>id INT AUTO_INCREMENT PRIMARY KEY,<br>event_status INT, event_name VARCHAR,<br>donation_date VARCHAR, donation_type VARCHAR,<br>request_blood_status INT, patient_name VARCHAR)"]
        CreateHistTable --> SendWelcome[Send Account Created Confirmation Email]
        SendWelcome --> Complete[Redirect to login_donor.php]
    end
```

### 2. Event Camp Check-in & Metrics Sync (`eventdata_entry.php`)

When an event organizer checks in a donor at a blood camp, `eventdata_entry.php` performs an atomic sequence across three database structures:

```mermaid
sequenceDiagram
    autonumber
    actor Organizer as Event Organizer
    participant Script as eventdata_entry.php
    participant DB as MariaDB (b24u)

    Organizer->>Script: Submit Donor ID + Vitals (Weight, BP, Pulse, Hb, Need)
    Script->>DB: SELECT * FROM donorlogin WHERE id = $did AND status = 0
    DB-->>Script: Donor metrics (blood_donation, attend_event, etc.)
    
    Script->>Script: Calculate updated totals:<br>bl += 1 (if Blood), ev += 1, total_donation = bl + pl + pa
    
    Script->>DB: 1. UPDATE donorlogin SET vitals, donation totals, last_donation, last_place
    Script->>DB: 2. INSERT INTO `{donor_username}` (event_status=1, event_name, donation_date, donation_type)
    Script->>DB: 3. INSERT INTO `{event_email}` (donor_id, name, number, blood_group, vitals, donation_type)
    
    Script-->>Organizer: alert("Donor Added.") -> Redirect donor_entry.php
```

### 3. Blood Request Claim & Matching Engine (`pending_request_donor.php`)

```mermaid
flowchart TD
    DonorView[Donor opens pending_request_donor.php] --> FetchReq["SELECT * FROM requestblood<br>WHERE status=0 ORDER BY required_date"]
    FetchReq --> RenderTable[Display open emergencies with patient vitals & hospital]
    
    DonorView --> AcceptAction[Donor enters Patient ID & submits claim]
    AcceptAction --> BloodMatch{Does patient blood_group == donor blood_group?}
    BloodMatch -->|Mismatch| RejectClaim[Alert: Incompatible Blood Group]
    BloodMatch -->|Match| ClaimUpdate["UPDATE requestblood<br>SET status=1, donor_id=donor.id<br>WHERE id=patient_id"]
    
    ClaimUpdate --> IncrementDonor["UPDATE donorlogin<br>SET blood_donation = bl + 1, total_donation = tl + 1"]
    IncrementDonor --> InsertDonorHist["INSERT INTO `{donor_username}`<br>(donation_date, donation_type='Blood', request_blood_status=1, patient_name)"]
    InsertDonorHist --> NotifySuccess[Alert: Patient details sent to registered phone]
```

### 4. Account Soft-Deletion Engine (`delete_donor.php` / `delete_event.php`)

The deletion workflow ensures user records are deactivated safely while cleaning up dynamic tables:
1. Updates record status to inactive:
   ```sql
   UPDATE donorlogin SET status = 1 WHERE user_name = '$_SESSION[user_name]'
   ```
2. Drops the associated personal history table:
   ```sql
   DROP TABLE `$_SESSION[user_name]`
   ```
3. Destroys the session and routes back to login.

---

## 🔒 Security Architecture & Recommendations

| Aspect | Current Implementation | Production Hardening Recommendation |
| :--- | :--- | :--- |
| **Password Hashing** | `md5($password)` | Upgrade to `password_hash($pass, PASSWORD_BCRYPT)` |
| **SQL Execution** | Direct string concatenation with `mysqli_query` | Migrate to prepared statements (`$stmt = $conn->prepare(...)`) |
| **Session Protection** | Default PHP sessions | Add `session_regenerate_id(true)` and `HttpOnly; SameSite=Strict` cookies |
| **Input Sanitization** | Basic client regex validation | Add server-side `filter_var()`, `htmlspecialchars()`, and CSRF tokens |
| **Error Handling** | `error_reporting(1)` | Configure `display_errors = Off` and log errors to `error.log` in production |
