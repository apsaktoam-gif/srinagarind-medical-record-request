// ═══════════════════════════════════════════════════════════════════
// Configuration File
// ═══════════════════════════════════════════════════════════════════

// Firebase Configuration (ต้องแก้ไขจาก Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCATKXMpsvDt22sK40gKe2TbmeAb-owJmI",
  authDomain: "medical-records-system-5eb97.firebaseapp.com",
  databaseURL: "https://medical-records-system-5eb97-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "medical-records-system-5eb97",
  storageBucket: "medical-records-system-5eb97.firebasestorage.app",
  messagingSenderId: "662770268611",
  appId: "1:662770268611:web:848ed2a1982e02f5ee2576"
};

// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSmXOFhPHu6DFyC0kuhj9sQjYSu-YwS0p8vWVy61vlzlq-TH9BrI7fl4mtlbUH-rmY/exec';

// Allowed email domains
const ALLOWED_DOMAINS = ['gmail.com', 'kku.ac.th'];

// Notification polling interval (milliseconds)
const POLLING_NOTIFY_MS = 30000; // 30 seconds

// File upload limits
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;
const MAX_PATIENTS = 20;

// SLA defaults
const DEFAULT_SLA_NORMAL_DAYS = 3;
const DEFAULT_SLA_URGENT_DAYS = 1;

// Color palette for avatars
const AVATAR_COLORS = [
  '#1a56db', '#047481', '#057a55', '#9f580a', '#c81e1e', '#5521b5', '#0e9f6e', '#d61f69'
];

// Status colors mapping
const STATUS_COLORS = {
  'รอดำเนินการ': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'กำลังดำเนินการ': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'รอเอกสาร': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'เสร็จสิ้น': { bg: 'bg-green-100', text: 'text-green-800' },
  'ปฏิเสธ': { bg: 'bg-red-100', text: 'text-red-800' },
  'ยกเลิก': { bg: 'bg-gray-100', text: 'text-gray-600' }
};

// Notification types
const NOTIFICATION_TYPES = {
  REQUEST_RECEIVED: 'request_received',
  NEW_REQUEST_ALERT: 'new_request_alert',
  STATUS_UPDATE: 'status_update',
  RESULT_READY: 'result_ready',
  REQUEST_REJECTED: 'request_rejected',
  USER_APPROVED: 'user_approved',
  USER_REJECTED: 'user_rejected',
  NEW_USER_PENDING: 'new_user_pending',
  REQUEST_CANCELLED: 'request_cancelled',
  ANNOUNCEMENT: 'announcement'
};

const REQUEST_TYPES = { IPD: 'IPD', OPD: 'OPD' };

const IPD_DOCUMENTS = [
  'ใบสรุปการรักษา (Discharge Summary)', 'ผลการตรวจทางห้องปฏิบัติการ (Lab Results)', 
  'ผลภาพรังสีวิทยา (X-Ray / CT / MRI / Ultrasound)', 'ใบสั่งยา (Prescription)', 
  'บันทึกการพยาบาล (Nursing Notes)', 'บันทึกการผ่าตัด (Operative Notes)', 
  'บันทึกวิสัญญี (Anesthesia Record)', 'ผลพยาธิวิทยา (Pathology Report)', 
  'ใบรับรองแพทย์ (Medical Certificate)', 'เวชระเบียนทั้งหมด (Complete Record)'
];

const OPD_DOCUMENTS = [
  'บันทึกการตรวจรักษา (OPD Notes)', 'ผลการตรวจทางห้องปฏิบัติการ (Lab Results)', 
  'ผลภาพรังสีวิทยา (X-Ray / CT / MRI / Ultrasound)', 'ใบสั่งยา (Prescription)', 
  'บันทึกการพยาบาล (Nursing Notes)', 'ใบรับรองแพทย์ (Medical Certificate)', 
  'ผลทดสอบพิเศษ (EEG / EMG / ฯลฯ)', 'เวชระเบียนทั้งหมด (Complete Record)'
];

const REQUEST_PURPOSES = [
  'เพื่อการรักษาต่อเนื่อง', 'เพื่อการวิจัย', 'เพื่อการศึกษา', 
  'เพื่อประกันภัย / ประกันสังคม', 'เพื่อกฎหมาย / คดีความ', 
  'เพื่อส่งต่อผู้ป่วย (Refer)', 'เพื่อตรวจสอบคุณภาพ / Audit', 'อื่นๆ'
];

const PATIENT_RELATIONSHIPS = [
  'แพทย์ผู้รักษา', 'พยาบาลผู้ดูแล', 'ผู้ป่วยตนเอง', 'บิดา/มารดา', 
  'คู่สมรส', 'บุตร', 'ญาติ', 'ทนายความ / ผู้รับมอบอำนาจ', 
  'เจ้าหน้าที่ประกันภัย', 'อื่นๆ'
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const SEED_ADMINS = ['toam2532@gmail.com', 'ritttu@kku.ac.th'];
const HOSPITAL_NAME = 'โรงพยาบาลศรีนครินทร์';
const DEPARTMENT_NAME = 'งานเวชระเบียนและสถิติ';
const SYSTEM_NAME = 'ระบบคำขอข้อมูลเวชระเบียน';

// Export all configurations
window.CONFIG = {
  firebaseConfig,
  APPS_SCRIPT_URL,
  ALLOWED_DOMAINS,
  POLLING_NOTIFY_MS,
  MAX_FILE_SIZE_MB,
  MAX_FILES,
  MAX_PATIENTS,
  DEFAULT_SLA_NORMAL_DAYS,
  DEFAULT_SLA_URGENT_DAYS,
  AVATAR_COLORS,
  STATUS_COLORS,
  NOTIFICATION_TYPES,
  REQUEST_TYPES,
  IPD_DOCUMENTS,
  OPD_DOCUMENTS,
  REQUEST_PURPOSES,
  PATIENT_RELATIONSHIPS,
  THAI_MONTHS,
  THAI_DAYS,
  SEED_ADMINS,
  HOSPITAL_NAME,
  DEPARTMENT_NAME,
  SYSTEM_NAME
};
