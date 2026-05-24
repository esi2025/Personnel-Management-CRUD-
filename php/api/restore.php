<?php
require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// If not sent via raw input, check file upload
if (!$data && isset($_FILES['backup_file']) && is_uploaded_file($_FILES['backup_file']['tmp_name'])) {
    $fileContent = file_get_contents($_FILES['backup_file']['tmp_name']);
    $data = json_decode($fileContent, true);
}

if (!$data) {
    send_json(['error' => 'فایل پشتیبان یا اطلاعات ارسال شده معتبر نمی باشد یا خالی است.'], 400);
}

// Basic structural validation
$validKeys = ['personnel', 'cases', 'monitors', 'printers', 'assignments'];
$hasValues = false;

foreach ($validKeys as $key) {
    if (isset($data[$key]) && is_array($data[$key])) {
        $hasValues = true;
    }
}

if (!$hasValues) {
    send_json(['error' => 'ساختار فایل پشتیبان نامعتبر است.'], 400);
}

// Restore all tables
if (isset($data['personnel']) && is_array($data['personnel'])) {
    write_json_file('personnel.json', $data['personnel']);
}
if (isset($data['cases']) && is_array($data['cases'])) {
    write_json_file('cases.json', $data['cases']);
}
if (isset($data['monitors']) && is_array($data['monitors'])) {
    write_json_file('monitors.json', $data['monitors']);
}
if (isset($data['printers']) && is_array($data['printers'])) {
    write_json_file('printers.json', $data['printers']);
}
if (isset($data['assignments']) && is_array($data['assignments'])) {
    write_json_file('assignments.json', $data['assignments']);
}

send_json([
    'success' => true,
    'message' => 'بازیابی اطلاعات با موفقیت انجام شد.',
    'summary' => [
        'personnel' => count($data['personnel'] ?? []),
        'cases' => count($data['cases'] ?? []),
        'monitors' => count($data['monitors'] ?? []),
        'printers' => count($data['printers'] ?? []),
        'assignments' => count($data['assignments'] ?? [])
    ]
]);
