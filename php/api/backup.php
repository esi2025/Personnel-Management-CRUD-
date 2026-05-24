<?php
require_once __DIR__ . '/db.php';

$personnel = read_json_file('personnel.json');
$cases = read_json_file('cases.json');
$monitors = read_json_file('monitors.json');
$printers = read_json_file('printers.json');
$assignments = read_json_file('assignments.json');

$backup = [
    'personnel' => $personnel,
    'cases' => $cases,
    'monitors' => $monitors,
    'printers' => $printers,
    'assignments' => $assignments,
    'exportedAt' => date('Y-m-d H:i:s'),
    'system' => 'Omran Azarestan IT Tracking'
];

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="ict-backup-' . date('Y-m-d') . '.json"');

echo json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit;
