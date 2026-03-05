/**
 * สคริปต์ Google Apps Script สำหรับสร้าง Google Sheets อัตโนมัติ
 * ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์
 * 
 * วิธีใช้:
 * 1. ไปที่ Google Apps Script: https://script.google.com/
 * 2. สร้าง Project ใหม่
 * 3. คัดลอกโค้ดนี้ไปใน Code.gs
 * 4. เรียกใช้ฟังก์ชัน: createMedicalRecordsSpreadsheet()
 * 5. อนุมัติสิทธิ์ (Authorize)
 * 6. รอให้ Spreadsheet สร้างเสร็จ
 */

// ========================================
// CONFIGURATION
// ========================================

const SPREADSHEET_TITLE = 'Medical Records Request System - Srinagarind Hospital';
const LOCALE = 'th_TH';
const TIMEZONE = 'Asia/Bangkok';

// ========================================
// SHEETS CONFIGURATION
// ========================================

const SHEETS_CONFIG = {
  'Users': {
    description: 'ข้อมูลผู้ใช้ระบบ',
    headers: [
      'User ID', 'Email', 'Name', 'Phone', 'Profession', 'Organization',
      'Status', 'Avatar URL', 'Created Date', 'Approved Date', 'Approved By',
      'Notes', 'Last Login', 'Is Active', 'PDPA Consent'
    ]
  },
  'Requests': {
    description: 'ข้อมูลคำร้องข้อมูลเวชระเบียน',
    headers: [
      'Request ID', 'User ID', 'Patient HN', 'Patient Name', 'Documents Requested',
      'Purpose', 'Urgency', 'Status', 'Created Date', 'Approved Date', 'Completed Date',
      'SLA Deadline', 'Notes', 'Attachment URL', 'Result File URL', 'Approved By'
    ]
  },
  'Patients': {
    description: 'ข้อมูลผู้ป่วย',
    headers: [
      'HN', 'Patient ID', 'First Name', 'Last Name', 'Date of Birth', 'Gender',
      'Phone', 'Email', 'Address', 'Province', 'District', 'Sub-district', 'Postal Code',
      'Emergency Contact', 'Emergency Phone', 'Insurance Number', 'Created Date', 'Updated Date'
    ]
  },
  'Notifications': {
    description: 'ข้อมูลการแจ้งเตือน',
    headers: [
      'Notification ID', 'User ID', 'Request ID', 'Type', 'Title', 'Message',
      'Status', 'Email Sent', 'Email Sent Date', 'In-app Notification', 'Read',
      'Read Date', 'Created Date', 'Expires Date'
    ]
  },
  'Audit Log': {
    description: 'บันทึกการเข้าถึงข้อมูล (PDPA)',
    headers: [
      'Log ID', 'Timestamp', 'User ID', 'User Email', 'Action', 'Resource Type',
      'Resource ID', 'Details', 'IP Address', 'User Agent', 'Status', 'Error Message'
    ]
  },
  'Documents': {
    description: 'ข้อมูลประเภทเอกสาร',
    headers: [
      'Document ID', 'Document Name', 'Description', 'Category', 'Is Active',
      'Processing Time (days)', 'Required Fields', 'Created Date', 'Updated Date'
    ]
  },
  'SLA Settings': {
    description: 'ตั้งค่า SLA',
    headers: [
      'SLA ID', 'Type', 'Days', 'Hours', 'Description', 'Cost', 'Is Active'
    ]
  },
  'Email Templates': {
    description: 'Template ของ Email',
    headers: [
      'Template ID', 'Template Name', 'Subject', 'Body', 'Variables',
      'Type', 'Is Active', 'Created Date', 'Updated Date'
    ]
  },
  'Settings': {
    description: 'ตั้งค่าระบบทั่วไป',
    headers: [
      'Setting Key', 'Setting Value', 'Description', 'Type', 'Updated Date', 'Updated By'
    ]
  }
};

// ========================================
// MAIN FUNCTION
// ========================================

/**
 * ฟังก์ชันหลักสำหรับสร้าง Spreadsheet อัตโนมัติ
 */
