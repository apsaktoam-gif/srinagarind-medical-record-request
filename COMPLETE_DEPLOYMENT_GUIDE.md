# คู่มือการติดตั้งและใช้งานแบบสมบูรณ์
## ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์

**เวอร์ชัน**: 1.0.0  
**สถานะ**: Production Ready  
**วันที่อัปเดต**: 2568-03-04

---

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนที่ 1: ตั้งค่า Google Cloud](#ขั้นตอนที่-1-ตั้งค่า-google-cloud)
3. [ขั้นตอนที่ 2: สร้าง Google Sheets](#ขั้นตอนที่-2-สร้าง-google-sheets)
4. [ขั้นตอนที่ 3: ตั้งค่า Google Apps Script](#ขั้นตอนที่-3-ตั้งค่า-google-apps-script)
5. [ขั้นตอนที่ 4: ตั้งค่า Firebase](#ขั้นตอนที่-4-ตั้งค่า-firebase)
6. [ขั้นตอนที่ 5: ตั้งค่าโปรเจกต์ Frontend](#ขั้นตอนที่-5-ตั้งค่าโปรเจกต์-frontend)
7. [ขั้นตอนที่ 6: Deploy ไปยัง GitHub Pages](#ขั้นตอนที่-6-deploy-ไปยัง-github-pages)
8. [ขั้นตอนที่ 7: ทดสอบระบบ](#ขั้นตอนที่-7-ทดสอบระบบ)
9. [ขั้นตอนที่ 8: ตั้งค่า Custom Domain](#ขั้นตอนที่-8-ตั้งค่า-custom-domain)
10. [Troubleshooting](#troubleshooting)

---

## ⏱️ เวลาที่ใช้

| ขั้นตอน | เวลา |
|--------|------|
| ตั้งค่า Google Cloud | 15 นาที |
| สร้าง Google Sheets | 5 นาที |
| ตั้งค่า Google Apps Script | 10 นาที |
| ตั้งค่า Firebase | 20 นาที |
| ตั้งค่าโปรเจกต์ Frontend | 15 นาที |
| Deploy ไปยัง GitHub Pages | 10 นาที |
| ทดสอบระบบ | 20 นาที |
| **รวมทั้งสิ้น** | **95 นาที (ประมาณ 1.5 ชั่วโมง)** |

---

## ข้อกำหนดเบื้องต้น

### สิ่งที่ต้องมี

- ✓ บัญชี Google (Gmail)
- ✓ บัญชี GitHub
- ✓ Text Editor (VS Code, Sublime, Notepad++ ฯลฯ)
- ✓ Git (ดาวน์โหลดจาก https://git-scm.com/)
- ✓ Internet Connection
- ✓ เวลาประมาณ 1.5 ชั่วโมง

### ความรู้ที่จำเป็น

- ✓ พื้นฐาน Git/GitHub
- ✓ พื้นฐาน Google Cloud
- ✓ พื้นฐาน Firebase
- ✓ ความเข้าใจ HTML/CSS/JavaScript

---

## ขั้นตอนที่ 1: ตั้งค่า Google Cloud

### 1.1 สร้าง Google Cloud Project

**ขั้นตอน**:

1. ไปที่ **Google Cloud Console**: https://console.cloud.google.com/
2. ถ้ายังไม่มี Account ให้สร้างใหม่
3. คลิก **"Select a Project"** (ด้านบนซ้าย)
4. คลิก **"NEW PROJECT"**
5. ใส่ชื่อโปรเจกต์:
   ```
   Medical Records System
   ```
6. เลือก Organization (ถ้ามี) หรือปล่อยว่าง
7. คลิก **"CREATE"**
8. รอให้โปรเจกต์สร้างเสร็จ (ประมาณ 1-2 นาที)

**ตรวจสอบ**:
- ชื่อโปรเจกต์แสดงที่ด้านบนซ้าย ✓

### 1.2 เปิดใช้ APIs ที่จำเป็น

**ขั้นตอน**:

1. ไปที่ **APIs & Services** → **Library**
2. ค้นหา **"Google Sheets API"**
3. คลิก **"Google Sheets API"**
4. คลิก **"ENABLE"**
5. รอให้ API เปิดใช้งาน

**ทำซ้ำสำหรับ APIs ต่อไปนี้**:
- Google Drive API
- Gmail API (สำหรับส่งอีเมล)

**ตรวจสอบ**:
- ทั้ง 3 APIs แสดง "Enabled" ✓

### 1.3 สร้าง OAuth 2.0 Credentials

**ขั้นตอน**:

1. ไปที่ **APIs & Services** → **Credentials**
2. คลิก **"+ CREATE CREDENTIALS"**
3. เลือก **"OAuth client ID"**
4. ถ้ามีการขอให้สร้าง OAuth consent screen ให้ทำตามขั้นตอน:
   - คลิก **"CONFIGURE CONSENT SCREEN"**
   - เลือก **"External"** (สำหรับทดสอบ)
   - คลิก **"CREATE"**
   - ใส่ข้อมูล:
     - **App name**: Medical Records System
     - **User support email**: อีเมลของคุณ
     - **Developer contact**: อีเมลของคุณ
   - คลิก **"SAVE AND CONTINUE"**
   - ข้ามขั้นตอน Scopes (คลิก **"SAVE AND CONTINUE"**)
   - ข้ามขั้นตอน Test users (คลิก **"SAVE AND CONTINUE"**)
   - คลิก **"BACK TO DASHBOARD"**

5. กลับไปที่ **Credentials** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
6. เลือก **"Web application"**
7. ใส่ชื่อ: `Medical Records Web App`
8. เพิ่ม Authorized redirect URIs:
   ```
   http://localhost:3000
   http://localhost:5173
   https://yourusername.github.io/srinagarind-medical-record-request
   ```
9. คลิก **"CREATE"**
10. คัดลอก **Client ID** และ **Client Secret** (เก็บไว้ใช้ทีหลัง)

**ตรวจสอบ**:
- OAuth 2.0 Client ID สร้างเสร็จ ✓
- Client ID และ Secret คัดลอกไว้ ✓

---

## ขั้นตอนที่ 2: สร้าง Google Sheets

### 2.1 เปิด Google Apps Script

**ขั้นตอน**:

1. ไปที่ **Google Apps Script**: https://script.google.com/
2. คลิก **"New Project"**
3. ตั้งชื่อ: `Medical Records Setup`

### 2.2 คัดลอก CreateSheets.gs

**ขั้นตอน**:

1. เปิดไฟล์ **CreateSheets.gs** ที่อยู่ในโปรเจกต์
2. คัดลอกโค้ดทั้งหมด
3. ไปที่ Google Apps Script Project
4. ลบโค้ดเดิม (ถ้ามี)
5. วางโค้ด CreateSheets.gs
6. คลิก **"Save"** (Ctrl+S)

### 2.3 รันฟังก์ชัน createMedicalRecordsSpreadsheet

**ขั้นตอน**:

1. เลือกฟังก์ชัน: **createMedicalRecordsSpreadsheet**
2. คลิก **"Run"** (ปุ่มสามเหลี่ยม)
3. อนุมัติสิทธิ์ (Authorize) เมื่อมีการขอ:
   - คลิก **"Review permissions"**
   - เลือกบัญชี Google ของคุณ
   - คลิก **"Allow"**
4. รอให้ Spreadsheet สร้างเสร็จ

### 2.4 ดูผลลัพธ์

**ขั้นตอน**:

1. เปิด **Logs** (Ctrl+Enter หรือ Cmd+Enter)
2. ดู Spreadsheet ID (เช่น: `1a2b3c4d5e6f7g8h9i0j`)
3. คัดลอก Spreadsheet ID

**ตรวจสอบ**:
- Spreadsheet สร้างเสร็จ ✓
- Spreadsheet ID คัดลอกไว้ ✓
- 9 Sheets สร้างเสร็จ ✓

---

## ขั้นตอนที่ 3: ตั้งค่า Google Apps Script

### 3.1 เปิด Code.gs ในโปรเจกต์

**ขั้นตอน**:

1. ไปที่ Google Apps Script Project ที่สร้างไว้
2. เปิดไฟล์ **Code.gs** (หรือสร้างใหม่)

### 3.2 ตั้งค่า Spreadsheet ID

**ขั้นตอน**:

1. หาบรรทัดนี้:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

2. แทนที่ด้วย Spreadsheet ID ที่คัดลอกมา:
   ```javascript
   const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j';
   ```

3. บันทึก (Ctrl+S)

### 3.3 Deploy Code.gs

**ขั้นตอน**:

1. คลิก **"Deploy"** → **"New Deployment"**
2. เลือก Type: **"Web app"**
3. ตั้งค่า:
   - **Execute as**: บัญชี Google ของคุณ
   - **Who has access**: **"Anyone"**
4. คลิก **"Deploy"**
5. คัดลอก **Deployment ID** (เช่น: `AKfycbyXxxx...`)

**ตรวจสอบ**:
- Code.gs Deploy เสร็จ ✓
- Deployment ID คัดลอกไว้ ✓

---

## ขั้นตอนที่ 4: ตั้งค่า Firebase

### 4.1 สร้าง Firebase Project

**ขั้นตอน**:

1. ไปที่ **Firebase Console**: https://console.firebase.google.com/
2. คลิก **"Create a project"**
3. ใส่ชื่อโปรเจกต์:
   ```
   Medical Records System
   ```
4. คลิก **"Continue"**
5. ปิด Google Analytics (ไม่จำเป็น)
6. คลิก **"Create project"**
7. รอให้โปรเจกต์สร้างเสร็จ

### 4.2 ตั้งค่า Authentication

**ขั้นตอน**:

1. ไปที่ **Authentication** (ด้านซ้าย)
2. คลิก **"Get started"**
3. เลือก **"Google"** (Sign-in method)
4. เปิด **"Enable"**
5. ใส่ **Project support email**: อีเมลของคุณ
6. ใส่ **Project name**: Medical Records System
7. คลิก **"Save"**

### 4.3 ตั้งค่า Realtime Database

**ขั้นตอน**:

1. ไปที่ **Realtime Database** (ด้านซ้าย)
2. คลิก **"Create Database"**
3. เลือก Location: **Asia-Southeast1 (Singapore)**
4. เลือก Security Rules: **Start in test mode**
5. คลิก **"Enable"**

### 4.4 ดาวน์โหลด Firebase Config

**ขั้นตอน**:

1. ไปที่ **Project Settings** (ไอคอน ⚙️)
2. ไปที่ **"Your apps"**
3. คลิก **"Web"** (ไอคอน `</>`):
   ```
   </>
   ```
4. ตั้งชื่อแอป: `Medical Records Web`
5. คลิก **"Register app"**
6. คัดลอก Firebase Config:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyDxxx...",
     authDomain: "medical-records-xxx.firebaseapp.com",
     projectId: "medical-records-xxx",
     storageBucket: "medical-records-xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```

**ตรวจสอบ**:
- Firebase Project สร้างเสร็จ ✓
- Authentication (Google) เปิดใช้งาน ✓
- Realtime Database สร้างเสร็จ ✓
- Firebase Config คัดลอกไว้ ✓

---

## ขั้นตอนที่ 5: ตั้งค่าโปรเจกต์ Frontend

### 5.1 ดาวน์โหลดโปรเจกต์

**ขั้นตอน**:

1. ดาวน์โหลดไฟล์ ZIP: `srinagarind-with-gs-sheets.zip`
2. แตกไฟล์ ZIP ไปยังโฟลเดอร์:
   ```
   C:\Users\YourName\srinagarind-medical-record-request
   ```
   (Windows)
   หรือ
   ```
   ~/srinagarind-medical-record-request
   ```
   (macOS/Linux)

### 5.2 ตั้งค่า js/config.js

**ขั้นตอน**:

1. เปิดไฟล์ **js/config.js**
2. แทนที่ Firebase Config:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyDxxx...",
     authDomain: "medical-records-xxx.firebaseapp.com",
     projectId: "medical-records-xxx",
     storageBucket: "medical-records-xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```

3. แทนที่ Google Apps Script URL:
   ```javascript
   const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/d/DEPLOYMENT_ID/usercontent';
   ```
   (แทนที่ `DEPLOYMENT_ID` ด้วย Deployment ID ที่คัดลอกมา)

4. แทนที่ Google OAuth Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```

5. บันทึกไฟล์

### 5.3 ตั้งค่า HTML Files

**ขั้นตอน**:

1. เปิดไฟล์ **index.html**
2. แทนที่ชื่อโรงพยาบาล (ถ้าต้องการ):
   ```html
   <title>ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์</title>
   ```

3. ทำซ้ำสำหรับไฟล์ HTML อื่น ๆ (ถ้าต้องการ)

### 5.4 ทดสอบ Local

**ขั้นตอน**:

1. เปิด Terminal/Command Prompt
2. ไปยังโฟลเดอร์โปรเจกต์:
   ```bash
   cd srinagarind-medical-record-request
   ```

3. เปิด Local Server (ใช้ Python):
   ```bash
   python -m http.server 8000
   ```
   หรือ (Python 3):
   ```bash
   python3 -m http.server 8000
   ```

4. เปิดเบราว์เซอร์:
   ```
   http://localhost:8000
   ```

5. ทดสอบการเข้าสู่ระบบ (Sign in with Google)

**ตรวจสอบ**:
- เว็บไซต์โหลดได้ ✓
- ปุ่ม "Sign in with Google" ทำงาน ✓
- สามารถเข้าสู่ระบบได้ ✓

---

## ขั้นตอนที่ 6: Deploy ไปยัง GitHub Pages

### 6.1 สร้าง GitHub Repository

**ขั้นตอน**:

1. ไปที่ **GitHub**: https://github.com/
2. คลิก **"New"** (สร้าง Repository ใหม่)
3. ตั้งชื่อ Repository:
   ```
   srinagarind-medical-record-request
   ```

4. เลือก **"Public"**
5. ไม่ต้องเลือก "Add a README file"
6. คลิก **"Create repository"**

### 6.2 Push Code ไปยัง GitHub

**ขั้นตอน**:

1. เปิด Terminal/Command Prompt ในโฟลเดอร์โปรเจกต์
2. เริ่มต้น Git:
   ```bash
   git init
   ```

3. เพิ่มไฟล์ทั้งหมด:
   ```bash
   git add .
   ```

4. สร้าง Commit แรก:
   ```bash
   git commit -m "Initial commit: Medical Records System"
   ```

5. เพิ่ม Remote Repository:
   ```bash
   git remote add origin https://github.com/yourusername/srinagarind-medical-record-request.git
   ```
   (แทนที่ `yourusername` ด้วยชื่อ GitHub ของคุณ)

6. Push ไปยัง GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

7. ป้อนชื่อผู้ใช้ GitHub และ Personal Access Token (ถ้าขอ)

### 6.3 ตั้งค่า GitHub Pages

**ขั้นตอน**:

1. ไปที่ Repository ของคุณบน GitHub
2. คลิก **"Settings"**
3. ไปที่ **"Pages"** (ด้านซ้าย)
4. เลือก **"Source"**: **"Deploy from a branch"**
5. เลือก **"Branch"**: **"main"** และ **"/ (root)"**
6. คลิก **"Save"**
7. รอให้ Deploy เสร็จ (ประมาณ 1-2 นาที)

### 6.4 ดูผลลัพธ์

**ขั้นตอน**:

1. ไปที่ **Settings** → **Pages** อีกครั้ง
2. ดู URL ที่แสดง:
   ```
   https://yourusername.github.io/srinagarind-medical-record-request
   ```

3. คลิก URL เพื่อเปิดเว็บไซต์

**ตรวจสอบ**:
- GitHub Pages Deploy เสร็จ ✓
- เว็บไซต์เข้าถึงได้ ✓
- URL แสดงถูกต้อง ✓

---

## ขั้นตอนที่ 7: ทดสอบระบบ

### 7.1 ทดสอบ Authentication

**ขั้นตอน**:

1. เปิด URL ของเว็บไซต์
2. คลิก **"Sign in with Google"**
3. เลือกบัญชี Google ของคุณ
4. อนุมัติสิทธิ์
5. ตรวจสอบว่าเข้าสู่ระบบได้

**ตรวจสอบ**:
- ปุ่ม Sign in ทำงาน ✓
- สามารถเข้าสู่ระบบด้วย Google ✓
- ชื่อผู้ใช้แสดงที่หน้า ✓

### 7.2 ทดสอบ Dashboard

**ขั้นตอน**:

1. หลังจากเข้าสู่ระบบ ไปที่ Dashboard
2. ตรวจสอบว่าแสดงข้อมูลผู้ใช้
3. ตรวจสอบว่าแสดงคำร้องล่าสุด

**ตรวจสอบ**:
- Dashboard โหลดได้ ✓
- ข้อมูลผู้ใช้แสดง ✓
- ข้อมูลคำร้องแสดง ✓

### 7.3 ทดสอบการยื่นคำร้อง

**ขั้นตอน**:

1. คลิก **"ยื่นคำร้องใหม่"** หรือ **"New Request"**
2. กรอกข้อมูล:
   - HN ผู้ป่วย
   - ชื่อผู้ป่วย
   - เลือกเอกสารที่ต้องการ
   - เลือก Urgency
   - กรอก Purpose
3. คลิก **"Submit"**
4. ตรวจสอบว่าคำร้องสร้างเสร็จ

**ตรวจสอบ**:
- ฟอร์มยื่นคำร้องทำงาน ✓
- คำร้องสร้างเสร็จ ✓
- ข้อมูลบันทึกใน Google Sheets ✓

### 7.4 ทดสอบการแจ้งเตือน

**ขั้นตอน**:

1. ไปที่หน้า **Notifications**
2. ตรวจสอบว่าแสดงการแจ้งเตือน
3. คลิกการแจ้งเตือนเพื่อดูรายละเอียด

**ตรวจสอบ**:
- หน้า Notifications โหลดได้ ✓
- การแจ้งเตือนแสดง ✓
- สามารถคลิกเพื่อดูรายละเอียด ✓

### 7.5 ทดสอบ Admin Dashboard

**ขั้นตอน**:

1. ไปที่ URL: `/admin/index.html`
2. ตรวจสอบว่าแสดง Admin Dashboard
3. ดูสถิติและข้อมูล

**ตรวจสอบ**:
- Admin Dashboard โหลดได้ ✓
- สถิติแสดง ✓
- ข้อมูลคำร้องแสดง ✓

---

## ขั้นตอนที่ 8: ตั้งค่า Custom Domain (ไม่บังคับ)

### 8.1 ซื้อ Domain

**ขั้นตอน**:

1. ไปที่เว็บไซต์ขาย Domain เช่น:
   - Namecheap: https://www.namecheap.com/
   - GoDaddy: https://www.godaddy.com/
   - Google Domains: https://domains.google/

2. ค้นหา Domain ที่ต้องการ เช่น:
   ```
   medical-records-hospital.com
   ```

3. ซื้อ Domain

### 8.2 ตั้งค่า DNS

**ขั้นตอน**:

1. ไปที่ Domain Provider
2. ไปที่ DNS Settings
3. เพิ่ม CNAME Record:
   - **Name**: `www`
   - **Value**: `yourusername.github.io`

4. บันทึก

### 8.3 ตั้งค่า GitHub Pages

**ขั้นตอน**:

1. ไปที่ Repository ของคุณบน GitHub
2. คลิก **"Settings"** → **"Pages"**
3. ใส่ Custom Domain:
   ```
   medical-records-hospital.com
   ```

4. คลิก **"Save"**
5. รอให้ DNS ตรวจสอบ (ประมาณ 24 ชั่วโมง)

**ตรวจสอบ**:
- Custom Domain ตั้งค่าเสร็จ ✓
- HTTPS เปิดใช้งาน ✓
- เว็บไซต์เข้าถึงได้ด้วย Custom Domain ✓

---

## Troubleshooting

### ปัญหา: "Sign in with Google" ไม่ทำงาน

**วิธีแก้**:

1. ตรวจสอบ Firebase Config ใน `js/config.js`
2. ตรวจสอบ Google OAuth Client ID
3. ตรวจสอบว่า URL ของเว็บไซต์อยู่ใน Authorized redirect URIs
4. ลบ Cache และ Cookies ของเบราว์เซอร์
5. ลองใช้เบราว์เซอร์อื่น

### ปัญหา: "Spreadsheet not found"

**วิธีแก้**:

1. ตรวจสอบ Spreadsheet ID ใน `js/config.js`
2. ตรวจสอบว่า Spreadsheet ยังมีอยู่
3. ตรวจสอบว่า Google Apps Script Deploy ถูกต้อง
4. ลองรันฟังก์ชัน `getSpreadsheetInfo()` ใน Google Apps Script

### ปัญหา: "Permission denied" เมื่อเข้าถึง Google Sheets

**วิธีแก้**:

1. ตรวจสอบว่า Google Apps Script มี Editor access ต่อ Spreadsheet
2. ตรวจสอบว่า Google Sheets API เปิดใช้งาน
3. ลองแชร์ Spreadsheet กับบัญชี Google ที่ใช้
4. ลองสร้าง Spreadsheet ใหม่

### ปัญหา: "GitHub Pages ไม่ Deploy"

**วิธีแก้**:

1. ตรวจสอบว่า Repository เป็น Public
2. ตรวจสอบว่า Branch ตั้งค่าเป็น "main"
3. ตรวจสอบว่าไฟล์ `index.html` อยู่ใน Root
4. ลองไปที่ **Settings** → **Pages** และรอให้ Deploy เสร็จ
5. ลองคลิก **"Re-run all jobs"** ใน GitHub Actions

### ปัญหา: "Firebase Config ไม่ถูกต้อง"

**วิธีแก้**:

1. ไปที่ Firebase Console
2. ไปที่ **Project Settings** → **Your apps**
3. คัดลอก Firebase Config ใหม่
4. แทนที่ใน `js/config.js`
5. บันทึกและ Refresh เบราว์เซอร์

### ปัญหา: "Email ไม่ส่ง"

**วิธีแก้**:

1. ตรวจสอบว่า Gmail API เปิดใช้งาน
2. ตรวจสอบว่า Email Template ตั้งค่าถูกต้อง
3. ตรวจสอบ Logs ใน Google Apps Script
4. ตรวจสอบว่าบัญชี Google อนุญาตให้ส่ง Email

---

## ✅ Checklist สำหรับการติดตั้ง

### Google Cloud
- [ ] สร้าง Google Cloud Project
- [ ] เปิดใช้ Google Sheets API
- [ ] เปิดใช้ Google Drive API
- [ ] เปิดใช้ Gmail API
- [ ] สร้าง OAuth 2.0 Client ID
- [ ] คัดลอก Client ID และ Secret

### Google Sheets
- [ ] สร้าง Google Apps Script Project
- [ ] รันฟังก์ชัน createMedicalRecordsSpreadsheet()
- [ ] คัดลอก Spreadsheet ID
- [ ] ตรวจสอบ 9 Sheets สร้างเสร็จ

### Google Apps Script
- [ ] ตั้งค่า Spreadsheet ID ใน Code.gs
- [ ] Deploy Code.gs
- [ ] คัดลอก Deployment ID

### Firebase
- [ ] สร้าง Firebase Project
- [ ] ตั้งค่า Authentication (Google)
- [ ] สร้าง Realtime Database
- [ ] คัดลอก Firebase Config

### Frontend
- [ ] ตั้งค่า Firebase Config ใน js/config.js
- [ ] ตั้งค่า Google Apps Script URL
- [ ] ตั้งค่า Google OAuth Client ID
- [ ] ทดสอบ Local Server
- [ ] ทดสอบ Sign in with Google

### GitHub Pages
- [ ] สร้าง GitHub Repository
- [ ] Push Code ไปยัง GitHub
- [ ] ตั้งค่า GitHub Pages
- [ ] ตรวจสอบ URL ของเว็บไซต์

### Testing
- [ ] ทดสอบ Authentication
- [ ] ทดสอบ Dashboard
- [ ] ทดสอบการยื่นคำร้อง
- [ ] ทดสอบการแจ้งเตือน
- [ ] ทดสอบ Admin Dashboard

---

## 📞 ติดต่อ

หากมีปัญหา ติดต่อ:

- 📧 **Email**: medical.records@hospital.ac.th
- 📞 **Phone**: 0-4320-2000 ต่อ 1234
- 💬 **Support**: ส่งข้อความผ่าน Facebook Page

---

## 📚 เอกสารเพิ่มเติม

- [User Guide](USER_GUIDE.pdf) - คู่มือผู้ใช้
- [Installation Guide](INSTALLATION_GUIDE.pdf) - คู่มือการติดตั้ง
- [Create Sheets Guide](CREATE_SHEETS_GUIDE.pdf) - คู่มือการสร้าง Sheets
- [README.md](README.md) - ข้อมูลโปรเจกต์

---

**Last Updated**: 2568-03-04  
**Version**: 1.0.0  
**Status**: Production Ready  
**Estimated Time**: 1.5 hours  
**Difficulty**: Medium

