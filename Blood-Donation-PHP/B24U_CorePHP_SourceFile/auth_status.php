<?php
/**
 * HemoNexus Global - Session Status & Verification Gateway
 * Provides secure session introspection for decoupled Single Page Application
 */
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// 1. Check for Active Donor Session (user_name must be present and not empty)
if (!empty($_SESSION['user_name']) && !empty($_SESSION['id'])) {
    echo json_encode([
        'authenticated' => true,
        'role' => 'donor',
        'session_id' => session_id(),
        'user' => [
            'id' => strval($_SESSION['id']),
            'userName' => strval($_SESSION['user_name']),
            'userFullName' => strval($_SESSION['user_full_name'] ?? $_SESSION['user_name']),
            'userEmail' => strval($_SESSION['user_email'] ?? ''),
            'userNumber' => strval($_SESSION['user_number'] ?? ''),
            'bloodGroup' => strval($_SESSION['blood_group'] ?? 'O+'),
            'weight' => strval($_SESSION['weight'] ?? '68'),
            'bloodPressure' => strval($_SESSION['blood_pressure'] ?? '120/80'),
            'pulse' => strval($_SESSION['pulse'] ?? '72'),
            'hemoglobin' => strval($_SESSION['hemoglobin'] ?? '14.0'),
            'totalDonation' => intval($_SESSION['total_donation'] ?? 0),
            'city' => strval($_SESSION['city'] ?? ''),
            'state' => strval($_SESSION['state'] ?? ''),
            'healthReport' => strval($_SESSION['health_report'] ?? 'Verified'),
        ]
    ]);
    exit;
}

// 2. Check for Active Event Organizer Session (user_email must be present, user_name absent)
if (!empty($_SESSION['user_email']) && empty($_SESSION['user_name']) && !empty($_SESSION['id'])) {
    echo json_encode([
        'authenticated' => true,
        'role' => 'organizer',
        'session_id' => session_id(),
        'user' => [
            'id' => strval($_SESSION['id']),
            'userFullName' => strval($_SESSION['user_full_name'] ?? 'Organizer'),
            'userEmail' => strval($_SESSION['user_email']),
            'userNumber' => strval($_SESSION['user_number'] ?? ''),
            'city' => strval($_SESSION['city'] ?? ''),
            'eventDate' => strval($_SESSION['event_date'] ?? ''),
            'startTime' => strval($_SESSION['start_time'] ?? ''),
            'endTime' => strval($_SESSION['end_time'] ?? ''),
            'need' => strval($_SESSION['need'] ?? 'Blood'),
        ]
    ]);
    exit;
}

// 3. Unauthenticated State
echo json_encode([
    'authenticated' => false,
    'role' => null,
    'session_id' => session_id(),
    'pendingOtp' => isset($_SESSION['otp']) ? strval($_SESSION['otp']) : null,
    'user' => null
]);
exit;
