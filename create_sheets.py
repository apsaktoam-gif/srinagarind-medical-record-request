#!/usr/bin/env python3
"""
สคริปต์สำหรับสร้าง Google Sheets อัตโนมัติ
ระบบคำขอข้อมูลเวชระเบียน - โรงพยาบาลศรีนครินทร์

ใช้งาน:
    python3 create_sheets.py --credentials credentials.json
"""

import json
import sys
import argparse
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ตั้งค่า Scopes
SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

# ชื่อ Sheets ที่ต้องสร้าง
SHEETS_CONFIG = {
    'Users': {
        'description': 'ข้อมูลผู้ใช้ระบบ',
        'headers': [
            'User ID', 'Email', 'Name', 'Phone', 'Profession', 'Organization',
            'Status', 'Avatar URL', 'Created Date', 'Approved Date', 'Approved By',
            'Notes', 'Last Login', 'Is Active', 'PDPA Consent'
        ]
    },
    'Requests': {
        'description': 'ข้อมูลคำร้องข้อมูลเวชระเบียน',
        'headers': [
            'Request ID', 'User ID', 'Patient HN', 'Patient Name', 'Documents Requested',
            'Purpose', 'Urgency', 'Status', 'Created Date', 'Approved Date', 'Completed Date',
            'SLA Deadline', 'Notes', 'Attachment URL', 'Result File URL', 'Approved By'
        ]
    },
    'Patients': {
        'description': 'ข้อมูลผู้ป่วย',
        'headers': [
            'HN', 'Patient ID', 'First Name', 'Last Name', 'Date of Birth', 'Gender',
            'Phone', 'Email', 'Address', 'Province', 'District', 'Sub-district', 'Postal Code',
            'Emergency Contact', 'Emergency Phone', 'Insurance Number', 'Created Date', 'Updated Date'
        ]
    },
    'Notifications': {
        'description': 'ข้อมูลการแจ้งเตือน',
        'headers': [
            'Notification ID', 'User ID', 'Request ID', 'Type', 'Title', 'Message',
            'Status', 'Email Sent', 'Email Sent Date', 'In-app Notification', 'Read',
            'Read Date', 'Created Date', 'Expires Date'
        ]
    },
    'Audit Log': {
        'description': 'บันทึกการเข้าถึงข้อมูล (PDPA)',
        'headers': [
            'Log ID', 'Timestamp', 'User ID', 'User Email', 'Action', 'Resource Type',
            'Resource ID', 'Details', 'IP Address', 'User Agent', 'Status', 'Error Message'
        ]
    },
    'Documents': {
        'description': 'ข้อมูลประเภทเอกสาร',
        'headers': [
            'Document ID', 'Document Name', 'Description', 'Category', 'Is Active',
            'Processing Time (days)', 'Required Fields', 'Created Date', 'Updated Date'
        ]
    },
    'SLA Settings': {
        'description': 'ตั้งค่า SLA',
        'headers': [
            'SLA ID', 'Type', 'Days', 'Hours', 'Description', 'Cost', 'Is Active'
        ]
    },
    'Email Templates': {
        'description': 'Template ของ Email',
        'headers': [
            'Template ID', 'Template Name', 'Subject', 'Body', 'Variables',
            'Type', 'Is Active', 'Created Date', 'Updated Date'
        ]
    },
    'Settings': {
        'description': 'ตั้งค่าระบบทั่วไป',
        'headers': [
            'Setting Key', 'Setting Value', 'Description', 'Type', 'Updated Date', 'Updated By'
        ]
    }
}

def authenticate(credentials_file):
    """ยืนยันตัวตนกับ Google API"""
    try:
        credentials = Credentials.from_service_account_file(
            credentials_file, scopes=SCOPES
        )
        return credentials
    except FileNotFoundError:
        print(f"❌ ไม่พบไฟล์ {credentials_file}")
        print("📝 ขั้นตอน:")
        print("1. ไปที่ https://console.cloud.google.com/")
        print("2. สร้าง Service Account")
        print("3. ดาวน์โหลด JSON credentials")
        print("4. บันทึกเป็น credentials.json")
        sys.exit(1)
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการยืนยันตัวตน: {e}")
        sys.exit(1)

