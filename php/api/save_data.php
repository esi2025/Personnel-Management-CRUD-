<?php
require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

if (empty($data['type'])) {
    send_json(['error' => 'نوع آیتم مشخص نشده است.'], 400);
}

$type = $data['type']; // personnel, case, monitor, printer
$isEdit = !empty($data['id']) || !empty($data['isEdit']);
$code = trim($data['code'] ?? '');

if (empty($code)) {
    send_json(['error' => 'وارد کردن کد الزامی است.'], 400);
}

switch ($type) {
    case 'personnel':
        $personnel = read_json_file('personnel.json');
        $name = trim($data['name'] ?? '');
        $title = trim($data['title'] ?? '');
        $department = trim($data['department'] ?? '');
        $location = trim($data['location'] ?? '');
        
        if (empty($name)) {
            send_json(['error' => 'نام کامل پرسنل الزامی است.'], 400);
        }
        
        // Find existing index by code or id
        $id = $data['id'] ?? '';
        $existingIndex = -1;
        $codeExists = false;
        
        foreach ($personnel as $idx => $p) {
            if ($p['code'] === $code && (!$isEdit || $p['id'] !== $id)) {
                $codeExists = true;
            }
            if ($isEdit && $p['id'] === $id) {
                $existingIndex = $idx;
            }
        }
        
        if ($codeExists) {
            send_json(['error' => 'کد پرسنلی تکراری است.'], 400);
        }
        
        $item = [
            'id' => $isEdit ? $id : 'p_' . uniqid(),
            'name' => $name,
            'code' => $code,
            'title' => $title,
            'department' => $department,
            'location' => $location
        ];
        
        if ($isEdit && $existingIndex !== -1) {
            $oldCode = $personnel[$existingIndex]['code'];
            $personnel[$existingIndex] = $item;
            
            // If personnel code changed, update active equipment mappings and histories
            if ($oldCode !== $code) {
                // Update cases
                $cases = read_json_file('cases.json');
                foreach ($cases as &$c) {
                    if ($c['assignedTo'] === $oldCode) {
                        $c['assignedTo'] = $code;
                    }
                }
                write_json_file('cases.json', $cases);
                
                // Update monitors
                $monitors = read_json_file('monitors.json');
                foreach ($monitors as &$m) {
                    if ($m['assignedTo'] === $oldCode) {
                        $m['assignedTo'] = $code;
                    }
                }
                write_json_file('monitors.json', $monitors);
                
                // Update printers
                $printers = read_json_file('printers.json');
                foreach ($printers as &$pr) {
                    if ($pr['assignedTo'] === $oldCode) {
                        $pr['assignedTo'] = $code;
                    }
                }
                write_json_file('printers.json', $printers);

                // Update assignment history
                $assignments = read_json_file('assignments.json');
                foreach ($assignments as &$ass) {
                    if ($ass['personnelCode'] === $oldCode) {
                        $ass['personnelCode'] = $code;
                        $ass['personnelName'] = $name;
                    }
                }
                write_json_file('assignments.json', $assignments);
            }
        } else {
            $personnel[] = $item;
        }
        
        write_json_file('personnel.json', $personnel);
        send_json(['success' => true, 'item' => $item]);
        break;

    case 'case':
        $cases = read_json_file('cases.json');
        $id = $data['oldCode'] ?? $code; // for cases, code acts as ID
        
        $existingIndex = -1;
        $codeExists = false;
        
        foreach ($cases as $idx => $c) {
            if ($c['code'] === $code && (!$isEdit || $c['code'] !== $id)) {
                $codeExists = true;
            }
            if ($isEdit && $c['code'] === $id) {
                $existingIndex = $idx;
            }
        }
        
        if ($codeExists) {
            send_json(['error' => 'کد کیس تکراری است.'], 400);
        }
        
        $item = [
            'code' => $code,
            'motherboard' => trim($data['motherboard'] ?? ''),
            'cpu' => trim($data['cpu'] ?? ''),
            'vga' => trim($data['vga'] ?? ''),
            'hdd1' => trim($data['hdd1'] ?? ''),
            'hdd2' => trim($data['hdd2'] ?? ''),
            'ramType' => trim($data['ramType'] ?? ''),
            'ramQty' => trim($data['ramQty'] ?? ''),
            'assignedTo' => $data['assignedTo'] ?? null
        ];
        
        if ($isEdit && $existingIndex !== -1) {
            $cases[$existingIndex] = $item;
        } else {
            $cases[] = $item;
        }
        
        write_json_file('cases.json', $cases);
        send_json(['success' => true, 'item' => $item]);
        break;

    case 'monitor':
        $monitors = read_json_file('monitors.json');
        $id = $data['oldCode'] ?? $code;
        
        $existingIndex = -1;
        $codeExists = false;
        
        foreach ($monitors as $idx => $m) {
            if ($m['code'] === $code && (!$isEdit || $m['code'] !== $id)) {
                $codeExists = true;
            }
            if ($isEdit && $m['code'] === $id) {
                $existingIndex = $idx;
            }
        }
        
        if ($codeExists) {
            send_json(['error' => 'کد مانیتور تکراری است.'], 400);
        }
        
        $item = [
            'code' => $code,
            'model' => trim($data['model'] ?? ''),
            'assignedTo' => $data['assignedTo'] ?? null
        ];
        
        if ($isEdit && $existingIndex !== -1) {
            $monitors[$existingIndex] = $item;
        } else {
            $monitors[] = $item;
        }
        
        write_json_file('monitors.json', $monitors);
        send_json(['success' => true, 'item' => $item]);
        break;

    case 'printer':
        $printers = read_json_file('printers.json');
        $id = $data['oldCode'] ?? $code;
        
        $existingIndex = -1;
        $codeExists = false;
        
        foreach ($printers as $idx => $pr) {
            if ($pr['code'] === $code && (!$isEdit || $pr['code'] !== $id)) {
                $codeExists = true;
            }
            if ($isEdit && $pr['code'] === $id) {
                $existingIndex = $idx;
            }
        }
        
        if ($codeExists) {
            send_json(['error' => 'کد چاپگر تکراری است.'], 400);
        }
        
        $item = [
            'code' => $code,
            'model' => trim($data['model'] ?? ''),
            'assignedTo' => $data['assignedTo'] ?? null
        ];
        
        if ($isEdit && $existingIndex !== -1) {
            $printers[$existingIndex] = $item;
        } else {
            $printers[] = $item;
        }
        
        write_json_file('printers.json', $printers);
        send_json(['success' => true, 'item' => $item]);
        break;

    default:
        send_json(['error' => 'نوع آیتم نامعتبر است.'], 400);
}
