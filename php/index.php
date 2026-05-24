<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سامانه مدیریت هوشمند تجهیزات فناوری اطلاعات - شرکت عمران آذرستان</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Main App Wrapper -->
    <div class="app-container">
        
        <!-- Header Section -->
        <header class="app-header">
            <div class="header-content">
                <div class="header-logo">🏭</div>
                <div class="header-titles">
                    <h1>شرکت عمران آذرستان</h1>
                    <h2>کارگاه بوشهر | واحد فناوری اطلاعات و ارتباطات (ICT)</h2>
                    <p class="header-badge">سامانه آفلاین مدیریت و شناسنامه تجهیزات رایانه‌ای</p>
                </div>
            </div>
            <div class="header-meta">
                <div class="current-date" id="jalali-clock">تاریخ: ۱۴۰۵/۰۳/۰۳ | زمان: --:--</div>
                <div class="system-status">● سامانه فعال و آفلاین (دارای امنیت محلی)</div>
            </div>
        </header>

        <!-- Quick Search Bar (Global Filter) -->
        <div class="search-section">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="global-search" placeholder="جستجوی فوری و سراسری میان پرسنل، کیس‌ها، مانیتورها یا پرینترها (بر اساس نام، کد پرسنلی یا سریال تجهیز)..." oninput="handleGlobalSearch()">
                <span class="clear-search" onclick="clearSearchInput()" id="clear-search-btn">✕</span>
            </div>
            <div id="search-results-container" class="search-results-panel hidden">
                <div class="panel-header">
                    <h3>نتایج جستجوی فوری</h3>
                    <button class="close-panel-btn" onclick="closeSearchPanel()">بستن ×</button>
                </div>
                <div id="search-results-list" class="search-grid"></div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="navigation-tabs" id="nav-tabs">
            <button class="nav-tab active" data-tab="personnel-tab">👥 پرسنل</button>
            <button class="nav-tab" data-tab="cases-tab">🖥️ کیس‌ها (رایانه‌ها)</button>
            <button class="nav-tab" data-tab="monitors-tab">📺 مانیتورها</button>
            <button class="nav-tab" data-tab="printers-tab">🖨️ پرینترها</button>
            <button class="nav-tab highlight-tab" data-tab="transfer-tab">🔄 جابجایی هوشمند</button>
            <button class="nav-tab" data-tab="history-tab">📜 تاریخچه جابجایی</button>
            <button class="nav-tab" data-tab="reporting-tab">📊 گزارش‌گیری و شناسنامه</button>
            <button class="nav-tab" data-tab="backup-tab">⚙️ پشتیبان‌گیری و CSV</button>
            <button class="nav-tab plus-tab" data-tab="add-new-tab" title="ثبت آیتم جدید">➕ ثبت جدید</button>
        </nav>

        <!-- Main Workspace -->
        <main class="workspace-area">

            <!-- TAB 1: Personnel Management -->
            <section id="personnel-tab" class="tab-pane active">
                <div class="pane-header">
                    <h3>لیست پرسنل شرکت</h3>
                    <div class="pane-actions">
                        <button class="btn btn-primary" onclick="switchTab('add-new-tab'); document.getElementById('add-item-type').value = 'personnel'; updateAddFormFields();">👥 ثبت پرسنل جدید</button>
                        <button class="btn btn-success" onclick="exportTableToCSV('personnel-table', 'personnel-export')">📥 خروجی اکسل (CSV)</button>
                        <button class="btn btn-danger" onclick="printTable('personnel-tab', 'لیست پرسنل شرکت عمران آذرستان')">🖨️ چاپ / PDF</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="personnel-table">
                        <thead>
                            <tr>
                                <th>نام کامل</th>
                                <th>کد پرسنلی</th>
                                <th>سمت</th>
                                <th>واحد خدمتی</th>
                                <th>موقعیت استقرار</th>
                                <th>تجهیزات تخصیص‌یافته</th>
                                <th>عملیات مدیریت</th>
                            </tr>
                        </thead>
                        <tbody id="personnel-tbody">
                            <!-- Populated via Javascript -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TAB 2: Cases Management -->
            <section id="cases-tab" class="tab-pane">
                <div class="pane-header">
                    <h3>لیست کیس‌های رایانه‌ای</h3>
                    <div class="pane-actions">
                        <button class="btn btn-primary" onclick="switchTab('add-new-tab'); document.getElementById('add-item-type').value = 'case'; updateAddFormFields();">🖥️ ثبت کیس جدید</button>
                        <button class="btn btn-success" onclick="exportTableToCSV('cases-table', 'cases-export')">📥 خروجی اکسل (CSV)</button>
                        <button class="btn btn-danger" onclick="printTable('cases-tab', 'لیست کیس‌ها - شرکت عمران آذرستان')">🖨️ چاپ / PDF</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="cases-table">
                        <thead>
                            <tr>
                                <th>کد کیس</th>
                                <th>مادربورد</th>
                                <th>پردازنده CPU</th>
                                <th>رم RAM</th>
                                <th>گرافیک VGA</th>
                                <th>ذخیره‌سازیSSD/HDD</th>
                                <th>موقعیت و کاربر فعلی</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="cases-tbody">
                            <!-- Populated via Javascript -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TAB 3: Monitors Management -->
            <section id="monitors-tab" class="tab-pane">
                <div class="pane-header">
                    <h3>لیست مانیتورها</h3>
                    <div class="pane-actions">
                        <button class="btn btn-primary" onclick="switchTab('add-new-tab'); document.getElementById('add-item-type').value = 'monitor'; updateAddFormFields();">📺 ثبت مانیتور جدید</button>
                        <button class="btn btn-success" onclick="exportTableToCSV('monitors-table', 'monitors-export')">📥 خروجی اکسل (CSV)</button>
                        <button class="btn btn-danger" onclick="printTable('monitors-tab', 'لیست مانیتورها - شرکت عمران آذرستان')">🖨️ چاپ / PDF</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="monitors-table">
                        <thead>
                            <tr>
                                <th>کد مانیتور</th>
                                <th>مدل و مشخصات</th>
                                <th>کاربر فعلی</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="monitors-tbody">
                            <!-- Populated via Javascript -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TAB 4: Printers Management -->
            <section id="printers-tab" class="tab-pane">
                <div class="pane-header">
                    <h3>لیست چاپگرها و پرینترها</h3>
                    <div class="pane-actions">
                        <button class="btn btn-primary" onclick="switchTab('add-new-tab'); document.getElementById('add-item-type').value = 'printer'; updateAddFormFields();">🖨️ ثبت پرینتر جدید</button>
                        <button class="btn btn-success" onclick="exportTableToCSV('printers-table', 'printers-export')">📥 خروجی اکسل (CSV)</button>
                        <button class="btn btn-danger" onclick="printTable('printers-tab', 'لیست پرینترها - شرکت عمران آذرستان')">🖨️ چاپ / PDF</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="printers-table">
                        <thead>
                            <tr>
                                <th>کد پرینتر</th>
                                <th>مدل و مشخصات</th>
                                <th>کاربر فعلی</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="printers-tbody">
                            <!-- Populated via Javascript -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TAB 5: Intelligent Equipment Transfer -->
            <section id="transfer-tab" class="tab-pane">
                <div class="transfer-grid-section">
                    
                    <!-- Left: Transfer Form Container -->
                    <div class="card-form shadow-md">
                        <div class="card-form-header">
                            <h3>🔄 جابجایی هوشمند تجهیزات اداری و صنعتی</h3>
                            <p>برای ترانسفر یا خروج به انبار کدهای مربوطه را وارد نمایید</p>
                        </div>
                        <div class="form-body">
                            
                            <!-- Step 1: Input Equipment Code -->
                            <div class="form-group">
                                <label for="tx-equipment-code">کد کالا یا شماره اموال تجهیز (کیس، مانیتور یا پرینتر):</label>
                                <div class="input-with-action">
                                    <input type="text" id="tx-equipment-code" placeholder="مثال: C-201, M-301, P-401..." oninput="previewEquipmentForTransfer()">
                                    <button class="btn btn-secondary" onclick="previewEquipmentForTransfer()">بررسی</button>
                                </div>
                            </div>

                            <!-- Live Preview Equipment Panel -->
                            <div id="tx-eq-preview" class="live-preview-box hidden">
                                <div class="preview-title">🖥️ مشخصات تجهیز شناسایی شده:</div>
                                <div class="preview-details">
                                    <div class="detail-row"><span>کد سخت‌افزاری:</span> <strong id="p-eq-code">--</strong></div>
                                    <div class="detail-row"><span>نوع سخت‌افزار:</span> <span id="p-eq-type" class="badge">--</span></div>
                                    <div class="detail-row"><span>مشخصات فنی/مدل:</span> <span id="p-eq-info">--</span></div>
                                    <div class="detail-row"><span>صاحب فعلی تحویل گیرنده:</span> <strong id="p-eq-owner" class="text-danger">بدون تخصیص (داخل انبار)</strong></div>
                                </div>
                            </div>

                            <!-- Step 2: Input Target Personnel Code -->
                            <div class="form-group margin-top-lg">
                                <label for="tx-personnel-code">کد پرسنلی کاربر هدف (گیرنده جدید):</label>
                                <div class="input-with-action">
                                    <input type="text" id="tx-personnel-code" placeholder="وارد کردن کد پرسنلی..." oninput="previewPersonnelForTransfer()">
                                    <button class="btn btn-secondary" onclick="previewPersonnelForTransfer()">بررسی پرسنل</button>
                                </div>
                                <p class="help-text">جهت برگشت به انبار، کادر کد پرسنلی هدف را خالی گذاشته یا دکمه «خروج از حساب کاربر و تحویل به انبار» را فشار دهید.</p>
                            </div>

                            <!-- Live Preview Personnel Panel -->
                            <div id="tx-p-preview" class="live-preview-box hidden">
                                <div class="preview-title">👥 مشخصات تحویل‌گیرنده جدید:</div>
                                <div class="preview-details">
                                    <div class="detail-row"><span>نام کامل:</span> <strong id="p-pers-name" class="text-success">--</strong></div>
                                    <div class="detail-row"><span>سمت سازمانی:</span> <span id="p-pers-title">--</span></div>
                                    <div class="detail-row"><span>بخش/واحد خدمتی:</span> <span id="p-pers-dept">--</span></div>
                                    <div class="detail-row"><span>موقعیت استقرار:</span> <span id="p-pers-loc">--</span></div>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="form-actions-row margin-top-lg border-top-dashed pt-4">
                                <button class="btn btn-danger btn-large" onclick="executeReturnToWarehouse()" id="btn-return-warehouse">📥 خروج از حساب کاربر و تحویل به انبار</button>
                                <button class="btn btn-primary btn-large flex-grow" onclick="executeTransferAction()" id="btn-execute-transfer">🔄 انجام جابجایی و بروزرسانی پرونده</button>
                            </div>

                        </div>
                    </div>

                    <!-- Right: Info / Instructive Box -->
                    <div class="instructions-box">
                        <h4>نکات بسیار مهم جابجایی هوشمند:</h4>
                        <ul>
                            <li>با ثبت جابجایی جدید، تخصیص قبلی تجهیز به صورت خودکار با درج **تاریخ پایان** بسته خواهد شد.</li>
                            <li>سابقه استفاده از کالا با تاریخ دقیق در تب «تاریخچه جابجایی» ذخیره شده و قابل رهگیری همیشگی است.</li>
                            <li>سیستم به طور خودکار از تخصیص همزمان یک تجهیز به یک فرد جلوگیری می‌کند.</li>
                            <li>تحویل موقت، تغییر واحد استقرار پرسنلی از دیگر قابلیت‌های منعطف این ماژول می‌باشد.</li>
                        </ul>
                        <div class="branding-badge-inner">
                            <span>واحد ICT شرکت عمران آذرستان</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TAB 6: Assignment History -->
            <section id="history-tab" class="tab-pane">
                <div class="pane-header">
                    <h3>تاریخچه جامع جابجایی و تخصیص تجهیزات رایانه‌ای</h3>
                    <div class="pane-actions">
                        <button class="btn btn-success" onclick="exportTableToCSV('history-table', 'assignments-history')">📥 خروجی اکسل (CSV)</button>
                        <button class="btn btn-danger" onclick="printTable('history-tab', 'تاریخچه تخصیص تجهیزات - شرکت عمران آذرستان')">🖨️ چاپ / PDF</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="history-table">
                        <thead>
                            <tr>
                                <th>نوع تجهیز</th>
                                <th>کد اموال/سریال تجهیز</th>
                                <th>کاربر تحویل گیرنده</th>
                                <th>کد پرسنلی</th>
                                <th>تاریخ تحویل (شروع)</th>
                                <th>تاریخ استرداد (پایان)</th>
                                <th>وضعیت تخصیص</th>
                            </tr>
                        </thead>
                        <tbody id="history-tbody">
                            <!-- Populated via Javascript -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TAB 7: Advanced Reporting & System ID Certificate -->
            <section id="reporting-tab" class="tab-pane">
                <div class="reporting-workspace">
                    
                    <!-- Left: Filters & Selection -->
                    <div class="card-form shadow-sm">
                        <div class="card-form-header">
                            <h3>📊 کنترل پنل گزارش‌گیری هوشمند و پیشرفته</h3>
                            <p>بخش‌های مورد نیاز را انتخاب کرده و فیلترها را اعمال کنید</p>
                        </div>
                        <div class="form-body">
                            <div class="form-group border-bottom-dashed pb-4">
                                <label class="block font-bold">انتخاب بخش‌های مورد نیاز جهت گزارش کلی:</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="rep-sec-personnel" checked> لیست پرسنل</label>
                                    <label><input type="checkbox" id="rep-sec-cases" checked> تجهیزات کیس‌ها</label>
                                    <label><input type="checkbox" id="rep-sec-monitors" checked> مانیتورها</label>
                                    <label><input type="checkbox" id="rep-sec-printers" checked> پرینترها</label>
                                    <label><input type="checkbox" id="rep-sec-history" checked> سوابق و تاریخچه جابجایی</label>
                                </div>
                            </div>

                            <div class="form-group margin-top-md">
                                <label>محدوده تاریخ اختصاصی (تاریخ شروع و پایان):</label>
                                <div class="inline-inputs">
                                    <input type="text" id="rep-date-from" placeholder="از تاریخ (مثال: ۱۴۰۵/۰۱/۰۱)">
                                    <input type="text" id="rep-date-to" placeholder="تا تاریخ (مثال: ۱۴۰۵/۰۳/۰۱)">
                                </div>
                            </div>

                            <div class="form-group margin-top-md">
                                <label for="rep-filter-personnel">فیلتر پرسنل (کد پرسنلی یا نام):</label>
                                <input type="text" id="rep-filter-personnel" placeholder="فیلتر بر اساس پرسنل خاص...">
                            </div>

                            <div class="form-group margin-top-md border-bottom-dashed pb-4">
                                <label for="rep-filter-equipment">فیلتر کد اموال سخت‌افزار:</label>
                                <input type="text" id="rep-filter-equipment" placeholder="بر اساس کد کیس، مانیتور یا پرینتر...">
                            </div>

                            <!-- Actions for Report -->
                            <div class="form-actions-row margin-top-md">
                                <button class="btn btn-primary flex-grow" onclick="generateGeneralReport()">📊 نمایش گزارش ترکیبی</button>
                            </div>

                            <!-- SPECIAL SECTION: SYSTEM PROFILE CERTIFICATE (شناسنامه سیستم) -->
                            <div class="special-reporting-box margin-top-lg pt-4 border-top-solid">
                                <h4 class="text-indigo-900 font-bold border-bottom-dashed pb-2">📋 صدور شناسنامه سیستم برای پرسنل (تک برگی رسمی)</h4>
                                <p class="help-text">جهت استعلام کل سخت‌افزارهای یک تحویل‌گیرنده و صدور فرم تاییدیه و امضای سه برگی، کد پرسنلی را وارد نمایید:</p>
                                <div class="form-group margin-top-sm">
                                    <div class="input-with-action">
                                        <input type="text" id="cert-personnel-code" placeholder="کد پرسنلی پرسنل را وارد کنید...">
                                        <button class="btn btn-indigo" onclick="generateSystemCertificate()">📜 صدور شناسنامه</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Right: Live Report Render Workspace -->
                    <div class="report-render-area">
                        <div class="panel-header-sub">
                            <h4>📋 نمایش زنده گزارش تولید شده</h4>
                            <div>
                                <button class="btn btn-success btn-xs" onclick="printRenderedReport()">🖨️ چاپ مستقیم گزارش / ذخیره PDF</button>
                            </div>
                        </div>
                        <div id="report-rendered-output" class="rendered-paper shadow-sm">
                            <p class="text-center text-muted">گزارشی صادر نشده است. فیلترها را تنظیم کرده یا روی یکی از دکمه‌های گزارش‌گیری کلیک کنید.</p>
                        </div>
                    </div>

                </div>
            </section>

            <!-- TAB 8: Backup / JSON API and CSV Uploads -->
            <section id="backup-tab" class="tab-pane">
                <div class="backup-grid-section">
                    
                    <!-- Left: CSV Import Panel -->
                    <div class="card-form shadow-sm">
                        <div class="card-form-header">
                            <h3>📥 بارگذاری داده‌های کلی از اکسل/CSV</h3>
                            <p class="text-danger">توجه: بارگذاری فایل اکسل جدید باعث جایگزینی کامل و پاکسازی کل دیتای قبلی خواهد شد!</p>
                        </div>
                        <div class="form-body">
                            
                            <!-- Template Download Link -->
                            <div class="download-template-box">
                                <p>جهت بارگذاری موفق داده‌ها، ابتدا قالب و الگوی استاندارد اکسل را دانلود کرده و مقادیر را مطابق آن تنظیم کنید.</p>
                                <a href="api/upload_csv.php?template=1" class="btn btn-success-outline margin-top-sm display-inline">📥 دانلود نمونه فایل اکسل (CSV)</a>
                            </div>

                            <form id="csv-upload-form" class="margin-top-md border-top-dashed pt-4" onsubmit="handleCSVUpload(event)">
                                <div class="form-group">
                                    <label class="font-bold">انتخاب فایل CSV جهت بارگذاری:</label>
                                    <input type="file" id="csv-file-input" accept=".csv" required>
                                </div>
                                <button type="submit" class="btn btn-danger btn-large w-full mt-4">⚠️ آپلود فایل و جایگزینی کامل اطلاعات</button>
                            </form>

                        </div>
                    </div>

                    <!-- Right: Backup & Restoration JSON Panel -->
                    <div class="card-form shadow-sm">
                        <div class="card-form-header">
                            <h3>⚙️ پشتیبان‌گیری و بازیابی اطلاعات به صورت آفلاین</h3>
                            <p>امکان کپی‌برداری کامل از فایل‌ها و دیتای کلیدی سامانه</p>
                        </div>
                        <div class="form-body">
                            
                            <!-- Backup Generation -->
                            <div class="backup-action-box">
                                <h4>۱. نسخه پشتیبان سیستم (Backup)</h4>
                                <p>با فشردن دکمه زیر، یک فایل JSON حاوی تمامی اطلاعات شامل پرسنل، هاردها، کیس‌ها و تاریخچه‌ها دانلود می‌شود.</p>
                                <a href="api/backup.php" class="btn btn-indigo margin-top-xs display-inline">📥 دریافت فایل پیشتیبان JSON</a>
                            </div>

                            <!-- Restore Generation -->
                            <div class="restore-action-box margin-top-md border-top-dashed pt-4">
                                <h4>۲. بازیابی نسخه پشتیبان (Restore)</h4>
                                <p>فایل پشتیبان JSON دانلود شده قبلی را انتخاب و بارگذاری کنید تا سامانه دقیقاً به همان تاریخ برگردد.</p>
                                <form id="restore-backup-form" onsubmit="handleRestoreBackup(event)" class="margin-top-sm">
                                    <div class="form-group">
                                        <input type="file" id="restore-file-input" accept=".json" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary margin-top-xs">📤 اعتبارسنجی و بازیابی اطلاعات</button>
                                </form>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            <!-- TAB 9: Unify Add New Item (plus sign) -->
            <section id="add-new-tab" class="tab-pane">
                <div class="unify-add-form-wrapper">
                    <div class="card-form shadow-md max-w-lg mx-auto">
                        <div class="card-form-header">
                            <h3>➕ ثبت موجودی جدید در سیستم</h3>
                            <p>لطفاً دسته آیتم خود را انتخاب کنید تا فیلدهای مربوطه ظاهر شوند</p>
                        </div>
                        <div class="form-body">
                            
                            <!-- Unify Switch Type -->
                            <div class="form-group">
                                <label for="add-item-type">دسته‌بندی آیتم ثبتی جدید:</label>
                                <select id="add-item-type" onchange="updateAddFormFields()">
                                    <option value="personnel">👥 پرسنل سازمانی جدید</option>
                                    <option value="case">🖥️ کیس کامپیوتر جدید</option>
                                    <option value="monitor">📺 مانیتور جدید</option>
                                    <option value="printer">🖨️ چاپگر / پرینتر جدید</option>
                                </select>
                            </div>

                            <hr class="form-divider">

                            <!-- Dynamic fields container based on selection -->
                            <div id="dynamic-add-fields">
                                <!-- Dynamically Rendered via JS -->
                            </div>

                            <div class="form-actions-row border-top-dashed pt-4 mt-4">
                                <button class="btn btn-secondary" onclick="switchTab('personnel-tab')">انصراف</button>
                                <button class="btn btn-primary" onclick="submitAddNewItem()">💾 ثبت کالا در سیستم</button>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

        </main>

        <!-- Edit Dialog Modals -->
        <div id="edit-modal" class="modal-wrapper hidden">
            <div class="modal-card">
                <div class="modal-header">
                    <h3 id="edit-modal-title">ویرایش مشخصات</h3>
                    <button class="close-btn" onclick="closeEditModal()">×</button>
                </div>
                <div class="modal-body" id="edit-modal-fields-container">
                    <!-- Dynamic fields populated by JavaScript -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeEditModal()">انصراف</button>
                    <button class="btn btn-primary" onclick="submitEditItem()">ذخیره تغییرات</button>
                </div>
            </div>
        </div>

        <!-- Global Toast Alert Systems -->
        <div id="toast-container" class="toast-alerts-container"></div>

        <!-- Footer System Branding -->
        <footer class="app-footer">
            <p>سامانه مدیریت هوشمند شناسنامه تجهیزات رایانه ای شرکت عمران آذرستان سال ۱۴۰۵ | واحد فناوری اطلاعات و ارتباطات کارگاه بوشهر</p>
        </footer>

    </div>

    <!-- Main JavaScript Logic Handler -->
    <script src="script.js"></script>
</body>
</html>
