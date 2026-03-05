# คู่มือการใช้ CreateSheets.gs

**ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์**

---

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนการสร้าง Spreadsheet](#ขั้นตอนการสร้าง-spreadsheet)
3. [ฟังก์ชันที่มีให้ใช้](#ฟังก์ชันที่มีให้ใช้)
4. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
5. [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดเบื้องต้น

### สิ่งที่ต้องมี

- ✓ บัญชี Google (Gmail)
- ✓ Access ไปยัง Google Apps Script
- ✓ ไม่ต้องติดตั้ง Python หรือ Libraries

### ความรู้ที่จำเป็น

- ✓ พื้นฐานการใช้ Google Apps Script
- ✓ ความเข้าใจเกี่ยวกับ Google Sheets

---

## ขั้นตอนการสร้าง Spreadsheet

### ขั้นตอนที่ 1: เปิด Google Apps Script

1. ไปที่ **Google Apps Script**: https://script.google.com/
2. คลิก **"New Project"** (ถ้ายังไม่มี Project)
3. ตั้งชื่อ Project: `Medical Records System Setup`

### ขั้นตอนที่ 2: คัดลอกโค้ด CreateSheets.gs

1. เปิดไฟล์ **CreateSheets.gs** ที่อยู่ในโปรเจกต์
2. คัดลอกโค้ดทั้งหมด
3. ไปที่ Google Apps Script Project
4. ลบโค้ดเดิม (ถ้ามี)
5. วางโค้ด CreateSheets.gs

### ขั้นตอนที่ 3: รันฟังก์ชัน createMedicalRecordsSpreadsheet

1. เลือกฟังก์ชัน: **createMedicalRecordsSpreadsheet**
2. คลิก **"Run"** (ปุ่มสามเหลี่ยม)
3. อนุมัติสิทธิ์ (Authorize) เมื่อมีการขอ
4. รอให้ Spreadsheet สร้างเสร็จ

### ขั้นตอนที่ 4: ดูผลลัพธ์

1. เปิด **Logs** (Ctrl+Enter หรือ Cmd+Enter)
2. ดูรายละเอียด Spreadsheet ID
3. คัดลอก Spreadsheet ID

### ขั้นตอนที่ 5: ใส่ Spreadsheet ID ใน Code.gs

1. ไปที่ไฟล์ **Code.gs** ในโปรเจกต์
2. หาบรรทัด:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
3. แทนที่ด้วย Spreadsheet ID ที่คัดลอกมา:
   ```javascript
   const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j';
   ```

---

## ฟังก์ชันที่มีให้ใช้

### 1. createMedicalRecordsSpreadsheet()

**ฟังก์ชันหลัก** - สร้าง Spreadsheet ทั้งหมด

```javascript
createMedicalRecordsSpreadsheet();
```

**ทำอะไร**:
- ✅ สร้าง Spreadsheet ใหม่
- ✅ สร้าง 9 Sheets
- ✅ เพิ่ม Headers
- ✅ เพิ่มข้อมูลตัวอย่าง
- ✅ ตั้งค่า Locale และ Timezone

**ผลลัพธ์**:
- Spreadsheet ID จะแสดงใน Logs
- Dialog จะแสดง Spreadsheet ID

---

### 2. getSpreadsheetInfo()

**ดูรายละเอียด Spreadsheet** ที่กำลังใช้งาน

```javascript
getSpreadsheetInfo();
```

**ทำอะไร**:
- ✅ แสดง Spreadsheet ID
- ✅ แสดงชื่อ Spreadsheet
- ✅ แสดง URL
- ✅ แสดงรายชื่อ Sheets ทั้งหมด

**ผลลัพธ์**:
```
📊 Spreadsheet Information:
ID: 1a2b3c4d5e6f7g8h9i0j
Name: Medical Records Request System - Srinagarind Hospital
URL: https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j

📋 Sheets:
1. Users (1 rows, 15 columns)
2. Requests (1 rows, 16 columns)
...
```

---

### 3. addNewSheet(sheetName, headers)

**เพิ่ม Sheet ใหม่**

```javascript
addNewSheet('New Sheet', ['Column 1', 'Column 2', 'Column 3']);
```

**Parameters**:
- `sheetName` (String): ชื่อ Sheet ใหม่
- `headers` (Array): Array ของชื่อ Column

**ตัวอย่าง**:
```javascript
addNewSheet('Custom Data', ['ID', 'Name', 'Email', 'Phone']);
```

---

### 4. deleteSheet(sheetName)

**ลบ Sheet**

```javascript
deleteSheet('Sheet ที่ต้องการลบ');
```

**Parameters**:
- `sheetName` (String): ชื่อ Sheet ที่ต้องการลบ

**ตัวอย่าง**:
```javascript
deleteSheet('Users');
```

---

### 5. addDataToSheet(sheetName, data)

**เพิ่มข้อมูลลงใน Sheet**

```javascript
addDataToSheet('Users', [
  ['USER-001', 'john@example.com', 'John Doe', '0812345678', 'Doctor', 'Hospital'],
  ['USER-002', 'jane@example.com', 'Jane Smith', '0887654321', 'Nurse', 'Hospital']
]);
```

**Parameters**:
- `sheetName` (String): ชื่อ Sheet
- `data` (2D Array): ข้อมูลที่ต้องการเพิ่ม

**ตัวอย่าง**:
```javascript
const userData = [
  ['USER-001', 'john@example.com', 'John Doe'],
  ['USER-002', 'jane@example.com', 'Jane Smith']
];
addDataToSheet('Users', userData);
```

---

### 6. saveSpreadsheetId()

**บันทึก Spreadsheet ID** ลงใน Settings Sheet

```javascript
saveSpreadsheetId();
```

**ทำอะไร**:
- ✅ บันทึก Spreadsheet ID ลงใน Settings Sheet
- ✅ เพิ่มวันที่ปัจจุบัน

---

### 7. onOpen()

**ฟังก์ชันอัตโนมัติ** - สร้าง Menu เมื่อเปิด Spreadsheet

**ทำอะไร**:
- ✅ เพิ่ม Menu "📋 Medical Records" ใน Spreadsheet
- ✅ เพิ่มตัวเลือก:
  - ℹ️ ข้อมูล Spreadsheet
  - ➕ เพิ่ม Sheet ใหม่
  - 🗑️ ลบ Sheet
  - 💾 บันทึก Spreadsheet ID

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้าง Spreadsheet ใหม่

```javascript
// ขั้นตอน 1: รันฟังก์ชันหลัก
createMedicalRecordsSpreadsheet();

// ผลลัพธ์:
// ✅ สร้าง Google Sheets สำเร็จ!
// Spreadsheet ID: 1a2b3c4d5e6f7g8h9i0j
```

### ตัวอย่างที่ 2: ดูรายละเอียด Spreadsheet

```javascript
// ขั้นตอน 1: รันฟังก์ชัน
getSpreadsheetInfo();

// ผลลัพธ์:
// 📊 Spreadsheet Information:
// ID: 1a2b3c4d5e6f7g8h9i0j
// Name: Medical Records Request System
// ...
```

### ตัวอย่างที่ 3: เพิ่ม Sheet ใหม่

```javascript
// ขั้นตอน 1: เปิด Spreadsheet ที่สร้าง
// ขั้นตอน 2: ไปที่ Tools > Script editor
// ขั้นตอน 3: รันคำสั่ง:
addNewSheet('Reports', ['Report ID', 'Report Name', 'Created Date', 'Status']);

// ผลลัพธ์:
// ✅ เพิ่ม Sheet ใหม่: Reports
```

### ตัวอย่างที่ 4: เพิ่มข้อมูล

```javascript
// ขั้นตอน 1: เปิด Spreadsheet
// ขั้นตอน 2: ไปที่ Tools > Script editor
// ขั้นตอน 3: รันคำสั่ง:

const sampleData = [
  ['DOC-001', 'Medical Record', 'General medical record', 'Medical', 'TRUE', 1, 'HN,Date', '2568-03-04', '2568-03-04'],
  ['DOC-002', 'Lab Results', 'Laboratory test results', 'Medical', 'TRUE', 1, 'HN,Date', '2568-03-04', '2568-03-04']
];

addDataToSheet('Documents', sampleData);

// ผลลัพธ์:
// ✅ เพิ่มข้อมูล 2 แถว ลงใน Sheet: Documents
```

---

## Sheets ที่สร้าง

| # | Sheet Name | Columns | ข้อมูลตัวอย่าง |
|---|-----------|---------|--------------|
| 1 | Users | 15 | ไม่มี (ว่าง) |
| 2 | Requests | 16 | ไม่มี (ว่าง) |
| 3 | Patients | 18 | ไม่มี (ว่าง) |
| 4 | Notifications | 13 | ไม่มี (ว่าง) |
| 5 | Audit Log | 12 | ไม่มี (ว่าง) |
| 6 | Documents | 9 | ✅ 5 รายการ |
| 7 | SLA Settings | 7 | ✅ 2 รายการ |
| 8 | Email Templates | 9 | ไม่มี (ว่าง) |
| 9 | Settings | 6 | ✅ 6 รายการ |

---

## Troubleshooting

### ปัญหา: "Authorization required"

**วิธีแก้**:
1. คลิก **"Review permissions"**
2. เลือกบัญชี Google ของคุณ
3. คลิก **"Allow"**

### ปัญหา: "Spreadsheet not found"

**วิธีแก้**:
1. ตรวจสอบว่า Spreadsheet ID ถูกต้อง
2. ตรวจสอบว่า Spreadsheet ยังมีอยู่
3. ลองรันฟังก์ชัน `getSpreadsheetInfo()` อีกครั้ง

### ปัญหา: "Sheet already exists"

**วิธีแก้**:
1. ลบ Sheet เดิมด้วยฟังก์ชัน `deleteSheet()`
2. สร้าง Sheet ใหม่ด้วยชื่อต่างกัน

### ปัญหา: "Permission denied"

**วิธีแก้**:
1. ตรวจสอบว่าคุณมี Editor access ต่อ Spreadsheet
2. ลองเปิด Spreadsheet ใน browser
3. ลองรันฟังก์ชันอีกครั้ง

---

## 💡 เคล็ดลับ

### 1. ใช้ Menu ใน Spreadsheet

เมื่อเปิด Spreadsheet ที่สร้าง คุณจะเห็น Menu "📋 Medical Records" ที่ด้านบน

- คลิก **"ℹ️ ข้อมูล Spreadsheet"** เพื่อดูรายละเอียด
- คลิก **"➕ เพิ่ม Sheet ใหม่"** เพื่อเพิ่ม Sheet
- คลิก **"🗑️ ลบ Sheet"** เพื่อลบ Sheet

### 2. ดู Logs

เพื่อดูรายละเอียดการทำงาน:
- กด **Ctrl+Enter** (Windows) หรือ **Cmd+Enter** (Mac)
- ดู Logs ที่แสดงขึ้นมา

### 3. ใช้ Spreadsheet ID

เมื่อสร้าง Spreadsheet สำเร็จ:
1. คัดลอก Spreadsheet ID จาก Logs
2. ใส่ใน Code.gs ตัวแปร `SPREADSHEET_ID`
3. Deploy Code.gs

---

## 📞 ติดต่อ

หากมีปัญหา ติดต่อ:
- 📧 medical.records@hospital.ac.th
- 📞 0-4320-2000 ต่อ 1234

---

**Last Updated**: 2568-03-04  
**Version**: 1.0.0  
**Status**: Production Ready
