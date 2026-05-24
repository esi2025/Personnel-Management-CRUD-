<?php
require_once __DIR__ . '/db.php';

$personnel = read_json_file('personnel.json');
$cases = read_json_file('cases.json');
$monitors = read_json_file('monitors.json');
$printers = read_json_file('printers.json');
$assignments = read_json_file('assignments.json');

send_json([
    'personnel' => $personnel,
    'cases' => $cases,
    'monitors' => $monitors,
    'printers' => $printers,
    'assignments' => $assignments
]);
