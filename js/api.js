// ═══════════════════════════════════════════════════════════════════
// API Module - Communication with Apps Script Backend
// ═══════════════════════════════════════════════════════════════════

const api = {
  /**
   * Generic API call function
   */
  async call(action, params = {}) {
    showLoading();
    try {
      let idToken = null;
      
      // Get ID token if user is authenticated (not needed for public actions)
      if (isAuthenticated && isAuthenticated()) {
        try {
          idToken = await getIdToken();
        } catch (e) {
          // Token error, continue without it for public actions
        }
      }
      
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, params, idToken })
      });
      
      if (!res.ok) throw new Error('HTTP ' + res.status);
      
      const result = await res.json();
      
      if (!result.success) {
        showToast(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
        return null;
      }
      
      return result.data;
      
    } catch (err) {
      console.error('API Error:', action, err);
      showToast('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง', 'error');
      return null;
    } finally {
      hideLoading();
    }
  },

  // ─────────────────────────────────────────────────────────────
  // USER FUNCTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Check if email exists and get user status
   */
  checkEmail: (email) => api.call('checkEmail', { email }),

  /**
   * Register new user
   */
  register: (params) => api.call('registerUser', params),

  /**
   * Get current user profile
   */
  getProfile: () => api.call('getUserProfile', {}),

  /**
   * Update user profile
   */
  updateProfile: (params) => api.call('updateProfile', params),

  /**
   * Mark onboarding as complete
   */
  completeOnboarding: () => api.call('completeOnboarding', {}),

  /**
   * Update last login timestamp
   */
  updateLastLogin: (email) => api.call('updateLastLogin', { email }),

  /**
   * Save user avatar
   */
  saveAvatar: (params) => api.call('saveAvatar', params),

  // ─────────────────────────────────────────────────────────────
  // REQUEST FUNCTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Submit new request
   */
  submitRequest: (params) => api.call('submitRequest', params),

  /**
   * Get user's requests
   */
  getMyRequests: () => api.call('getMyRequests', {}),

  /**
   * Get specific request by ID
   */
  getRequest: (id) => api.call('getRequestById', { requestId: id }),

  /**
   * Cancel request
   */
  cancelRequest: (id) => api.call('cancelRequest', { requestId: id }),

  /**
   * Save attachment file
   */
  saveAttachment: (params) => api.call('saveAttachment', params),

  /**
   * Delete attachment file
   */
  deleteAttachment: (params) => api.call('deleteAttachment', params),

  // ─────────────────────────────────────────────────────────────
  // NOTIFICATION FUNCTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Get user's notifications
   */
  getNotifications: () => api.call('getNotifications', {}),

  /**
   * Get unread notification count
   */
  getUnreadCount: () => api.call('getUnreadCount', {}),

  /**
   * Mark all notifications as read
   */
  markAllRead: () => api.call('markAllRead', {}),

  /**
   * Mark single notification as read
   */
  markOneRead: (id) => api.call('markOneRead', { notifId: id }),

  /**
   * Delete notification
   */
  deleteNotification: (id) => api.call('deleteNotification', { notifId: id }),

  // ─────────────────────────────────────────────────────────────
  // MASTER DATA & SETTINGS
  // ─────────────────────────────────────────────────────────────

  /**
   * Get master data by category (public, no auth required)
   */
  getMasterData: (category) => api.call('getMasterData', { category }),

  /**
   * Get all master data (admin only)
   */
  getMasterDataAll: () => api.call('getMasterDataAll', {}),

  /**
   * Get system settings (public)
   */
  getSettings: () => api.call('getSettings', {}),

  /**
   * Update system setting (admin only)
   */
  updateSetting: (params) => api.call('updateSetting', params),

  /**
   * Update master data (admin only)
   */
  updateMasterData: (params) => api.call('updateMasterData', params),

  // ─────────────────────────────────────────────────────────────
  // ADMIN: OVERVIEW
  // ─────────────────────────────────────────────────────────────

  /**
   * Get admin dashboard overview
   */
  getOverview: () => api.call('getAdminOverview', {}),

  // ─────────────────────────────────────────────────────────────
  // ADMIN: USER MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Get pending users awaiting approval
   */
  getPendingUsers: () => api.call('getPendingUsers', {}),

  /**
   * Get all users
   */
  getAllUsers: () => api.call('getAllUsers', {}),

  /**
   * Approve user
   */
  approveUser: (params) => api.call('approveUser', params),

  /**
   * Reject user
   */
  rejectUser: (params) => api.call('rejectUser', params),

  /**
   * Suspend user account
   */
  suspendUser: (params) => api.call('suspendUser', params),

  /**
   * Reinstate suspended user
   */
  reinstateUser: (params) => api.call('reinstateUser', params),

  /**
   * Delete user (soft delete)
   */
  deleteUser: (params) => api.call('deleteUser', params),

  /**
   * Change user role
   */
  changeRole: (params) => api.call('changeUserRole', params),

  // ─────────────────────────────────────────────────────────────
  // ADMIN: REQUEST MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Get all requests (with filters)
   */
  getAllRequests: (params) => api.call('getAllRequests', params),

  /**
   * Update request status
   */
  updateStatus: (params) => api.call('updateRequestStatus', params),

  // ─────────────────────────────────────────────────────────────
  // ADMIN: REPORTS & EXPORT
  // ─────────────────────────────────────────────────────────────

  /**
   * Get report data for date range
   */
  getReportData: (params) => api.call('getReportData', params),

  /**
   * Export request data to CSV
   */
  exportData: (params) => api.call('exportData', params),

  /**
   * Get audit log entries
   */
  getAuditLog: (params) => api.call('getAuditLog', params),

  // ─────────────────────────────────────────────────────────────
  // ADMIN: ANNOUNCEMENTS & ADMINS
  // ─────────────────────────────────────────────────────────────

  /**
   * Send announcement notification
   */
  sendAnnouncement: (params) => api.call('sendAnnouncement', params),

  /**
   * Get list of admins
   */
  getAdmins: () => api.call('getAdminList', {}),

  /**
   * Add new admin
   */
  addAdmin: (email) => api.call('addAdmin', { email }),

  /**
   * Remove admin
   */
  removeAdmin: (email) => api.call('removeAdmin', { email })
};

/**
 * Initialize API by checking if URL is configured
 */
function initializeAPI() {
  if (CONFIG.APPS_SCRIPT_URL === 'YOUR_DEPLOYED_WEB_APP_URL') {
    console.warn('⚠️ Apps Script URL not configured. Please update CONFIG.APPS_SCRIPT_URL');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAPI);