function createMedicalRecordsSpreadsheet() {
  try {
    Logger.log('🚀 เริ่มสร้าง Google Sheets...');
    Logger.log('📝 ชื่อ: ' + SPREADSHEET_TITLE);
    Logger.log('');

    // สร้าง Spreadsheet
    Logger.log('📊 สร้าง Spreadsheet...');
    const spreadsheet = SpreadsheetApp.create(SPREADSHEET_TITLE);
    const spreadsheetId = spreadsheet.getId();
    
    Logger.log('✅ สร้าง Spreadsheet สำเร็จ: ' + spreadsheetId);
    Logger.log('');

    // ลบ Sheet เริ่มต้น
    Logger.log('🗑️  ลบ Sheet เริ่มต้น...');
    const defaultSheet = spreadsheet.getSheets()[0];
    if (defaultSheet) {
      spreadsheet.deleteSheet(defaultSheet);
    }
    Logger.log('');

    // สร้าง Sheets
    Logger.log('📋 สร้าง Sheets...');
    for (const [sheetName, config] of Object.entries(SHEETS_CONFIG)) {
      Logger.log('  ➕ ' + sheetName + '...');
      
      // สร้าง Sheet
      const sheet = spreadsheet.insertSheet(sheetName);
      
      // เพิ่ม Headers
      addHeaders(sheet, config.headers);
      
      // ตั้งค่า Column Width
      setColumnWidths(sheet, config.headers.length);
    }
    Logger.log('');

    // เพิ่มข้อมูลตัวอย่าง
    Logger.log('📝 เพิ่มข้อมูลตัวอย่าง...');
    addSampleData(spreadsheet);
    Logger.log('');

    // ตั้งค่า Spreadsheet Properties
    Logger.log('⚙️  ตั้งค่า Spreadsheet Properties...');
    setSpreadsheetProperties(spreadsheet);
    Logger.log('');

    // แสดงผลลัพธ์
    Logger.log('='.repeat(60));
    Logger.log('✅ สร้าง Google Sheets สำเร็จ!');
    Logger.log('='.repeat(60));
    Logger.log('');
    Logger.log('📊 Spreadsheet ID: ' + spreadsheetId);
    Logger.log('🔗 URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    Logger.log('');
    Logger.log('📋 Sheets ที่สร้าง:');
    let i = 1;
    for (const sheetName of Object.keys(SHEETS_CONFIG)) {
      Logger.log('  ' + i + '. ' + sheetName);
      i++;
    }
    Logger.log('');
    Logger.log('💡 ขั้นตอนถัดไป:');
    Logger.log('1. คัดลอก Spreadsheet ID ข้างบน');
    Logger.log('2. ไปที่ Code.gs ในโปรเจกต์');
    Logger.log('3. ใส่ Spreadsheet ID ในตัวแปร SPREADSHEET_ID');
    Logger.log('4. Deploy Code.gs');
    Logger.log('');

    // แสดง Dialog
    SpreadsheetApp.getUi().alert(
      '✅ สร้าง Google Sheets สำเร็จ!\n\n' +
      'Spreadsheet ID: ' + spreadsheetId + '\n\n' +
      'URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '\n\n' +
      'ดูรายละเอียดใน Logs (Ctrl+Enter)'
    );

  } catch (error) {
    Logger.log('❌ เกิดข้อผิดพลาด: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ เกิดข้อผิดพลาด: ' + error.toString());
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * เพิ่ม Headers ลงใน Sheet
 */
function addHeaders(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // ทำให้ Headers เป็น Bold
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  
  // ตั้งค่าสีพื้นหลัง (สีเทาเข้ม)
  headerRange.setBackground('#333333');
  headerRange.setFontColor('#ffffff');
  
  // Freeze Row
  sheet.setFrozenRows(1);
}

/**
 * ตั้งค่า Column Width
 */
function setColumnWidths(sheet, columnCount) {
  for (let i = 1; i <= columnCount; i++) {
    sheet.setColumnWidth(i, 150);
  }
}

/**
 * เพิ่มข้อมูลตัวอย่าง
 */
function addSampleData(spreadsheet) {
  // ข้อมูลตัวอย่าง SLA Settings
  const slaSheet = spreadsheet.getSheetByName('SLA Settings');
  const slaData = [
    ['SLA-001', 'Normal', 3, 0, 'ปกติ 3 วันทำการ', 0, 'TRUE'],
    ['SLA-002', 'Urgent', 1, 0, 'เร่งด่วน 1 วันทำการ', 500, 'TRUE']
  ];
  slaSheet.getRange(2, 1, slaData.length, slaData[0].length).setValues(slaData);

  // ข้อมูลตัวอย่าง Documents
  const docSheet = spreadsheet.getSheetByName('Documents');
  const docData = [
    ['DOC-001', 'เวชระเบียนทั่วไป', 'Medical Record', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
    ['DOC-002', 'ผลการตรวจห้องแล็บ', 'Lab Results', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
    ['DOC-003', 'ผลการถ่ายภาพ', 'Imaging Results', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
    ['DOC-004', 'ใบสั่งยา', 'Prescription', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
    ['DOC-005', 'ใบวินิจฉัย', 'Diagnosis', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04']
  ];
  docSheet.getRange(2, 1, docData.length, docData[0].length).setValues(docData);

  // ข้อมูลตัวอย่าง Settings
  const settingsSheet = spreadsheet.getSheetByName('Settings');
  const settingsData = [
    ['HOSPITAL_NAME', 'โรงพยาบาลศรีนครินทร์', 'ชื่อโรงพยาบาล', 'String', '2568-03-04', 'System'],
    ['HOSPITAL_PHONE', '0-4320-2000', 'เบอร์โทรศัพท์', 'String', '2568-03-04', 'System'],
    ['HOSPITAL_EMAIL', 'medical.records@hospital.ac.th', 'อีเมล', 'String', '2568-03-04', 'System'],
    ['MAX_PATIENTS_PER_REQUEST', '20', 'จำนวนผู้ป่วยสูงสุดต่อคำร้อง', 'Number', '2568-03-04', 'System'],
    ['MAX_FILE_SIZE_MB', '5', 'ขนาดไฟล์สูงสุด (MB)', 'Number', '2568-03-04', 'System'],
    ['ENABLE_URGENT_REQUEST', 'TRUE', 'เปิดใช้คำร้องเร่งด่วน', 'Boolean', '2568-03-04', 'System']
  ];
  settingsSheet.getRange(2, 1, settingsData.length, settingsData[0].length).setValues(settingsData);
}

/**
 * ตั้งค่า Spreadsheet Properties
 */
function setSpreadsheetProperties(spreadsheet) {
  // ตั้งค่า Locale และ Timezone
  spreadsheet.setSpreadsheetLocale(LOCALE);
  spreadsheet.setSpreadsheetTimeZone(TIMEZONE);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * ฟังก์ชันสำหรับดูรายละเอียด Spreadsheet ที่สร้าง
 */
function getSpreadsheetInfo() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = spreadsheet.getId();
  
  Logger.log('📊 Spreadsheet Information:');
  Logger.log('ID: ' + spreadsheetId);
  Logger.log('Name: ' + spreadsheet.getName());
  Logger.log('URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
  Logger.log('');
  Logger.log('📋 Sheets:');
  
  const sheets = spreadsheet.getSheets();
  sheets.forEach((sheet, index) => {
    Logger.log((index + 1) + '. ' + sheet.getName() + ' (' + sheet.getLastRow() + ' rows, ' + sheet.getLastColumn() + ' columns)');
  });
}

/**
 * ฟังก์ชันสำหรับเพิ่ม Sheet ใหม่
 */
function addNewSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.insertSheet(sheetName);
  
  if (headers && headers.length > 0) {
    addHeaders(sheet, headers);
    setColumnWidths(sheet, headers.length);
  }
  
  Logger.log('✅ เพิ่ม Sheet ใหม่: ' + sheetName);
}

/**
 * ฟังก์ชันสำหรับลบ Sheet
 */
function deleteSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
    Logger.log('✅ ลบ Sheet: ' + sheetName);
  } else {
    Logger.log('❌ ไม่พบ Sheet: ' + sheetName);
  }
}

/**
 * ฟังก์ชันสำหรับเพิ่มข้อมูลลงใน Sheet
 */
function addDataToSheet(sheetName, data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log('❌ ไม่พบ Sheet: ' + sheetName);
    return;
  }
  
  const lastRow = sheet.getLastRow();
  const startRow = lastRow + 1;
  
  sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
  Logger.log('✅ เพิ่มข้อมูล ' + data.length + ' แถว ลงใน Sheet: ' + sheetName);
}

/**
 * ฟังก์ชันสำหรับสร้าง Menu ใน Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Medical Records')
    .addItem('ℹ️ ข้อมูล Spreadsheet', 'getSpreadsheetInfo')
    .addItem('➕ เพิ่ม Sheet ใหม่', 'showAddSheetDialog')
    .addItem('🗑️ ลบ Sheet', 'showDeleteSheetDialog')
    .addSeparator()
    .addItem('💾 บันทึก Spreadsheet ID', 'saveSpreadsheetId')
    .addToUi();
}

/**
 * ฟังก์ชันสำหรับแสดง Dialog เพิ่ม Sheet
 */
function showAddSheetDialog() {
  const html = HtmlService.createHtmlOutput(
    '<label>ชื่อ Sheet:</label><br>' +
    '<input type="text" id="sheetName" placeholder="ชื่อ Sheet" style="width: 100%; padding: 5px;"><br><br>' +
    '<button onclick="addSheet()" style="padding: 8px 16px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">เพิ่ม Sheet</button>'
  );
  SpreadsheetApp.getUi().showModelessDialog(html, 'เพิ่ม Sheet ใหม่');
}

/**
 * ฟังก์ชันสำหรับแสดง Dialog ลบ Sheet
 */
function showDeleteSheetDialog() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  
  let options = '';
  sheets.forEach(sheet => {
    options += '<option value="' + sheet.getName() + '">' + sheet.getName() + '</option>';
  });
  
  const html = HtmlService.createHtmlOutput(
    '<label>เลือก Sheet ที่ต้องการลบ:</label><br>' +
    '<select id="sheetName" style="width: 100%; padding: 5px;">' + options + '</select><br><br>' +
    '<button onclick="deleteSheet()" style="padding: 8px 16px; background: #EA4335; color: white; border: none; border-radius: 4px; cursor: pointer;">ลบ Sheet</button>'
  );
  SpreadsheetApp.getUi().showModelessDialog(html, 'ลบ Sheet');
}

/**
 * ฟังก์ชันสำหรับบันทึก Spreadsheet ID
 */
function saveSpreadsheetId() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = spreadsheet.getId();
  
  const sheet = spreadsheet.getSheetByName('Settings');
  if (sheet) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 6).setValues([
      ['SPREADSHEET_ID', spreadsheetId, 'Spreadsheet ID สำหรับการเชื่อมต่อ', 'String', new Date().toLocaleDateString('th-TH'), 'System']
    ]);
    Logger.log('✅ บันทึก Spreadsheet ID: ' + spreadsheetId);
  }
}
