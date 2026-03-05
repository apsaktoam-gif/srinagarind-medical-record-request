# คู่มือการสร้าง Google Sheets อัตโนมัติ

**ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์**

---

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนที่ 1: ตั้งค่า Google Cloud](#ขั้นตอนที่-1-ตั้งค่า-google-cloud)
3. [ขั้นตอนที่ 2: สร้าง Service Account](#ขั้นตอนที่-2-สร้าง-service-account)
4. [ขั้นตอนที่ 3: ดาวน์โหลด Credentials](#ขั้นตอนที่-3-ดาวน์โหลด-credentials)
5. [ขั้นตอนที่ 4: ติดตั้ง Dependencies](#ขั้นตอนที่-4-ติดตั้ง-dependencies)
6. [ขั้นตอนที่ 5: รันสคริปต์](#ขั้นตอนที่-5-รันสคริปต์)
7. [ขั้นตอนที่ 6: ตั้งค่า Code.gs](#ขั้นตอนที่-6-ตั้งค่า-codggs)

---

## ข้อกำหนดเบื้องต้น

### สิ่งที่ต้องมี

- ✓ บัญชี Google (Gmail)
- ✓ Python 3.7 หรือสูงกว่า
- ✓ Access ไปยัง Google Cloud Console
- ✓ Terminal/Command Prompt

### ความรู้ที่จำเป็น

- ✓ พื้นฐานการใช้ Terminal/Command Prompt
- ✓ ความเข้าใจเกี่ยวกับ Google Cloud
- ✓ ความเข้าใจเกี่ยวกับ API Keys

---

## ขั้นตอนที่ 1: ตั้งค่า Google Cloud

### 1.1 สร้าง Google Cloud Project

1. ไปที่ **Google Cloud Console**: https://console.cloud.google.com/
2. คลิก **"Select a Project"** (ด้านบน)
3. คลิก **"NEW PROJECT"**
4. ใส่ชื่อโปรเจกต์:
   ```
   Medical Records Request System
   ```
5. คลิก **"CREATE"**
6. รอให้โปรเจกต์สร้างเสร็จ (ประมาณ 1-2 นาที)

### 1.2 เปิดใช้ APIs

1. ไปที่ **APIs & Services** → **Library**
2. ค้นหา **"Google Sheets API"**
3. คลิก **"Google Sheets API"**
4. คลิก **"ENABLE"**
5. รอให้ API เปิดใช้งาน

ทำซ้ำสำหรับ **Google Drive API**:
1. ค้นหา **"Google Drive API"**
2. คลิก **"Google Drive API"**
3. คลิก **"ENABLE"**

---

## ขั้นตอนที่ 2: สร้าง Service Account

### 2.1 สร้าง Service Account

1. ไปที่ **APIs & Services** → **Credentials**
2. คลิก **"+ CREATE CREDENTIALS"** (ด้านบน)
3. เลือก **"Service Account"**
4. ใส่ข้อมูล:
   - **Service account name**: `medical-records-system`
   - **Service account ID**: (auto-filled)
5. คลิก **"CREATE AND CONTINUE"**
6. ข้ามขั้นตอนการให้สิทธิ์ (ไม่บังคับ)
7. คลิก **"DONE"**

### 2.2 ตั้งค่าสิทธิ์

1. ไปที่ **Service Accounts** (ในหน้า Credentials)
2. คลิก Service Account ที่เพิ่งสร้าง (`medical-records-system`)
3. ไปที่ **Permissions** tab
4. คลิก **"GRANT ACCESS"**
5. ใส่ Email ของคุณ (Gmail)
6. เลือก Role: **Editor**
7. คลิก **"SAVE"**

---

## ขั้นตอนที่ 3: ดาวน์โหลด Credentials

### 3.1 สร้าง JSON Key

1. ไปที่ **Service Accounts** (ในหน้า Credentials)
2. คลิก Service Account ที่สร้าง (`medical-records-system`)
3. ไปที่ **Keys** tab
4. คลิก **"ADD KEY"** → **"Create new key"**
5. เลือก **"JSON"**
6. คลิก **"CREATE"**
7. ไฟล์ JSON จะดาวน์โหลดโดยอัตโนมัติ

### 3.2 บันทึก Credentials

1. เปิดโฟลเดอร์ที่ดาวน์โหลด
2. เปลี่ยนชื่อไฟล์เป็น: `credentials.json`
3. คัดลอกไฟล์ไปยังโฟลเดอร์โปรเจกต์:
   ```
   srinagarind-medical-record-request/credentials.json
   ```

### 3.3 ตรวจสอบไฟล์

ไฟล์ `credentials.json` ควรมีลักษณะดังนี้:

```json
{
  "type": "service_account",
  "project_id": "medical-records-system-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "medical-records-system@medical-records-system-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## ขั้นตอนที่ 4: ติดตั้ง Dependencies

### 4.1 ติดตั้ง Python Libraries

เปิด Terminal/Command Prompt และรันคำสั่ง:

```bash
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

หรือ (ถ้าใช้ Python 3):

```bash
pip3 install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### 4.2 ตรวจสอบการติดตั้ง

รันคำสั่ง:

```bash
python3 -c "from google.oauth2.service_account import Credentials; print('✅ Libraries installed successfully')"
```

---

## ขั้นตอนที่ 5: รันสคริปต์

### 5.1 เปิด Terminal

1. **Windows**: 
   - กด `Win + R`
   - พิมพ์ `cmd`
   - กด Enter

2. **macOS/Linux**:
   - เปิด Terminal

### 5.2 ไปยังโฟลเดอร์โปรเจกต์

```bash
cd /path/to/srinagarind-medical-record-request
```

ตัวอย่าง:
- **Windows**: `cd C:\Users\YourName\srinagarind-medical-record-request`
- **macOS**: `cd ~/srinagarind-medical-record-request`
- **Linux**: `cd ~/srinagarind-medical-record-request`

### 5.3 รันสคริปต์

```bash
python3 create_sheets.py --credentials credentials.json
```

### 5.4 ตรวจสอบผลลัพธ์

ถ้าสำเร็จ คุณจะเห็น:

```
🚀 เริ่มสร้าง Google Sheets...
📝 ชื่อ: Medical Records Request System - Srinagarind Hospital

📊 สร้าง Spreadsheet...
✅ สร้าง Spreadsheet สำเร็จ: 1a2b3c4d5e6f7g8h9i0j

🗑️  ลบ Sheet เริ่มต้น...

📋 สร้าง Sheets...
  ➕ Users...
  ➕ Requests...
  ➕ Patients...
  ➕ Notifications...
  ➕ Audit Log...
  ➕ Documents...
  ➕ SLA Settings...
  ➕ Email Templates...
  ➕ Settings...

📝 เพิ่มข้อมูลตัวอย่าง...

============================================================
✅ สร้าง Google Sheets สำเร็จ!
============================================================

📊 Spreadsheet ID: 1a2b3c4d5e6f7g8h9i0j
🔗 URL: https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j

📋 Sheets ที่สร้าง:
  1. Users
  2. Requests
  3. Patients
  4. Notifications
  5. Audit Log
  6. Documents
  7. SLA Settings
  8. Email Templates
  9. Settings

💡 ขั้นตอนถัดไป:
1. คัดลอก Spreadsheet ID ข้างบน
2. ไปที่ Code.gs ในโปรเจกต์
3. ใส่ Spreadsheet ID ในตัวแปร SPREADSHEET_ID
4. Deploy Code.gs
```

### 5.5 คัดลอก Spreadsheet ID

คัดลอก Spreadsheet ID (เช่น `1a2b3c4d5e6f7g8h9i0j`) ไว้ใช้ในขั้นตอนถัดไป

---

## ขั้นตอนที่ 6: ตั้งค่า Code.gs

### 6.1 เปิด Code.gs

ใน Google Apps Script Project ของคุณ เปิดไฟล์ `Code.gs`

### 6.2 ตั้งค่า Spreadsheet ID

หา section นี้:

```javascript
// ========================================
// CONFIGURATION
// ========================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

แทนที่ `YOUR_SPREADSHEET_ID_HERE` ด้วย Spreadsheet ID ที่คัดลอกมา:

```javascript
const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j';
```

### 6.3 บันทึกและ Deploy

1. คลิก **"Save"** (Ctrl+S)
2. คลิก **"Deploy"** → **"New Deployment"**
3. เลือก Type: **"Web app"**
4. ตั้งค่า:
   - **Execute as**: บัญชี Google ของคุณ
   - **Who has access**: **"Anyone"**
5. คลิก **"Deploy"**

---

## ✅ เสร็จสิ้น!

### สรุปสิ่งที่สร้าง

✓ **Google Cloud Project** - Medical Records Request System
✓ **Service Account** - medical-records-system
✓ **Google Sheets** - 9 Sheets พร้อมข้อมูลตัวอย่าง
✓ **Code.gs Configuration** - เชื่อมต่อกับ Google Sheets

### Sheets ที่สร้าง

1. **Users** - ข้อมูลผู้ใช้ระบบ
2. **Requests** - ข้อมูลคำร้องข้อมูลเวชระเบียน
3. **Patients** - ข้อมูลผู้ป่วย
4. **Notifications** - ข้อมูลการแจ้งเตือน
5. **Audit Log** - บันทึกการเข้าถึงข้อมูล (PDPA)
6. **Documents** - ข้อมูลประเภทเอกสาร
7. **SLA Settings** - ตั้งค่า SLA
8. **Email Templates** - Template ของ Email
9. **Settings** - ตั้งค่าระบบทั่วไป

---

## 🔧 Troubleshooting

### ปัญหา: "ModuleNotFoundError: No module named 'google'"

**วิธีแก้**:
```bash
pip3 install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### ปัญหา: "FileNotFoundError: credentials.json"

**วิธีแก้**:
1. ตรวจสอบว่าไฟล์ `credentials.json` อยู่ในโฟลเดอร์โปรเจกต์
2. ใช้ path เต็ม: `python3 create_sheets.py --credentials /full/path/to/credentials.json`

### ปัญหา: "Permission denied"

**วิธีแก้**:
1. ตรวจสอบว่า Service Account มีสิทธิ์ Editor
2. ตรวจสอบว่า Google Sheets API เปิดใช้งาน

### ปัญหา: "Invalid credentials"

**วิธีแก้**:
1. ลบ `credentials.json` เก่า
2. สร้าง JSON Key ใหม่จาก Google Cloud Console
3. บันทึกเป็น `credentials.json`

---

## 📞 ติดต่อ

หากมีปัญหา ติดต่อ:
- 📧 medical.records@hospital.ac.th
- 📞 0-4320-2000 ต่อ 1234

---

**Last Updated**: 2568-03-04  
**Version**: 1.0.0  
**Status**: Production Ready
