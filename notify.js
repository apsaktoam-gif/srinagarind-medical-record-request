// ═══════════════════════════════════════════════════════════════════
// Notification Module - In-Web Notifications with Polling
// ═══════════════════════════════════════════════════════════════════

let _unreadCount = 0;
let _pollingTimer = null;

/**
 * Initialize notification polling
 */
function initNotificationPolling() {
  // Check immediately
  checkUnreadCount();
  
  // Then poll every 30 seconds
  _pollingTimer = setInterval(checkUnreadCount, CONFIG.POLLING_NOTIFY_MS);
}

/**
 * Stop notification polling
 */
function stopNotificationPolling() {
  if (_pollingTimer) {
    clearInterval(_pollingTimer);
    _pollingTimer = null;
  }
}

/**
 * Check unread notification count
 */
async function checkUnreadCount() {
  const result = await api.getUnreadCount();
  if (result === null) return;
  
  _unreadCount = result.count || 0;
  updateBellBadge(_unreadCount);
}

/**
 * Update bell icon badge
 */
function updateBellBadge(count) {
  const badge = document.getElementById('bell-badge');
  if (!badge) return;
  
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/**
 * Load and display notification dropdown
 */
async function loadNotificationDropdown() {
  const dropdownList = document.getElementById('notif-dropdown-list');
  if (!dropdownList) return;
  
  // Show loading
  dropdownList.innerHTML = '<div class="p-4 text-center text-gray-500">กำลังโหลด...</div>';
  
  const items = await api.getNotifications();
  
  if (!items || items.length === 0) {
    dropdownList.innerHTML = '<div class="p-4 text-center text-gray-500">ไม่มีการแจ้งเตือน</div>';
    return;
  }
  
  // Render notifications
  dropdownList.innerHTML = '';
  items.slice(0, 10).forEach(item => {
    const notifEl = createNotificationItem(item);
    dropdownList.appendChild(notifEl);
  });
  
  // Add "view all" link
  if (items.length > 10) {
    const viewAllEl = document.createElement('div');
    viewAllEl.className = 'border-t border-gray-200 p-3 text-center';
    viewAllEl.innerHTML = '<a href="/notifications.html" class="text-blue-600 hover:text-blue-800 text-sm font-medium">ดูการแจ้งเตือนทั้งหมด</a>';
    dropdownList.appendChild(viewAllEl);
  }
}

/**
 * Create notification item element
 */
function createNotificationItem(item) {
  const div = document.createElement('div');
  div.className = `notif-item p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${item.isRead ? '' : 'bg-blue-50'}`;
  div.dataset.id = item.notifId;
  
  const dotColor = item.isRead ? 'bg-gray-300' : 'bg-blue-500';
  const bodyText = truncate(item.body || '', 60);
  
  div.innerHTML = `
    <div class="flex gap-3">
      <div class="flex-shrink-0 mt-1">
        <div class="w-2 h-2 rounded-full ${dotColor}"></div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900">${item.title}</p>
        <p class="text-xs text-gray-600 mt-0.5">${bodyText}</p>
        <p class="text-xs text-gray-400 mt-1">${timeAgo(item.createdAt)}</p>
      </div>
    </div>
  `;
  
  div.addEventListener('click', async () => {
    await markOneRead(item.notifId);
    if (item.linkUrl) {
      window.location.href = item.linkUrl;
    }
  });
  
  return div;
}

/**
 * Mark single notification as read
 */
async function markOneRead(notifId) {
  const result = await api.markOneRead(notifId);
  if (result) {
    _unreadCount = Math.max(0, _unreadCount - 1);
    updateBellBadge(_unreadCount);
  }
}

/**
 * Mark all notifications as read
 */
async function markAllReadAndRefresh() {
  const result = await api.markAllRead();
  if (result) {
    _unreadCount = 0;
    updateBellBadge(0);
    await loadNotificationDropdown();
  }
}

/**
 * Setup bell icon click handler
 */
function setupBellIconHandler() {
  const bellIcon = document.getElementById('bell-icon');
  const dropdown = document.getElementById('notif-dropdown');
  
  if (!bellIcon || !dropdown) return;
  
  bellIcon.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    if (dropdown.classList.contains('hidden')) {
      dropdown.classList.remove('hidden');
      await loadNotificationDropdown();
    } else {
      dropdown.classList.add('hidden');
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!bellIcon.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

/**
 * Render notifications page
 */
async function renderNotificationsPage() {
  const container = document.getElementById('notifications-container');
  if (!container) return;
  
  showLoading();
  const items = await api.getNotifications();
  hideLoading();
  
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">ไม่มีการแจ้งเตือน</div>';
    return;
  }
  
  // Create filter tabs
  const filterContainer = document.createElement('div');
  filterContainer.className = 'flex gap-2 mb-6 border-b border-gray-200';
  
  const allBtn = document.createElement('button');
  allBtn.className = 'px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium';
  allBtn.textContent = 'ทั้งหมด';
  
  const unreadBtn = document.createElement('button');
  unreadBtn.className = 'px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900';
  unreadBtn.textContent = 'ยังไม่อ่าน';
  
  const readBtn = document.createElement('button');
  readBtn.className = 'px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900';
  readBtn.textContent = 'อ่านแล้ว';
  
  filterContainer.appendChild(allBtn);
  filterContainer.appendChild(unreadBtn);
  filterContainer.appendChild(readBtn);
  
  // Create notifications list
  const listContainer = document.createElement('div');
  listContainer.id = 'notifications-list';
  
  // Render all notifications
  const renderNotifications = (filter) => {
    listContainer.innerHTML = '';
    
    let filtered = items;
    if (filter === 'unread') {
      filtered = items.filter(i => !i.isRead);
    } else if (filter === 'read') {
      filtered = items.filter(i => i.isRead);
    }
    
    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="text-center py-8 text-gray-500">ไม่มีการแจ้งเตือน</div>';
      return;
    }
    
    filtered.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `p-4 border-b border-gray-200 hover:bg-gray-50 transition ${item.isRead ? '' : 'bg-blue-50'}`;
      
      const statusDot = item.isRead ? '⚪' : '🔵';
      const typeColor = getNotificationTypeColor(item.type);
      
      let actionHtml = '';
      if (item.actionUrl && item.actionLabel) {
        actionHtml = `<a href="${item.actionUrl}" target="_blank" class="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">🔗 ${item.actionLabel}</a>`;
      }
      
      itemEl.innerHTML = `
        <div class="flex gap-3">
          <div class="flex-shrink-0">${statusDot}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-full ${typeColor}">${getNotificationTypeLabel(item.type)}</span>
              <span class="text-xs text-gray-500">${formatThaiDateTime(item.createdAt)}</span>
            </div>
            <h3 class="font-semibold text-gray-900 mt-1">${item.title}</h3>
            <p class="text-gray-600 text-sm mt-1">${item.body}</p>
            ${actionHtml}
          </div>
          <button onclick="deleteNotification('${item.notifId}')" class="text-red-500 hover:text-red-700">✕</button>
        </div>
      `;
      
      listContainer.appendChild(itemEl);
    });
  };
  
  // Filter button handlers
  allBtn.addEventListener('click', () => {
    allBtn.classList.add('border-blue-600', 'text-blue-600');
    unreadBtn.classList.remove('border-blue-600', 'text-blue-600');
    readBtn.classList.remove('border-blue-600', 'text-blue-600');
    renderNotifications('all');
  });
  
  unreadBtn.addEventListener('click', () => {
    unreadBtn.classList.add('border-blue-600', 'text-blue-600');
    allBtn.classList.remove('border-blue-600', 'text-blue-600');
    readBtn.classList.remove('border-blue-600', 'text-blue-600');
    renderNotifications('unread');
  });
  
  readBtn.addEventListener('click', () => {
    readBtn.classList.add('border-blue-600', 'text-blue-600');
    allBtn.classList.remove('border-blue-600', 'text-blue-600');
    unreadBtn.classList.remove('border-blue-600', 'text-blue-600');
    renderNotifications('read');
  });
  
  // Initial render
  renderNotifications('all');
  
  // Clear container and add new content
  container.innerHTML = '';
  container.appendChild(filterContainer);
  
  // Add mark all read button
  const markAllBtn = document.createElement('button');
  markAllBtn.className = 'mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition';
  markAllBtn.textContent = 'อ่านทั้งหมด';
  markAllBtn.addEventListener('click', markAllReadAndRefresh);
  container.appendChild(markAllBtn);
  
  container.appendChild(listContainer);
}

