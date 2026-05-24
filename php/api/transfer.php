<?php
require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

$equipmentCode = trim($data['equipmentCode'] ?? '');
$targetPersonnelCode = trim($data['targetPersonnelCode'] ?? '');
$today = trim($data['today'] ?? '');

if (empty($equipmentCode)) {
    send_json(['error' => 'کد تجهیز الزامی است.'], 400);
}

if (empty($today)) {
    $today = '1405/03/03'; // Fallback
}

// 1. Locate equipment in cases, monitors, or printers
$equipmentType = null;
$equipmentItem = null;
$equipmentIdx = -1;

$cases = read_json_file('cases.json');
foreach ($cases as $idx => $c) {
    if ($c['code'] === $equipmentCode) {
        $equipmentType = 'case';
        $equipmentItem = $c;
        $equipmentIdx = $idx;
        break;
    }
}

if (!$equipmentItem) {
    $monitors = read_json_file('monitors.json');
    foreach ($monitors as $idx => $m) {
        if ($m['code'] === $equipmentCode) {
            $equipmentType = 'monitor';
            $equipmentItem = $m;
            $equipmentIdx = $idx;
            break;
        }
    }
}

if (!$equipmentItem) {
    $printers = read_json_file('printers.json');
    foreach ($printers as $idx => $pr) {
        if ($pr['code'] === $equipmentCode) {
            $equipmentType = 'printer';
            $equipmentItem = $pr;
            $equipmentIdx = $idx;
            break;
        }
    }
}

if (!$equipmentItem) {
    send_json(['error' => 'تجهیزی با این کد یافت نشد.'], 404);
}

$currentOwnerCode = $equipmentItem['assignedTo'] ?? null;

// Normalize unassigned values
if (empty($targetPersonnelCode) || $targetPersonnelCode === 'null' || $targetPersonnelCode === 'warehouse') {
    $targetPersonnelCode = null;
}

if ($currentOwnerCode === $targetPersonnelCode && $targetPersonnelCode !== null) {
    send_json(['error' => 'این تجهیز در حال حاضر به همین شخص تخصیص یافته است.'], 400);
}

// 2. Fetch Personnel records for name mapping
$personnel = read_json_file('personnel.json');
$targetPersonnelName = null;

if ($targetPersonnelCode !== null) {
    $foundPers = false;
    foreach ($personnel as $p) {
        if ($p['code'] === $targetPersonnelCode) {
            $targetPersonnelName = $p['name'];
            $foundPers = true;
            break;
        }
    }
    if (!$foundPers) {
        send_json(['error' => 'پرسنل هدف با این کد پرسنلی یافت نشد.'], 404);
    }
}

// 3. Update Equipment record
$equipmentItem['assignedTo'] = $targetPersonnelCode;

if ($equipmentType === 'case') {
    $cases[$equipmentIdx] = $equipmentItem;
    write_json_file('cases.json', $cases);
} else if ($equipmentType === 'monitor') {
    $monitors[$equipmentIdx] = $equipmentItem;
    write_json_file('monitors.json', $monitors);
} else if ($equipmentType === 'printer') {
    $printers[$equipmentIdx] = $equipmentItem;
    write_json_file('printers.json', $printers);
}

// 4. Update Assignment Histories
$assignments = read_json_file('assignments.json');

// Close existing active assignment
if ($currentOwnerCode !== null) {
    foreach ($assignments as &$ass) {
        if ($ass['equipmentCode'] === $equipmentCode && 
            $ass['equipmentType'] === $equipmentType && 
            $ass['endDate'] === null) {
            $ass['endDate'] = $today;
        }
    }
}

// Add new assignment record if not returning to warehouse
if ($targetPersonnelCode !== null) {
    $assignments[] = [
        'id' => 'ass_' . uniqid(),
        'equipmentCode' => $equipmentCode,
        'equipmentType' => $equipmentType,
        'personnelCode' => $targetPersonnelCode,
        'personnelName' => $targetPersonnelName,
        'startDate' => $today,
        'endDate' => null
    ];
} else {
    // Return to warehouse history log
    $assignments[] = [
        'id' => 'ass_' . uniqid(),
        'equipmentCode' => $equipmentCode,
        'equipmentType' => $equipmentType,
        'personnelCode' => null,
        'personnelName' => 'خروج به انبار/تحویل به کارگاه',
        'startDate' => $today,
        'endDate' => $today
    ];
}

write_json_file('assignments.json', $assignments);

send_json([
    'success' => true,
    'equipmentType' => $equipmentType,
    'currentOwner' => $currentOwnerCode,
    'newOwner' => $targetPersonnelCode,
    'newOwnerName' => $targetPersonnelName
]);
