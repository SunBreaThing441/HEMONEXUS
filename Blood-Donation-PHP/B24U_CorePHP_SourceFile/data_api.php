<?php
/**
 * HemoNexus Global - Bio-Solidarity Grid Dynamic Data API Bridge
 * Connects the decoupled SPA frontend to MariaDB database (b24u)
 * and native Core PHP procedural session state.
 */
session_start();
include('connection.php');

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    /**
     * 1. Pending Blood Requests
     * Returns unfulfilled blood requests from b24u.requestblood
     */
    case 'requests':
        $blood_group = $_GET['blood_group'] ?? ($_SESSION['blood_group'] ?? null);
        $filter = $_GET['filter'] ?? 'all'; // 'all' or 'matched'
        
        $current_date = date("Y-m-d");
        $query = "SELECT id, patient_name, hospital_name, hospital_address, doctor_name, blood_group, city, contact_name, contact_number, contact_mail_id, other_message, required_date, status, donor_id 
                  FROM requestblood 
                  WHERE status = 0 ";
                  
        if ($filter === 'matched' && !empty($blood_group)) {
            $query .= " AND blood_group = '" . mysqli_real_escape_string($conn, $blood_group) . "' ";
        }
        
        $query .= " ORDER BY required_date ASC, id DESC";
        
        $result = mysqli_query($conn, $query);
        $requests = [];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $requests[] = [
                    'id' => strval($row['id']),
                    'patient_name' => $row['patient_name'],
                    'hospital_name' => $row['hospital_name'],
                    'hospital_address' => $row['hospital_address'],
                    'doctor_name' => $row['doctor_name'],
                    'blood_group' => $row['blood_group'],
                    'city' => $row['city'],
                    'contact_name' => $row['contact_name'],
                    'contact_number' => $row['contact_number'],
                    'contact_mail_id' => $row['contact_mail_id'],
                    'notes' => $row['other_message'] ?: 'Emergency whole blood/platelet transfusion required',
                    'required_date' => $row['required_date'],
                    'status' => intval($row['status']),
                    'donor_id' => $row['donor_id'] ? strval($row['donor_id']) : null
                ];
            }
        }
        
        echo json_encode(['success' => true, 'count' => count($requests), 'requests' => $requests]);
        break;

    /**
     * 2. Donor Donation History
     * Retrieves records from the donor's personal table {$user_name}
     */
    case 'donor_history':
        if (empty($_SESSION['user_name'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthenticated donor session']);
            exit;
        }
        $uname = $_SESSION['user_name'];
        $query = "SELECT * FROM `" . mysqli_real_escape_string($conn, $uname) . "` ORDER BY id DESC";
        $result = mysqli_query($conn, $query);
        $history = [];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $history[] = [
                    'id' => strval($row['id']),
                    'event_status' => intval($row['event_status'] ?? 0),
                    'event_name' => $row['event_name'] ?: 'Clinical Center Dispatch',
                    'donation_date' => $row['donation_date'] ?: date('Y-m-d'),
                    'donation_type' => $row['donation_type'] ?: 'Whole Blood',
                    'request_blood_status' => intval($row['request_blood_status'] ?? 0),
                    'patient_name' => $row['patient_name'] ?: 'Anonymous Recipient'
                ];
            }
        }
        
        echo json_encode(['success' => true, 'count' => count($history), 'history' => $history]);
        break;

    /**
     * 3. Camp Organizer Roster & Attendees
     * Retrieves records from the organizer's personal table {$user_email}
     */
    case 'camp_roster':
        if (empty($_SESSION['user_email']) || !empty($_SESSION['user_name'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthenticated organizer session']);
            exit;
        }
        $email = $_SESSION['user_email'];
        $query = "SELECT * FROM `" . mysqli_real_escape_string($conn, $email) . "` ORDER BY id DESC";
        $result = mysqli_query($conn, $query);
        $attendees = [];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $attendees[] = [
                    'id' => strval($row['id']),
                    'donorId' => strval($row['donor_id']),
                    'name' => $row['user_full_name'],
                    'blood' => $row['blood_group'],
                    'phone' => $row['user_number'],
                    'weight' => $row['weight'] . ' kg',
                    'vitals' => $row['blood_pressure'] . ' mmHg | ' . $row['pulse'] . ' bpm (Hb: ' . $row['hemoglobin'] . ')',
                    'type' => $row['donation_type']
                ];
            }
        }
        
        echo json_encode(['success' => true, 'count' => count($attendees), 'attendees' => $attendees]);
        break;

    /**
     * 4. Donor Lookup by ID
     * Used by Event Organizer Kiosk to retrieve verified donor info and baseline vitals
     */
    case 'donor_lookup':
        $donor_id = $_GET['donor_id'] ?? $_POST['donor_id'] ?? '';
        if (empty($donor_id)) {
            echo json_encode(['success' => false, 'error' => 'Donor ID required']);
            exit;
        }
        $donor_id_esc = mysqli_real_escape_string($conn, $donor_id);
        $query = "SELECT id, user_name, user_full_name, user_email, user_number, blood_group, weight, blood_pressure, pulse, hemoglobin, total_donation, city 
                  FROM donorlogin 
                  WHERE id = '$donor_id_esc' AND status = 0";
        $result = mysqli_query($conn, $query);
        
        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            // Set session did for seamless legacy compatibility
            $_SESSION['did'] = $row['id'];
            echo json_encode([
                'success' => true,
                'donor' => [
                    'id' => strval($row['id']),
                    'userName' => $row['user_name'],
                    'userFullName' => $row['user_full_name'],
                    'userEmail' => $row['user_email'],
                    'userNumber' => $row['user_number'],
                    'bloodGroup' => $row['blood_group'],
                    'weight' => strval($row['weight'] ?: '65'),
                    'bloodPressure' => strval($row['blood_pressure'] ?: '120/80'),
                    'pulse' => strval($row['pulse'] ?: '72'),
                    'hemoglobin' => strval($row['hemoglobin'] ?: '14.0'),
                    'totalDonation' => intval($row['total_donation'] ?: 0),
                    'city' => $row['city']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Donor ID not registered in database']);
        }
        break;

    /**
     * 5. Fresh Donor Telemetry / Health Metrics
     * Refreshes the donor's current vitals from donorlogin table
     */
    case 'donor_vitals':
        if (empty($_SESSION['id']) || empty($_SESSION['user_name'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthenticated donor session']);
            exit;
        }
        $did = mysqli_real_escape_string($conn, strval($_SESSION['id']));
        $query = "SELECT weight, blood_pressure, pulse, hemoglobin, blood_donation, pletlets_donation, plasama_donation, total_donation, attend_event, health_report, last_donation, last_place_donation 
                  FROM donorlogin 
                  WHERE id = '$did' AND status = 0";
        $result = mysqli_query($conn, $query);
        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            // Hydrate session with freshest metrics
            $_SESSION['weight'] = $row['weight'];
            $_SESSION['blood_pressure'] = $row['blood_pressure'];
            $_SESSION['pulse'] = $row['pulse'];
            $_SESSION['hemoglobin'] = $row['hemoglobin'];
            $_SESSION['total_donation'] = $row['total_donation'];
            $_SESSION['health_report'] = $row['health_report'];
            
            echo json_encode([
                'success' => true,
                'vitals' => [
                    'weight' => strval($row['weight'] ?: '68'),
                    'bloodPressure' => strval($row['blood_pressure'] ?: '120/80'),
                    'pulse' => strval($row['pulse'] ?: '72'),
                    'hemoglobin' => strval($row['hemoglobin'] ?: '14.0'),
                    'bloodDonation' => intval($row['blood_donation'] ?: 0),
                    'plateletsDonation' => intval($row['pletlets_donation'] ?: 0),
                    'plasmaDonation' => intval($row['plasama_donation'] ?: 0),
                    'totalDonation' => intval($row['total_donation'] ?: 0),
                    'attendEvent' => intval($row['attend_event'] ?: 0),
                    'healthReport' => strval($row['health_report'] ?: 'Optimal'),
                    'lastDonation' => strval($row['last_donation'] ?: 'None'),
                    'lastPlace' => strval($row['last_place_donation'] ?: 'None')
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to fetch donor vitals']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action parameter']);
        break;
}
mysqli_close($conn);
