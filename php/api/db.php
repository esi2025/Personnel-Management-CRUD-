<?php
/**
 * DB Helper for PHP Offline App
 * Persists data in local JSON files inside the data/ directory with proper file locking.
 */

define('DATA_DIR', __DIR__ . '/../data');

if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}

// Function to safely read a JSON file with shared lock
function read_json_file($filename, $default = []) {
    $filepath = DATA_DIR . '/' . $filename;
    if (!file_exists($filepath)) {
        return $default;
    }
    
    $fp = fopen($filepath, 'r');
    if (!$fp) {
        return $default;
    }
    
    flock($fp, LOCK_SH);
    $content = '';
    while (!feof($fp)) {
        $content .= fread($fp, 8192);
    }
    flock($fp, LOCK_UN);
    fclose($fp);
    
    $data = json_decode($content, true);
    return is_array($data) ? $data : $default;
}

// Function to safely write a JSON file with exclusive lock
function write_json_file($filename, $data) {
    $filepath = DATA_DIR . '/' . $filename;
    $fp = fopen($filepath, 'w+');
    if (!$fp) {
        return false;
    }
    
    flock($fp, LOCK_EX);
    $content = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    fwrite($fp, $content);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// Helper to respond with JSON
function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper to escape output
function escape($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// Initialize default data if empty
function init_default_data() {
    $personnel_file = 'personnel.json';
    $cases_file = 'cases.json';
    $monitors_file = 'monitors.json';
    $printers_file = 'printers.json';
    $assignments_file = 'assignments.json';

    if (!file_exists(DATA_DIR . '/' . $personnel_file)) {
        $demo_personnel = [
            [
                'id' => 'p1',
                'name' => 'علی علوی',
                'code' => '1001',
                'title' => 'مدیر پروژه',
                'department' => 'مهندسی',
                'location' => 'دفتر فنی کارگاه'
            ],
            [
                'id' => 'p2',
                'name' => 'زهرا حسینی',
                'code' => '1002',
                'title' => 'کارشناس فناوری اطلاعات',
                'department' => 'فناوری اطلاعات و ارتباطات',
                'location' => 'اتاق سرور'
            ]
        ];
        write_json_file($personnel_file, $demo_personnel);
    }

    if (!file_exists(DATA_DIR . '/' . $cases_file)) {
        $demo_cases = [
            [
                'code' => 'C-201',
                'motherboard' => 'ASUS H610M-K',
                'cpu' => 'Intel Core i5-12400',
                'vga' => 'Desktop Intel UHD Graphics',
                'hdd1' => 'SSD 512GB NVMe',
                'hdd2' => 'HDD 1TB WD Blue',
                'ramType' => 'DDR4',
                'ramQty' => '16GB',
                'assignedTo' => '1001'
            ],
            [
                'code' => 'C-202',
                'motherboard' => 'MSI B760-P',
                'cpu' => 'Intel Core i7-13700',
                'vga' => 'NVIDIA RTX 3050 8GB',
                'hdd1' => 'SSD 1TB NVMe',
                'hdd2' => '-',
                'ramType' => 'DDR5',
                'ramQty' => '32GB',
                'assignedTo' => null
            ]
        ];
        write_json_file($cases_file, $demo_cases);
    }

    if (!file_exists(DATA_DIR . '/' . $monitors_file)) {
        $demo_monitors = [
            [
                'code' => 'M-301',
                'model' => 'Samsung 24" LF24T350',
                'assignedTo' => '1001'
            ],
            [
                'code' => 'M-302',
                'model' => 'LG 22" 22MP400',
                'assignedTo' => '1002'
            ]
        ];
        write_json_file($monitors_file, $demo_monitors);
    }

    if (!file_exists(DATA_DIR . '/' . $printers_file)) {
        $demo_printers = [
            [
                'code' => 'P-401',
                'model' => 'HP LaserJet Pro M402dn',
                'assignedTo' => '1002'
            ],
            [
                'code' => 'P-402',
                'model' => 'Canon LBP6030w',
                'assignedTo' => null
            ]
        ];
        write_json_file($printers_file, $demo_printers);
    }

    if (!file_exists(DATA_DIR . '/' . $assignments_file)) {
        $demo_assignments = [
            [
                'id' => 'a1',
                'equipmentCode' => 'C-201',
                'equipmentType' => 'case',
                'personnelCode' => '1001',
                'personnelName' => 'علی علوی',
                'startDate' => '1405/01/15',
                'endDate' => null
            ],
            [
                'id' => 'a2',
                'equipmentCode' => 'M-301',
                'equipmentType' => 'monitor',
                'personnelCode' => '1001',
                'personnelName' => 'علی علوی',
                'startDate' => '1405/01/15',
                'endDate' => null
            ],
            [
                'id' => 'a3',
                'equipmentCode' => 'M-302',
                'equipmentType' => 'monitor',
                'personnelCode' => '1002',
                'personnelName' => 'زهرا حسینی',
                'startDate' => '1405/02/01',
                'endDate' => null
            ],
            [
                'id' => 'a4',
                'equipmentCode' => 'P-401',
                'equipmentType' => 'printer',
                'personnelCode' => '1002',
                'personnelName' => 'زهرا حسینی',
                'startDate' => '1405/02/01',
                'endDate' => null
            ]
        ];
        write_json_file($assignments_file, $demo_assignments);
    }
}

init_default_data();