def create_spreadsheet(service, title):
    """สร้าง Spreadsheet ใหม่"""
    try:
        spreadsheet = {
            'properties': {
                'title': title,
                'locale': 'th_TH',
                'autoRecalc': 'ON_CHANGE',
                'timeZone': 'Asia/Bangkok'
            }
        }
        result = service.spreadsheets().create(body=spreadsheet, fields='spreadsheetId').execute()
        return result.get('spreadsheetId')
    except HttpError as error:
        print(f"❌ เกิดข้อผิดพลาด: {error}")
        return None

def add_sheet(service, spreadsheet_id, sheet_name):
    """เพิ่ม Sheet ใหม่"""
    try:
        request = {
            'addSheet': {
                'properties': {
                    'title': sheet_name
                }
            }
        }
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={'requests': [request]}
        ).execute()
    except HttpError as error:
        print(f"❌ เกิดข้อผิดพลาด: {error}")

def add_headers(service, spreadsheet_id, sheet_name, headers):
    """เพิ่ม Headers ลงใน Sheet"""
    try:
        # ค้นหา Sheet ID
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        sheet_id = None
        for sheet in sheets:
            if sheet['properties']['title'] == sheet_name:
                sheet_id = sheet['properties']['sheetId']
                break
        
        if sheet_id is None:
            print(f"❌ ไม่พบ Sheet: {sheet_name}")
            return
        
        # เพิ่ม Headers
        range_name = f"'{sheet_name}'!A1"
        values = [headers]
        body = {'values': values}
        
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        # ทำให้ Headers เป็น Bold
        requests = [
            {
                'repeatCell': {
                    'range': {
                        'sheetId': sheet_id,
                        'startRowIndex': 0,
                        'endRowIndex': 1,
                        'startColumnIndex': 0,
                        'endColumnIndex': len(headers)
                    },
                    'cell': {
                        'userEnteredFormat': {
                            'textFormat': {
                                'bold': True,
                                'fontSize': 11
                            },
                            'backgroundColor': {
                                'red': 0.2,
                                'green': 0.2,
                                'blue': 0.2
                            },
                            'textColor': {
                                'red': 1,
                                'green': 1,
                                'blue': 1
                            }
                        }
                    },
                    'fields': 'userEnteredFormat'
                }
            },
            {
                'updateSheetProperties': {
                    'properties': {
                        'sheetId': sheet_id,
                        'gridProperties': {
                            'frozenRowCount': 1
                        }
                    },
                    'fields': 'gridProperties.frozenRowCount'
                }
            }
        ]
        
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={'requests': requests}
        ).execute()
        
    except HttpError as error:
        print(f"❌ เกิดข้อผิดพลาด: {error}")

