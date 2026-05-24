<?php
require_once __DIR__ . '/db.php';

// Check if user requests the blank template download
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['template'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="omran-azarestan-ict-template.csv"');
    
    // Add BOM for proper UTF-8 Excel opening
    echo "\xEF\xBB\xBF";
    
    // Header columns in Persian & English
    $headers = [
        'نام کامل پرسنل (Personnel Name)',
        'کد پرسنلی (Personnel Code - Unique)',
        'سمت (Job Title)',
        'واحد خدمتی (Department)',
        'موقعیت استقرار (Location)',
        'کد کیس (Case Code)',
        'مادربورد (Motherboard)',
        'پردازنده (CPU)',
        'کارت گرافیک (VGA)',
        'دیسک اول (HDD/SSD 1)',
        'دیسک دوم (HDD/SSD 2)',
        'نوع رم (RAM Type)',
        'مقدار رم (RAM Qty)',
        'کد مانیتور ۱ (Monitor 1 Code)',
        'مدل مانیتور ۱ (Monitor 1 Model)',
        'کد مانیتور ۲ (Monitor 2 Code)',
        'مدل مانیتور ۲ (Monitor 2 Model)',
        'کد پرینتر ۱ (Printer 1 Code)',
        'مدل پرینتر ۱ (Printer 1 Model)',
        'کد پرینتر ۲ (Printer 2 Code)',
        'مدل پرینتر ۲ (Printer 2 Model)',
        'کد پرینتر ۳ (Printer 3 Code)',
        'مدل پرینتر ۳ (Printer 3 Model)'
    ];
    
    $sample_row = [
        'علی علوی',
        '1001',
        'مدیر پروژه',
        'دفتر فنی',
        'کانکس مهندسی',
        'C-201',
        'ASUS H610',
        'Intel i5 12400',
        'GTX 1650',
        'SSD 512GB',
        '-',
        'DDR4',
        '16GB',
        'M-301',
        'Samsung 24"',
        '',
        '',
        'P-401',
        'HP LaserJet Pro M402',
        '',
        '',
        '',
        ''
    ];
    
    $fp = fopen('php://output', 'w');
    fputcsv($fp, $headers);
    fputcsv($fp, $sample_row);
    fclose($fp);
    exit;
}