/**
 * Delete notification
 */
async function deleteNotification(notifId) {
  const result = await api.deleteNotification(notifId);
  if (result) {
    showToast('ลบการแจ้งเตือนสำเร็จ', 'success');
    // Reload the page
    location.reload();
  }
}

/**
 * Get notification type color
 */
function getNotificationTypeColor(type) {
  const colors = {
    request_received: 'bg-blue-100 text-blue-800',
    new_request_alert: 'bg-red-100 text-red-800',
    status_update: 'bg-yellow-100 text-yellow-800',
    result_ready: 'bg-green-100 text-green-800',
    request_rejected: 'bg-red-100 text-red-800',
    user_approved: 'bg-green-100 text-green-800',
    new_user_pending: 'bg-purple-100 text-purple-800',
    request_cancelled: 'bg-gray-100 text-gray-800',
    announcement: 'bg-indigo-100 text-indigo-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Get notification type label
 */
function getNotificationTypeLabel(type) {
  const labels = {
    request_received: 'รับคำร้อง',
    new_request_alert: 'คำร้องใหม่',
    status_update: 'อัปเดตสถานะ',
    result_ready: 'ผลลัพธ์พร้อม',
    request_rejected: 'ปฏิเสธ',
    user_approved: 'อนุมัติผู้ใช้',
    new_user_pending: 'ผู้ใช้ใหม่',
    request_cancelled: 'ยกเลิก',
    announcement: 'ประกาศ'
  };
  return labels[type] || type;
}

/**
 * Auto-initialize on page load if user is authenticated
 */
document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated && isAuthenticated()) {
    initNotificationPolling();
    setupBellIconHandler();
  }
});

/**
 * Stop polling when page unloads
 */
window.addEventListener('beforeunload', () => {
  stopNotificationPolling();
});
