# ระบบคำขอข้อมูลเวชระเบียน - คู่มือการติดตั้งและตั้งค่า

**เวอร์ชัน**: 1.0.0  
**วันที่อัปเดต**: 2568-03-04  
**สถานะ**: Production Ready

---

## 📑 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนที่ 1: ตั้งค่า Firebase](#ขั้นตอนที่-1-ตั้งค่า-firebase)
3. [ขั้นตอนที่ 2: ตั้งค่า Google Apps Script](#ขั้นตอนที่-2-ตั้งค่า-google-apps-script)
4. [ขั้นตอนที่ 3: สร้าง Google Sheets](#ขั้นตอนที่-3-สร้าง-google-sheets)
5. [ขั้นตอนที่ 4: ตั้งค่าไฟล์โครงการ](#ขั้นตอนที่-4-ตั้งค่าไฟล์โครงการ)
6. [ขั้นตอนที่ 5: Deploy ไปยัง GitHub Pages](#ขั้นตอนที่-5-deploy-ไปยัง-github-pages)
7. [ขั้นตอนที่ 6: ทดสอบระบบ](#ขั้นตอนที่-6-ทดสอบระบบ)
8. [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดเบื้องต้น

### บัญชีที่จำเป็น

1. **Google Account** (1 บัญชี)
   - สำหรับ Firebase
   - สำหรับ Google Apps Script
   - สำหรับ Google Sheets
   - สำหรับ Gmail API

2. **GitHub Account** (1 บัญชี)
   - สำหรับ Deploy ไปยัง GitHub Pages

### ความรู้ที่จำเป็น

- พื้นฐาน Google Services (Firebase, Apps Script, Sheets)
- พื้นฐาน Git/GitHub
- ความเข้าใจเกี่ยวกับ API Keys และ Configuration

### เวลาที่ต้องใช้

- ขั้นตอนที่ 1-4: ประมาณ 30-45 นาที
- ขั้นตอนที่ 5-6: ประมาณ 15-20 นาที
- **รวมทั้งหมด: ประมาณ 1-2 ชั่วโมง**

---

## ขั้นตอนที่ 1: ตั้งค่า Firebase

Firebase ใช้สำหรับ Authentication และ User Management

### 1.1 สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Create a project"** หรือ **"Add project"**
3. ใส่ชื่อโครงการ: `srinagarind-medical-records`
4. คลิก **"Continue"**
5. เลือก **"Disable Google Analytics"** (ไม่จำเป็น)
6. คลิก **"Create project"**
7. รอให้ Firebase สร้าง Project เสร็จ (ประมาณ 1-2 นาที)

### 1.2 เปิด Authentication

1. ในหน้า Firebase Console ของโครงการ
2. ไปที่ **"Build"** → **"Authentication"**
3. คลิก **"Get started"**
4. ในแท็บ **"Sign-in method"** คลิก **"Google"**
5. เปิด **"Enable"** toggle
6. ใส่ **Project name**: `srinagarind-medical-records`
7. ใส่ **Project support email**: `medical.records@hospital.ac.th`
8. คลิก **"Save"**

### 1.3 เพิ่ม Web App

1. ในหน้า Firebase Console
2. คลิกไอคอน **"</>"** (Web) เพื่อเพิ่ม Web App
3. ใส่ชื่อแอป: `srinagarind-medical-records-web`
4. คลิก **"Register app"**
5. Firebase จะแสดง **Firebase SDK config**
6. **คัดลอก config นี้** (เราจะใช้ในขั้นตอนที่ 4)

ตัวอย่าง Firebase Config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "srinagarind-medical-records.firebaseapp.com",
  projectId: "srinagarind-medical-records",
  storageBucket: "srinagarind-medical-records.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 1.4 ตั้งค่า Authorized Domains

1. ในหน้า Authentication
2. ไปที่แท็บ **"Settings"**
3. ไปที่ **"Authorized domains"**
4. คลิก **"Add domain"**
5. เพิ่มโดเมน:
   - `localhost:3000` (สำหรับ development)
   - `yourdomain.com` (สำหรับ production)
   - `yourusername.github.io` (สำหรับ GitHub Pages)
6. คลิก **"Add"**

---

## ขั้นตอนที่ 2: ตั้งค่า Google Apps Script

Google Apps Script ใช้เป็น Backend ของระบบ

### 2.1 สร้าง Google Apps Script Project

1. ไปที่ [Google Apps Script](https://script.google.com/)
2. คลิก **"New project"**
3. ตั้งชื่อ: `srinagarind-medical-records-backend`
4. ลบโค้ด default ออก

### 2.2 คัดลอก Code.gs

1. เปิดไฟล์ `Code.gs` จากโปรเจกต์ที่ส่งมอบ
2. คัดลอกโค้ดทั้งหมด
3. วางลงใน Google Apps Script Editor
4. บันทึก (Ctrl+S หรือ Cmd+S)

### 2.3 ตั้งค่า Environment Variables

ในไฟล์ `Code.gs` ที่บรรทัดต้น ให้ตั้งค่า:

```javascript
// ===== CONFIGURATION =====
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // จะตั้งค่าในขั้นตอนที่ 3
const EMAIL_ADDRESS = "medical.records@hospital.ac.th";
const HOSPITAL_NAME = "โรงพยาบาลศรีนครินทร์";
const NORMAL_SLA_DAYS = 3;
const URGENT_SLA_DAYS = 1;
```

### 2.4 Deploy เป็น Web App

1. ในหน้า Google Apps Script
2. คลิก **"Deploy"** → **"New deployment"**
3. เลือก **"Type"**: **"Web app"**
4. ตั้งค่า:
   - **Execute as**: เลือก Google Account ของคุณ
   - **Who has access**: **"Anyone"**
5. คลิก **"Deploy"**
6. Google จะขอให้อนุญาต - คลิก **"Authorize access"**
7. เลือก Google Account ของคุณ
8. คลิก **"Allow"**
9. **คัดลอก Deployment ID** (จะใช้ในขั้นตอนที่ 4)

ตัวอย่าง Deployment URL:
```
https://script.googleapis.com/macros/d/DEPLOYMENT_ID/usercontent
```

### 2.5 ตั้งค่า Gmail API

Google Apps Script ต้องส่ง Email ผ่าน Gmail API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือก Project: `srinagarind-medical-records`
3. ไปที่ **"APIs & Services"** → **"Library"**
4. ค้นหา **"Gmail API"**
5. คลิก **"Enable"**
6. ไปที่ **"APIs & Services"** → **"Credentials"**
7. คลิก **"Create Credentials"** → **"Service Account"**
8. ตั้งค่า:
   - **Service account name**: `srinagarind-medical-records`
   - **Service account ID**: (auto-generated)
9. คลิก **"Create and continue"**
10. ข้ามขั้นตอน "Grant this service account access to project"
11. คลิก **"Done"**

---

## ขั้นตอนที่ 3: สร้าง Google Sheets

Google Sheets ใช้เป็น Database ของระบบ

### 3.1 สร้าง Spreadsheet ใหม่

1. ไปที่ [Google Sheets](https://sheets.google.com/)
2. คลิก **"Create new spreadsheet"** → **"Blank spreadsheet"**
3. ตั้งชื่อ: `srinagarind-medical-records-db`
4. **คัดลอก Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 3.2 สร้าง 9 Sheets

ลบ Sheet "Sheet1" ออกแล้วสร้าง 9 sheets ดังนี้:

#### Sheet 1: users
| Column | Type | Description |
|--------|------|-------------|
| userId | Text | Unique ID (Firebase UID) |
| email | Text | Email address |
| firstName | Text | First name |
| lastName | Text | Last name |
| occupation | Text | Profession (doctor, nurse, lawyer, etc.) |
| department | Text | Department/Organization |
| phone | Text | Phone number |
| status | Text | approved/pending/rejected |
| createdAt | DateTime | Registration date |
| updatedAt | DateTime | Last update date |
| avatar | Text | Google Drive file ID |

#### Sheet 2: requests
| Column | Type | Description |
|--------|------|-------------|
| requestId | Text | Unique ID (REQ-YYYY-XXXX) |
| userId | Text | Requester's user ID |
| status | Text | pending/approved/processing/completed/rejected |
| requestType | Text | Type of request |
| urgency | Text | normal/urgent |
| patients | Text | JSON array of patient HNs |
| requestedDocs | Text | JSON array of document types |
| purpose | Text | Purpose of request |
| relationship | Text | Relationship to patient |
| additionalNote | Text | Additional notes |
| createdAt | DateTime | Request date |
| updatedAt | DateTime | Last update |
| slaDeadline | DateTime | SLA deadline |
| resultUrl | Text | Google Drive link to result |
| approvedBy | Text | Staff who approved |
| approvalNote | Text | Approval notes |

#### Sheet 3: patients
| Column | Type | Description |
|--------|------|-------------|
| patientId | Text | Unique ID |
| requestId | Text | Related request ID |
| hn | Text | Hospital number |
| name | Text | Patient name |
| dob | Date | Date of birth |

#### Sheet 4: documents
| Column | Type | Description |
|--------|------|-------------|
| docId | Text | Unique ID |
| value | Text | Document code |
| labelTH | Text | Thai label |
| labelEN | Text | English label |

#### Sheet 5: notifications
| Column | Type | Description |
|--------|------|-------------|
| notifId | Text | Unique ID |
| userId | Text | User ID |
| title | Text | Notification title |
| message | Text | Notification message |
| type | Text | Type (info/success/warning/error) |
| read | Boolean | Read status |
| createdAt | DateTime | Creation date |
| link | Text | Link to related page |

#### Sheet 6: audit_log
| Column | Type | Description |
|--------|------|-------------|
| logId | Text | Unique ID |
| userId | Text | User who performed action |
| action | Text | Action performed |
| resource | Text | Resource affected |
| details | Text | Action details (JSON) |
| ipAddress | Text | IP address |
| timestamp | DateTime | Action timestamp |

#### Sheet 7: settings
| Column | Type | Description |
|--------|------|-------------|
| key | Text | Setting key |
| value | Text | Setting value |
| type | Text | Type (string/number/boolean) |
| description | Text | Description |

#### Sheet 8: master_data
| Column | Type | Description |
|--------|------|-------------|
| dataId | Text | Unique ID |
| type | Text | Data type (occupation, purpose, etc.) |
| value | Text | Data value |
| labelTH | Text | Thai label |
| labelEN | Text | English label |

#### Sheet 9: logs
| Column | Type | Description |
|--------|------|-------------|
| logId | Text | Unique ID |
| level | Text | Log level (info/warning/error) |
| message | Text | Log message |
| timestamp | DateTime | Log timestamp |
| stack | Text | Error stack trace |

### 3.3 เพิ่ม Master Data

ในแต่ละ Sheet ให้เพิ่มข้อมูลตัวอย่าง:

**documents Sheet** - เอกสารที่ขอ:
```
1. medical-record - เวชระเบียนทั่วไป
2. lab-result - ผลการตรวจห้องแล็บ
3. imaging - ผลการถ่ายภาพ
4. prescription - ใบสั่งยา
5. diagnosis - ใบวินิจฉัย
6. discharge - ใบส่งตัวออก
7. operation-note - บันทึกการผ่าตัด
8. anesthesia - บันทึกการดมยา
9. nursing-record - บันทึกการพยาบาล
10. vital-signs - สัญญาณชีพ
11. medication - ประวัติการใช้ยา
12. allergy - ประวัติการแพ้ยา
13. vaccination - บันทึกการฉีดวัคซีน
14. consultation - บันทึกการปรึกษา
15. other - เอกสารอื่น ๆ
```

**master_data Sheet** - ข้อมูลอ้างอิง:
```
occupation:
- doctor - แพทย์
- nurse - พยาบาล
- lawyer - ทนายความ
- researcher - นักวิจัย
- insurance - บริษัทประกันภัย
- other - อื่น ๆ

purpose:
- treatment - เพื่อการรักษา
- research - เพื่อการวิจัย
- legal - เพื่อกระบวนการทางกฎหมาย
- insurance - เพื่อการประกันภัย
- personal - เพื่อส่วนตัว
- other - อื่น ๆ
```

### 3.4 ตั้งค่า Permissions

1. ในหน้า Google Sheets
2. คลิก **"Share"** (มุมบนขวา)
3. ใส่ Email ของ Service Account (จากขั้นตอนที่ 2.5)
4. เลือก **"Editor"** role
5. คลิก **"Share"**

---

## ขั้นตอนที่ 4: ตั้งค่าไฟล์โครงการ

### 4.1 ตั้งค่า js/config.js

เปิดไฟล์ `js/config.js` และตั้งค่าตามที่ได้จากขั้นตอนที่ 1-3:

```javascript
// Firebase Configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD...", // จากขั้นตอนที่ 1.3
  authDomain: "srinagarind-medical-records.firebaseapp.com",
  projectId: "srinagarind-medical-records",
  storageBucket: "srinagarind-medical-records.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Google Apps Script Configuration
const APPS_SCRIPT_URL = "https://script.googleapis.com/macros/d/DEPLOYMENT_ID/usercontent"; // จากขั้นตอนที่ 2.4

// Google Sheets Configuration
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // จากขั้นตอนที่ 3.1

// System Configuration
const SYSTEM_CONFIG = {
  HOSPITAL_NAME: "โรงพยาบาลศรีนครินทร์",
  CONTACT_EMAIL: "medical.records@hospital.ac.th",
  CONTACT_PHONE: "0-4320-2000 ต่อ 1234",
  NORMAL_SLA_DAYS: 3,
  URGENT_SLA_DAYS: 1,
  MAX_PATIENTS_PER_REQUEST: 20,
  MAX_FILE_SIZE_MB: 50
};

// Admin Configuration
const ADMIN_USERS = [
  "admin@hospital.ac.th",
  "staff@hospital.ac.th"
];
```

### 4.2 ตั้งค่า Code.gs

ในไฟล์ `Code.gs` ให้ตั้งค่า:

```javascript
// ===== CONFIGURATION =====
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // เดียวกับ js/config.js
const EMAIL_ADDRESS = "medical.records@hospital.ac.th";
const HOSPITAL_NAME = "โรงพยาบาลศรีนครินทร์";
const NORMAL_SLA_DAYS = 3;
const URGENT_SLA_DAYS = 1;
const ADMIN_EMAILS = ["admin@hospital.ac.th", "staff@hospital.ac.th"];
```

### 4.3 ตั้งค่า Email Notifications

ในไฟล์ `Code.gs` ให้ตั้งค่า Email Template:

```javascript
const EMAIL_TEMPLATES = {
  REGISTRATION_SUCCESS: {
    subject: "ยินดีต้อนรับเข้าสู่ระบบคำขอข้อมูลเวชระเบียน",
    body: "คุณได้ลงทะเบียนสำเร็จ รอการอนุมัติจากเจ้าหน้าที่..."
  },
  APPROVAL_NOTIFICATION: {
    subject: "ได้รับการอนุมัติแล้ว",
    body: "บัญชีของคุณได้รับการอนุมัติ คุณสามารถใช้ระบบได้แล้ว"
  },
  REQUEST_SUBMITTED: {
    subject: "คำร้องของคุณได้รับการบันทึก",
    body: "คำร้องของคุณ (ID: {requestId}) ได้รับการบันทึกแล้ว"
  },
  REQUEST_COMPLETED: {
    subject: "คำร้องของคุณเสร็จสิ้น",
    body: "คำร้องของคุณ (ID: {requestId}) เสร็จสิ้นแล้ว ดาวน์โหลดได้ที่: {resultUrl}"
  }
};
```

---

## ขั้นตอนที่ 5: Deploy ไปยัง GitHub Pages

### 5.1 สร้าง GitHub Repository

1. ไปที่ [GitHub](https://github.com/)
2. คลิก **"New"** เพื่อสร้าง Repository ใหม่
3. ตั้งค่า:
   - **Repository name**: `srinagarind-medical-records`
   - **Description**: `Medical Record Request System for Srinagarind Hospital`
   - **Public**: เลือก (เพื่อให้ GitHub Pages ใช้ได้)
   - **Add .gitignore**: เลือก **"Node"**
4. คลิก **"Create repository"**

### 5.2 Push โค้ดไปยัง GitHub

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/srinagarind-medical-records.git
cd srinagarind-medical-records

# Copy project files
cp -r /path/to/srinagarind-medical-record-request/* .

# Add files
git add .

# Commit
git commit -m "Initial commit: Medical record request system"

# Push
git push origin main
```

### 5.3 เปิด GitHub Pages

1. ไปที่ GitHub Repository
2. คลิก **"Settings"**
3. ไปที่ **"Pages"** (ในเมนูซ้าย)
4. ตั้งค่า:
   - **Source**: **"Deploy from a branch"**
   - **Branch**: เลือก **"main"** และ **"/ (root)"**
5. คลิก **"Save"**
6. GitHub จะแสดง URL: `https://YOUR_USERNAME.github.io/srinagarind-medical-records/`

### 5.4 ตั้งค่า Custom Domain (Optional)

ถ้าต้องการใช้ custom domain:

1. ในหน้า **"Settings"** → **"Pages"**
2. ใส่ **"Custom domain"**: `medical-records.hospital.ac.th`
3. คลิก **"Save"**
4. ตั้งค่า DNS records ที่ Domain Provider:
   ```
   CNAME: YOUR_USERNAME.github.io
   ```

### 5.5 เพิ่ม Domain ไปยัง Firebase

1. ไปที่ Firebase Console
2. ไปที่ **"Authentication"** → **"Settings"**
3. ไปที่ **"Authorized domains"**
4. เพิ่ม domain:
   - `YOUR_USERNAME.github.io`
   - `medical-records.hospital.ac.th` (ถ้าใช้ custom domain)

---

## ขั้นตอนที่ 6: ทดสอบระบบ

### 6.1 ทดสอบ Authentication

1. เปิด URL ของระบบ
2. คลิก **"Sign in with Google"**
3. เลือก Google Account
4. ตรวจสอบว่า redirect ไปยัง registration page

### 6.2 ทดสอบ Registration

1. ยื่นข้อมูลลงทะเบียน
2. ตรวจสอบว่าข้อมูลถูกบันทึกใน Google Sheets (users sheet)
3. ตรวจสอบว่าได้รับ Email แจ้งเตือน

### 6.3 ทดสอบ Approval Workflow

1. ไปที่ Admin Panel: `/admin/index.html`
2. ลงชื่อเข้าด้วย Admin Account
3. ไปที่ **"จัดการผู้ใช้"**
4. อนุมัติผู้ใช้ที่ลงทะเบียน
5. ตรวจสอบว่าผู้ใช้ได้รับ Email แจ้งเตือน

### 6.4 ทดสอบ Request Submission

1. ลงชื่อเข้าด้วย User Account ที่ได้รับการอนุมัติ
2. ไปที่ **"ยื่นคำร้อง"**
3. เลือกผู้ป่วย เอกสาร วัตถุประสงค์
4. ยื่นคำร้อง
5. ตรวจสอบว่า:
   - ข้อมูลถูกบันทึกใน Google Sheets (requests sheet)
   - ได้รับ Email แจ้งเตือน
   - สามารถติดตามสถานะได้

### 6.5 ทดสอบ Admin Processing

1. ไปที่ Admin Panel
2. ไปที่ **"จัดการคำร้อง"**
3. อนุมัติคำร้อง
4. ตรวจสอบว่า:
   - สถานะเปลี่ยนเป็น "อนุมัติ"
   - ผู้ยื่นได้รับ Email แจ้งเตือน

### 6.6 ทดสอบ Notifications

1. ตรวจสอบว่าการแจ้งเตือนปรากฏใน:
   - In-web notifications (Bell icon)
   - Email inbox

### 6.7 ทดสอบ Audit Log

1. ไปที่ Admin Panel
2. ไปที่ **"ตั้งค่า"** → **"บันทึกการตรวจสอบ"**
3. ตรวจสอบว่าการกระทำทั้งหมดถูกบันทึก

---

## Troubleshooting

### ปัญหา: ไม่สามารถเข้าสู่ระบบ

**สาเหตุที่เป็นไปได้**:
1. Firebase Config ไม่ถูกต้อง
2. Google Sign-In ไม่เปิดใช้งาน
3. Domain ไม่ได้เพิ่มใน Authorized Domains

**วิธีแก้**:
1. ตรวจสอบ `js/config.js` ว่าตรงกับ Firebase Console
2. ตรวจสอบ Firebase Authentication ว่าเปิดใช้งาน Google Sign-In
3. เพิ่ม Domain ใน Firebase Authorized Domains

### ปัญหา: ไม่ได้รับ Email

**สาเหตุที่เป็นไปได้**:
1. Gmail API ไม่เปิดใช้งาน
2. Email address ไม่ถูกต้อง
3. Google Apps Script ไม่มี permission

**วิธีแก้**:
1. ตรวจสอบ Gmail API ว่าเปิดใช้งาน
2. ตรวจสอบ `Code.gs` ว่า EMAIL_ADDRESS ถูกต้อง
3. ตรวจสอบ Google Apps Script Logs:
   - คลิก **"Executions"** เพื่อดู error logs

### ปัญหา: ข้อมูลไม่ปรากฏใน Google Sheets

**สาเหตุที่เป็นไปได้**:
1. Spreadsheet ID ไม่ถูกต้อง
2. Sheet names ไม่ตรงกับ Code.gs
3. Permission ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ Spreadsheet ID ใน `js/config.js` และ `Code.gs`
2. ตรวจสอบชื่อ Sheets ว่าตรงกับ Code.gs
3. ตรวจสอบ Permission ของ Google Sheets

### ปัญหา: GitHub Pages ไม่แสดง

**สาเหตุที่เป็นไปได้**:
1. Repository ไม่ public
2. Branch ไม่ถูกต้อง
3. index.html ไม่อยู่ใน root

**วิธีแก้**:
1. ตรวจสอบ Repository ว่า Public
2. ตรวจสอบ GitHub Pages Settings ว่า Branch ถูกต้อง
3. ตรวจสอบ index.html อยู่ใน root directory

### ปัญหา: API Call ล้มเหลว

**สาเหตุที่เป็นไปได้**:
1. APPS_SCRIPT_URL ไม่ถูกต้อง
2. Google Apps Script ไม่ Deploy
3. CORS issue

**วิธีแก้**:
1. ตรวจสอบ APPS_SCRIPT_URL ใน `js/config.js`
2. ตรวจสอบ Google Apps Script ว่า Deploy แล้ว
3. ดู Browser Console (F12) เพื่อดู error message

---

## ขั้นตอนหลังการติดตั้ง

### 1. สร้าง Admin Account

1. ลงทะเบียน Google Account สำหรับ Admin
2. ไปที่ Google Sheets (users sheet)
3. เพิ่ม Admin Account ด้วย status "approved"

### 2. ตั้งค่า Master Data

1. ไปที่ Admin Panel
2. ไปที่ **"ตั้งค่า"** → **"ตั้งค่าระบบ"**
3. ตั้งค่า:
   - ชื่อโรงพยาบาล
   - เบอร์โทร
   - อีเมล
   - SLA Days

### 3. สร้าง Test Users

1. ลงทะเบียน Test Accounts
2. อนุมัติใน Admin Panel
3. ทดสอบ workflow ต่าง ๆ

### 4. ตั้งค่า Monitoring

1. ติดตั้ง Google Analytics (Optional)
2. ตั้งค่า Email alerts สำหรับ Admin
3. ตั้งค่า Backup schedule

### 5. Training

1. อบรมเจ้าหน้าที่เกี่ยวกับการใช้ Admin Panel
2. อบรมผู้ใช้เกี่ยวกับการยื่นคำร้อง

---

## ติดต่อและสนับสนุน

**หากมีปัญหา**:
- 📞 โทรศัพท์: 0-4320-2000 ต่อ 1234
- 📧 อีเมล: medical.records@hospital.ac.th
- ⏰ เวลา: จันทร์-ศุกร์ 08:30-16:30 น.

---

**Last Updated**: 2568-03-04  
**Version**: 1.0.0  
**Status**: Production Ready
