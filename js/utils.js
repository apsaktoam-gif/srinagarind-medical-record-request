// ═══════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert Gregorian year to Buddhist year
 */
function toBuddhistYear(date) {
  return date.getFullYear() + 543;
}

/**
 * Format ISO date to Thai display format
 * Input: "2025-03-15"
 * Output: "15 มีนาคม 2568"
 */
function formatThaiDate(isoString) {
  if (!isoString) return '';
  // แยกส่วนปี เดือน วัน เพื่อป้องกันปัญหา Timezone Offset
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const thaiMonth = CONFIG.THAI_MONTHS[date.getMonth()];
  const thaiYear = toBuddhistYear(date);
  return `${day} ${thaiMonth} ${thaiYear}`;
}

/**
 * Format ISO datetime to Thai display format
 * Input: "2025-03-15T14:30:00Z"
 * Output: "15 มีนาคม 2568 เวลา 14:30 น."
 */
function formatThaiDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = date.getDate();
  const month = CONFIG.THAI_MONTHS[date.getMonth()];
  const year = toBuddhistYear(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
}

/**
 * Convert Buddhist date string to ISO format
 * Input: "15/03/2568"
 * Output: "2025-03-15"
 */
function buddhistToISO(ddmmyyyy) {
  if (!ddmmyyyy) return '';
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return '';
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const buddhist_year = parseInt(parts[2]);
  const gregorian_year = buddhist_year - 543;
  return `${gregorian_year}-${month}-${day}`;
}

/**
 * Convert ISO date to Buddhist display format
 * Input: "2025-03-15"
 * Output: "15/03/2568"
 */
function isoToBuddhistDisplay(isoString) {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = toBuddhistYear(date);
  return `${d}/${m}/${y}`;
}

/**
 * Validate HN format (2 letters + 4 digits)
 */
function validateHN(hn) {
  return /^[A-Za-z]{2}\d{4}$/.test(hn);
}

/**
 * Validate AN format (1 letter + 2 digits - 6 digits)
 */
function validateAN(an) {
  return /^[A-Za-z]\d{2}-\d{6}$/.test(an);
}

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  return /^0[0-9]{1,2}-[0-9]{3,4}-[0-9]{4}$/.test(phone) || /^0[0-9]{9}$/.test(phone);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format request type to Thai display
 */
function formatRequestType(type) {
  if (type === 'IPD') return 'เวชระเบียนผู้ป่วยใน (IPD)';
  if (type === 'OPD') return 'เวชระเบียนผู้ป่วยนอก (OPD)';
  return type;
}

/**
 * Get status color object
 */
function formatStatus(status) {
  return CONFIG.STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 mb-2`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-[9999] flex flex-col items-end';
  document.body.appendChild(container);
  return container;
}

/**
 * Show/Hide loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

/**
 * Show confirmation modal (ปรับปรุงให้ใช้ Event Listener แทน String Function)
 */
function showModal(title, message, onConfirm, confirmLabel = 'ยืนยัน', danger = false) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
      <h2 class="text-xl font-bold text-gray-900 mb-2">${title}</h2>
      <p class="text-gray-600 mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button id="modal-cancel" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
          ยกเลิก
        </button>
        <button id="modal-confirm" class="px-4 py-2 rounded-lg ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition">
          ${confirmLabel}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#modal-cancel').onclick = close;
  modal.querySelector('#modal-confirm').onclick = () => {
    onConfirm();
    close();
  };
}

/**
 * Download CSV file
 */
function downloadCSV(data, filename) {
  if (!data || data.length === 0) {
    showToast('ไม่มีข้อมูลที่จะส่งออก', 'warning');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    '\uFEFF' + headers.join(','), 
    ...data.map(row => 
      headers.map(header => {
        let value = row[header] === null || row[header] === undefined ? '' : row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/**
 * Avatar Helpers
 */
function getAvatarInitial(firstName) {
  return firstName ? firstName.charAt(0).toUpperCase() : '?';
}

function getAvatarColor(uid) {
  if (!uid) return CONFIG.AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CONFIG.AVATAR_COLORS.length;
  return CONFIG.AVATAR_COLORS[index];
}

function renderDefaultAvatar(containerEl, firstName, uid) {
  if (!containerEl) return;
  containerEl.style.backgroundColor = getAvatarColor(uid);
  containerEl.style.color = '#ffffff';
  containerEl.style.display = 'flex';
  containerEl.style.alignItems = 'center';
  containerEl.style.justifyContent = 'center';
  containerEl.style.fontWeight = 'bold';
  containerEl.textContent = getAvatarInitial(firstName);
}

/**
 * Helper functions
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function truncate(str, max = 60) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9ก-๙._-]/g, '_');
}

function timeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'เมื่อสักครู่';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
  if (seconds < 172800) return 'เมื่อวาน';
  return formatThaiDate(isoString.split('T')[0]);
}

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function setQueryParam(param, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(param, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

function isMobile() {
  return window.innerWidth < 768;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
}

/**
 * Business Day Calculations
 */
function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function addBusinessDays(date, days) {
  let result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
}

/**
 * Date Comparisons
 */
function isPastDate(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isToday(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Misc Utilities
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('คัดลอกลงคลิปบอร์ดแล้ว', 'success');
  } catch (err) {
    showToast('ไม่สามารถคัดลอกได้', 'error');
  }
}

function generateUID() {
  return 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}