def add_sample_data(service, spreadsheet_id):
    """เพิ่มข้อมูลตัวอย่าง"""
    try:
        # ข้อมูลตัวอย่าง SLA Settings
        sla_data = [
            ['SLA-001', 'Normal', 3, 0, 'ปกติ 3 วันทำการ', 0, 'TRUE'],
            ['SLA-002', 'Urgent', 1, 0, 'เร่งด่วน 1 วันทำการ', 500, 'TRUE']
        ]
        
        range_name = "'SLA Settings'!A2"
        body = {'values': sla_data}
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        # ข้อมูลตัวอย่าง Documents
        documents_data = [
            ['DOC-001', 'เวชระเบียนทั่วไป', 'Medical Record', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
            ['DOC-002', 'ผลการตรวจห้องแล็บ', 'Lab Results', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
            ['DOC-003', 'ผลการถ่ายภาพ', 'Imaging Results', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
            ['DOC-004', 'ใบสั่งยา', 'Prescription', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04'],
            ['DOC-005', 'ใบวินิจฉัย', 'Diagnosis', 'Medical', 'TRUE', 1, 'HN,Date Range', '2568-03-04', '2568-03-04']
        ]
        
        range_name = "'Documents'!A2"
        body = {'values': documents_data}
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        # ข้อมูลตัวอย่าง Settings
        settings_data = [
            ['HOSPITAL_NAME', 'โรงพยาบาลศรีนครินทร์', 'ชื่อโรงพยาบาล', 'String', '2568-03-04', 'System'],
            ['HOSPITAL_PHONE', '0-4320-2000', 'เบอร์โทรศัพท์', 'String', '2568-03-04', 'System'],
            ['HOSPITAL_EMAIL', 'medical.records@hospital.ac.th', 'อีเมล', 'String', '2568-03-04', 'System'],
            ['MAX_PATIENTS_PER_REQUEST', '20', 'จำนวนผู้ป่วยสูงสุดต่อคำร้อง', 'Number', '2568-03-04', 'System'],
            ['MAX_FILE_SIZE_MB', '5', 'ขนาดไฟล์สูงสุด (MB)', 'Number', '2568-03-04', 'System'],
            ['ENABLE_URGENT_REQUEST', 'TRUE', 'เปิดใช้คำร้องเร่งด่วน', 'Boolean', '2568-03-04', 'System']
        ]
        
        range_name = "'Settings'!A2"
        body = {'values': settings_data}
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
    except HttpError as error:
        print(f"❌ เกิดข้อผิดพลาด: {error}")

def share_spreadsheet(service, spreadsheet_id, email):
    """แชร์ Spreadsheet กับ Email"""
    try:
        drive_service = build('drive', 'v3', credentials=service._http)
        
        permission = {
            'type': 'user',
            'role': 'owner',
            'emailAddress': email
        }
        
        drive_service.permissions().create(
            fileId=spreadsheet_id,
            body=permission,
            fields='id'
        ).execute()
        
        print(f"✅ แชร์ Spreadsheet กับ {email}")
    except HttpError as error:
        print(f"⚠️  ไม่สามารถแชร์ได้: {error}")

def main():
    parser = argparse.ArgumentParser(
        description='สร้าง Google Sheets อัตโนมัติสำหรับระบบคำขอข้อมูลเวชระเบียน'
    )
    parser.add_argument(
        '--credentials',
        required=True,
        help='ไฟล์ credentials.json จาก Google Cloud'
    )
    parser.add_argument(
        '--title',
        default='Medical Records Request System - Srinagarind Hospital',
        help='ชื่อ Spreadsheet'
    )
    parser.add_argument(
        '--share-email',
        help='แชร์ Spreadsheet กับ Email นี้'
    )
    
    args = parser.parse_args()
    
    print("🚀 เริ่มสร้าง Google Sheets...")
    print(f"📝 ชื่อ: {args.title}")
    print()
    
    # ยืนยันตัวตน
    credentials = authenticate(args.credentials)
    service = build('sheets', 'v4', credentials=credentials)
    
    # สร้าง Spreadsheet
    print("📊 สร้าง Spreadsheet...")
    spreadsheet_id = create_spreadsheet(service, args.title)
    
    if not spreadsheet_id:
        print("❌ ไม่สามารถสร้าง Spreadsheet ได้")
        sys.exit(1)
    
    print(f"✅ สร้าง Spreadsheet สำเร็จ: {spreadsheet_id}")
    print()
    
    # ลบ Sheet เริ่มต้น
    print("🗑️  ลบ Sheet เริ่มต้น...")
    try:
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        if sheets:
            sheet_id = sheets[0]['properties']['sheetId']
            request = {'deleteSheet': {'sheetId': sheet_id}}
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={'requests': [request]}
            ).execute()
    except:
        pass
    
    print()
    
    # สร้าง Sheets
    print("📋 สร้าง Sheets...")
    for sheet_name, config in SHEETS_CONFIG.items():
        print(f"  ➕ {sheet_name}...")
        add_sheet(service, spreadsheet_id, sheet_name)
        add_headers(service, spreadsheet_id, sheet_name, config['headers'])
    
    print()
    
    # เพิ่มข้อมูลตัวอย่าง
    print("📝 เพิ่มข้อมูลตัวอย่าง...")
    add_sample_data(service, spreadsheet_id)
    
    print()
    
    # แชร์ Spreadsheet (ถ้ามี)
    if args.share_email:
        print(f"👥 แชร์กับ {args.share_email}...")
        share_spreadsheet(service, spreadsheet_id, args.share_email)
    
    print()
    print("=" * 60)
    print("✅ สร้าง Google Sheets สำเร็จ!")
    print("=" * 60)
    print()
    print(f"📊 Spreadsheet ID: {spreadsheet_id}")
    print(f"🔗 URL: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
    print()
    print("📋 Sheets ที่สร้าง:")
    for i, sheet_name in enumerate(SHEETS_CONFIG.keys(), 1):
        print(f"  {i}. {sheet_name}")
    print()
    print("💡 ขั้นตอนถัดไป:")
    print("1. คัดลอก Spreadsheet ID ข้างบน")
    print("2. ไปที่ Code.gs ในโปรเจกต์")
    print("3. ใส่ Spreadsheet ID ในตัวแปร SPREADSHEET_ID")
    print("4. Deploy Code.gs")
    print()

if __name__ == '__main__':
    main()
