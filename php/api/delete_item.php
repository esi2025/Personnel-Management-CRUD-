<?php
require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

$type = $data['type'] ?? '';
$id = $data['id'] ?? ''; // used for personnel ID or equipment code

if (empty($type) || empty($id)) {
    send_json(['error' => 'اطلاعات گام‌های حذف بدرستی ارسال نشده است.'], 400);
}

$today = $data['today'] ?? '1405/03/03'; // Fallback date

switch ($type) {
    case 'personnel':
        $personnel = read_json_file('personnel.json');
        $codeToClear = '';
        $found = false;

        foreach ($personnel as $idx => $p) {
            if ($p['id'] === $id) {
                $codeToClear = $p['code'];
                array_splice($personnel, $idx, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            send_json(['error' => 'پرسنل یافت نشد.'], 404);
        }

        write_json_file('personnel.json', $personnel);

        // Clear unassigned equipment & close assignments
        if (!empty($codeToClear)) {
            // Cases
            $cases = read_json_file('cases.json');
            foreach ($cases as &$c) {
                if ($c['assignedTo'] === $codeToClear) {
                    $c['assignedTo'] = null;
                }
            }
            write_json_file('cases.json', $cases);

            // Monitors
            $monitors = read_json_file('monitors.json');
            foreach ($monitors as &$m) {
                if ($m['assignedTo'] === $codeToClear) {
                    $m['assignedTo'] = null;
                }
            }
            write_json_file('monitors.json', $monitors);

            // Printers
            $printers = read_json_file('printers.json');
            foreach ($printers as &$pr) {
                if ($pr['assignedTo'] === $codeToClear) {
                    $pr['assignedTo'] = null;
                }
            }
            write_json_file('printers.json', $printers);

            // Assignments
            $assignments = read_json_file('assignments.json');
            foreach ($assignments as &$ass) {
                if ($ass['personnelCode'] === $codeToClear && $ass['endDate'] === null) {
                    $ass['endDate'] = $today;
                }
            }
            write_json_file('assignments.json', $assignments);
        }

        send_json(['success' => true]);
        break;

    case 'case':
        $cases = read_json_file('cases.json');
        $found = false;
        foreach ($cases as $idx => $c) {
            if ($c['code'] === $id) {
                array_splice($cases, $idx, 1);
                $found = true;
                break;
            }
        }
        if (!$found) {
            send_json(['error' => 'کیس یافت نشد.'], 404);
        }
        write_json_file('cases.json', $cases);

        // Close assignment history
        $assignments = read_json_file('assignments.json');
        foreach ($assignments as &$ass) {
            if ($ass['equipmentCode'] === $id && $ass['equipmentType'] === 'case' && $ass['endDate'] === null) {
                $ass['endDate'] = $today;
            }
        }
        write_json_file('assignments.json', $assignments);

        send_json(['success' => true]);
        break;

    case 'monitor':
        $monitors = read_json_file('monitors.json');
        $found = false;
        foreach ($monitors as $idx => $m) {
            if ($m['code'] === $id) {
                array_splice($monitors, $idx, 1);
                $found = true;
                break;
            }
        }
        if (!$found) {
            send_json(['error' => 'مانیتور یافت نشد.'], 404);
        }
        write_json_file('monitors.json', $monitors);

        // Close assignment history
        $assignments = read_json_file('assignments.json');
        foreach ($assignments as &$ass) {
            if ($ass['equipmentCode'] === $id && $ass['equipmentType'] === 'monitor' && $ass['endDate'] === null) {
                $ass['endDate'] = $today;
            }
        }
        write_json_file('assignments.json', $assignments);

        send_json(['success' => true]);
        break;

    case 'printer':
        $printers = read_json_file('printers.json');
        $found = false;
        foreach ($printers as $idx => $pr) {
            if ($pr['code'] === $id) {
                array_splice($printers, $idx, 1);
                $found = true;
                break;
            }
        }
        if (!$found) {
            send_json(['error' => 'چاپگر یافت نشد.'], 404);
        }
        write_json_file('printers.json', $printers);

        // Close assignment history
        $assignments = read_json_file('assignments.json');
        foreach ($assignments as &$ass) {
            if ($ass['equipmentCode'] === $id && $ass['equipmentType'] === 'printer' && $ass['endDate'] === null) {
                $ass['endDate'] = $today;
            }
        }
        write_json_file('assignments.json', $assignments);

        send_json(['success' => true]);
        break;

    default:
        send_json(['error' => 'نوع آیتم نامعتبر است.'], 400);
}