// Otherwise, parse post upload CSV
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fileTmp = $_FILES['csv_file']['tmp_name'] ?? null;
    
    if (!$fileTmp || !is_uploaded_file($fileTmp)) {
        send_json(['error' => 'لطفاً یک فایل CSV معتبر بارگذاری کنید.'], 400);
    }
    
    $fp = fopen($fileTmp, 'r');
    if (!$fp) {
        send_json(['error' => 'عدم توانایی در خواندن فایل بارگذاری شده.'], 400);
    }
    
    // Skip BOM if present
    $bom = fread($fp, 3);
    if ($bom !== "\xEF\xBB\xBF") {
        rewind($fp);
    }
    
    // Read headers
    $headers = fgetcsv($fp);
    if (!$headers) {
        send_json(['error' => 'فایل انتخابی خالی است.'], 400);
    }
    
    $new_personnel = [];
    $new_cases = [];
    $new_monitors = [];
    $new_printers = [];
    $new_assignments = [];
    
    $today = date('1405/03/03'); // Default target Jalali year standard 1405
    
    while (($row = fgetcsv($fp)) !== false) {
        // Pad row to columns count
        $row = array_pad($row, 23, '');
        
        $pName = trim($row[0]);
        $pCode = trim($row[1]);
        $pTitle = trim($row[2]);
        $pDept = trim($row[3]);
        $pLoc = trim($row[4]);
        
        if (empty($pCode)) {
            continue; // Personnel code is primary unique key
        }
        
        // 1. Add Personnel
        $pid = 'p_' . uniqid() . '_' . $pCode;
        $new_personnel[] = [
            'id' => $pid,
            'name' => $pName ?: 'بدون نام',
            'code' => $pCode,
            'title' => $pTitle ?: '-',
            'department' => $pDept ?: '-',
            'location' => $pLoc ?: 'کارگاه بوشهر'
        ];
        
        // 2. Add Case (if code exists)
        $caseCode = trim($row[5]);
        if (!empty($caseCode)) {
            $new_cases[] = [
                'code' => $caseCode,
                'motherboard' => trim($row[6]) ?: '-',
                'cpu' => trim($row[7]) ?: '-',
                'vga' => trim($row[8]) ?: '-',
                'hdd1' => trim($row[9]) ?: '-',
                'hdd2' => trim($row[10]) ?: '-',
                'ramType' => trim($row[11]) ?: 'DDR4',
                'ramQty' => trim($row[12]) ?: '8GB',
                'assignedTo' => $pCode
            ];
            
            // Add Assignment History
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $caseCode,
                'equipmentType' => 'case',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
        
        // 3. Monitor 1
        $mon1Code = trim($row[13]);
        $mon1Model = trim($row[14]);
        if (!empty($mon1Code)) {
            $new_monitors[] = [
                'code' => $mon1Code,
                'model' => $mon1Model ?: 'مدل نامشخص',
                'assignedTo' => $pCode
            ];
            
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $mon1Code,
                'equipmentType' => 'monitor',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
        
        // 4. Monitor 2
        $mon2Code = trim($row[15]);
        $mon2Model = trim($row[16]);
        if (!empty($mon2Code)) {
            $new_monitors[] = [
                'code' => $mon2Code,
                'model' => $mon2Model ?: 'مدل نامشخص',
                'assignedTo' => $pCode
            ];
            
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $mon2Code,
                'equipmentType' => 'monitor',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
        
        // 5. Printer 1
        $pr1Code = trim($row[17]);
        $pr1Model = trim($row[18]);
        if (!empty($pr1Code)) {
            $new_printers[] = [
                'code' => $pr1Code,
                'model' => $pr1Model ?: 'مدل چاپگر نامشخص',
                'assignedTo' => $pCode
            ];
            
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $pr1Code,
                'equipmentType' => 'printer',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
        
        // 6. Printer 2
        $pr2Code = trim($row[19]);
        $pr2Model = trim($row[20]);
        if (!empty($pr2Code)) {
            $new_printers[] = [
                'code' => $pr2Code,
                'model' => $pr2Model ?: 'مدل چاپگر نامشخص',
                'assignedTo' => $pCode
            ];
            
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $pr2Code,
                'equipmentType' => 'printer',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
        
        // 7. Printer 3
        $pr3Code = trim($row[21]);
        $pr3Model = trim($row[22]);
        if (!empty($pr3Code)) {
            $new_printers[] = [
                'code' => $pr3Code,
                'model' => $pr3Model ?: 'مدل چاپگر نامشخص',
                'assignedTo' => $pCode
            ];
            
            $new_assignments[] = [
                'id' => 'ass_' . uniqid(),
                'equipmentCode' => $pr3Code,
                'equipmentType' => 'printer',
                'personnelCode' => $pCode,
                'personnelName' => $pName ?: 'بدون نام',
                'startDate' => $today,
                'endDate' => null
            ];
        }
    }
    
    fclose($fp);
    
    // Save all to JSON directories
    write_json_file('personnel.json', $new_personnel);
    write_json_file('cases.json', $new_cases);
    write_json_file('monitors.json', $new_monitors);
    write_json_file('printers.json', $new_printers);
    write_json_file('assignments.json', $new_assignments);
    
    send_json([
        'success' => true,
        'message' => 'بارگذاری CSV با موفقیت انجام شد و اطلاعات کل سامانه جایگزین گردید.',
        'summary' => [
            'personnel' => count($new_personnel),
            'cases' => count($new_cases),
            'monitors' => count($new_monitors),
            'printers' => count($new_printers),
            'assignments' => count($new_assignments)
        ]
    ]);
}
