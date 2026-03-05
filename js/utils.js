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
  const date = new Date(isoString + 'T00:00:00Z');
  const day = date.getUTCDate();
  const month = CONFIG.THAI_MONTHS[date.getUTCMonth()];
  const year = toBuddhistYear(date);
  return `${day} ${month} ${year}`;
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
  const day = parts[0];
  const month = parts[1];
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
  const date = new Date(isoString + 'T00:00:00Z');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = toBuddhistYear(date);
  return `${day}/${month}/${year}`;
}

/**
 * Validate HN format
 * Pattern: 2 letters + 4 digits (e.g., AA1234)
 */
function validateHN(hn) {
  return /^[A-Za-z]{2}\d{4}$/.test(hn);
}

/**
 * Validate AN format
 * Pattern: 1 letter + 2 digits - 6 digits (e.g., I26-012345)
 */
function validateAN(an) {
  return /^[A-Za-z]\d{2}-\d{6}$/.test(an);
}

/**
 * Validate phone number format
 * Pattern: 0XX-XXXX-XXXX or 0XXX-XXXX-XXXX
 */
function validatePhone(phone) {
  return /^0[0-9]{1,2}-[0-9]{3,4}-[0-9]{4}$/.test(phone);
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
 * Types: success (green) | error (red) | warning (yellow) | info (blue)
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
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
  document.body.appendChild(container);
  return container;
}

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

/**
 * Show confirmation modal
 */
function showModal(title, message, onConfirm, confirmLabel = 'ยืนยัน', danger = false) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">${title}</h2>
      <p class="text-gray-600 mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition" onclick="this.closest('.fixed').remove()">
          ยกเลิก
        </button>
        <button class="px-4 py-2 rounded-lg ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition" onclick="this.closest('.fixed').remove(); (${onConfirm.toString()})()">
          ${confirmLabel}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

/**
 * Download CSV file
 */
function downloadCSV(data, filename) {
  if (!data || data.length === 0) {
    showToast('ไม่มีข้อมูลที่จะส่งออก', 'warning');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    '\uFEFF' + headers.join(','), // BOM for UTF-8 + headers
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get avatar initial from first name
 */
function getAvatarInitial(firstName) {
  return firstName ? firstName.charAt(0).toUpperCase() : '?';
}

/**
 * Get avatar color based on UID
 */
function getAvatarColor(uid) {
  if (!uid) return CONFIG.AVATAR_COLORS[0];
  const hash = uid.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CONFIG.AVATAR_COLORS[hash % CONFIG.AVATAR_COLORS.length];
}

/**
 * Render default avatar (colored circle with initial)
 */
function renderDefaultAvatar(containerEl, firstName, uid) {
  const bg = getAvatarColor(uid);
  const initial = getAvatarInitial(firstName);
  containerEl.style.backgroundColor = bg;
  containerEl.style.color = '#ffffff';
  containerEl.style.width = '40px';
  containerEl.style.height = '40px';
  containerEl.style.borderRadius = '50%';
  containerEl.style.display = 'flex';
  containerEl.style.alignItems = 'center';
  containerEl.style.justifyContent = 'center';
  containerEl.style.fontSize = '18px';
  containerEl.style.fontWeight = 'bold';
  containerEl.textContent = initial;
}

/**
 * Debounce function
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate string to max length
 */
function truncate(str, max = 60) {
  return str.length > max ? str.substring(0, max) + '...' : str;
}

/**
 * Sanitize filename
 */
function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9ก-๙._-]/g, '_');
}

/**
 * Format time ago
 * Input: ISO datetime string
 * Output: "เพิ่งเมื่อกี้", "5 นาทีที่แล้ว", etc.
 */
function timeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'เพิ่งเมื่อกี้';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} นาทีที่แล้ว`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ชั่วโมงที่แล้ว`;
  }
  if (seconds < 172800) return 'เมื่อวาน';

  const days = Math.floor(seconds / 86400);
  return `${days} วันที่แล้ว`;
}

/**
 * Get query parameter from URL
 */
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Set query parameter in URL
 */
function setQueryParam(param, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(param, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

/**
 * Check if user is on mobile
 */
function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Format currency (Thai Baht)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
}

/**
 * Calculate business days between two dates (skip weekends)
 */
function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday (0) and Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Add business days to a date
 */
function addBusinessDays(date, days) {
  let count = 0;
  const result = new Date(date);
  
  while (count < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  
  return result;
}

/**
 * Check if date is in the past
 */
function isPastDate(isoString) {
  const date = new Date(isoString + 'T00:00:00Z');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if date is today
 */
function isToday(isoString) {
  const date = new Date(isoString + 'T00:00:00Z');
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('คัดลอกสำเร็จ', 'success');
  } catch (err) {
    showToast('ไม่สามารถคัดลอกได้', 'error');
  }
}

/**
 * Generate unique ID
 */
function generateUID() {
  return 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Parse JSON safely
 */
function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}
