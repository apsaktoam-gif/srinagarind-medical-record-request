// ═══════════════════════════════════════════════════════════════════
// Authentication Module
// ═══════════════════════════════════════════════════════════════════

// Initialize Firebase
firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = firebase.auth();

// Login attempt tracking for rate limiting
let loginAttempts = 0;
let loginLockTime = null;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if login is locked due to too many attempts
 */
function isLoginLocked() {
  const lockData = localStorage.getItem('loginLock');
  if (!lockData) return false;
  
  const { timestamp, attempts } = JSON.parse(lockData);
  const now = Date.now();
  
  if (now - timestamp > LOCK_DURATION_MS) {
    localStorage.removeItem('loginLock');
    return false;
  }
  
  return true;
}

/**
 * Get remaining lock time in minutes
 */
function getLoginLockRemainingTime() {
  const lockData = localStorage.getItem('loginLock');
  if (!lockData) return 0;
  
  const { timestamp } = JSON.parse(lockData);
  const elapsed = Date.now() - timestamp;
  const remaining = Math.ceil((LOCK_DURATION_MS - elapsed) / 60000);
  return Math.max(0, remaining);
}

/**
 * Record failed login attempt
 */
function recordFailedLoginAttempt() {
  let lockData = localStorage.getItem('loginLock');
  
  if (!lockData) {
    lockData = { timestamp: Date.now(), attempts: 1 };
  } else {
    lockData = JSON.parse(lockData);
    lockData.attempts++;
    
    if (lockData.attempts >= MAX_LOGIN_ATTEMPTS) {
      lockData.timestamp = Date.now();
    }
  }
  
  localStorage.setItem('loginLock', JSON.stringify(lockData));
}

/**
 * Clear login lock
 */
function clearLoginLock() {
  localStorage.removeItem('loginLock');
}

/**
 * Login with Google
 */
async function loginWithGoogle() {
  // Check if login is locked
  if (isLoginLocked()) {
    const remaining = getLoginLockRemainingTime();
    showToast(`บัญชีถูกล็อก กรุณาลองใหม่ใน ${remaining} นาที`, 'error');
    return;
  }

  showLoading();
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const email = user.email;
    
    // Validate email domain
    const domain = email.split('@')[1];
    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      await auth.signOut();
      showToast(`อีเมลนี้ไม่ได้รับอนุญาต (รับเฉพาะ @gmail.com และ @kku.ac.th)`, 'error');
      hideLoading();
      return;
    }
    
    // Clear login lock on successful login
    clearLoginLock();
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Check email status
    const result_check = await api.checkEmail(email);
    if (!result_check) {
      await auth.signOut();
      hideLoading();
      return;
    }
    
    // Update last login (fire-and-forget)
    api.updateLastLogin(email);
    
    // Route after login
    routeAfterLogin(result_check);
    
  } catch (error) {
    console.error('Login error:', error);
    recordFailedLoginAttempt();
    
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('ยกเลิกการเข้าสู่ระบบ', 'info');
    } else if (error.code === 'auth/popup-blocked') {
      showToast('ป๊อปอัปถูกบล็อก กรุณาอนุญาตป๊อปอัป', 'error');
    } else {
      showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่', 'error');
    }
  } finally {
    hideLoading();
  }
}

/**
 * Route user after successful login
 */
function routeAfterLogin(userStatus) {
  // User doesn't exist in system
  if (!userStatus.exists) {
    window.location.href = '/register.html';
    return;
  }
  
  // User pending approval
  if (userStatus.status === 'pending') {
    window.location.href = '/waiting.html';
    return;
  }
  
  // User rejected
  if (userStatus.status === 'rejected') {
    showRejectionMessage(userStatus.rejectionReason);
    auth.signOut();
    return;
  }
  
  // User suspended
  if (userStatus.status === 'suspended') {
    showToast('บัญชีของคุณถูกระงับ กรุณาติดต่อเจ้าหน้าที่', 'error');
    auth.signOut();
    return;
  }
  
  // User approved but profile incomplete
  if (userStatus.status === 'approved' && !userStatus.profileComplete) {
    window.location.href = '/profile-setup.html';
    return;
  }
  
  // User approved but onboarding incomplete
  if (userStatus.status === 'approved' && !userStatus.onboardingComplete) {
    window.location.href = '/onboarding.html';
    return;
  }
  
  // Admin or Staff
  if (userStatus.role === 'admin' || userStatus.role === 'staff') {
    window.location.href = '/admin/index.html';
    return;
  }
  
  // Regular user
  window.location.href = '/dashboard.html';
}

/**
 * Show rejection message
 */
function showRejectionMessage(reason) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h2 class="text-lg font-semibold text-red-600 mb-2">❌ ไม่สามารถเข้าสู่ระบบได้</h2>
      <p class="text-gray-600 mb-4">เหตุผล: ${reason || 'ยังไม่ได้รับการอนุมัติ'}</p>
      <p class="text-sm text-gray-500 mb-6">กรุณาติดต่อเจ้าหน้าที่งานเวชระเบียนเพื่อขอความช่วยเหลือ</p>
      <button class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" onclick="this.closest('.fixed').remove()">
        ปิด
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Require authentication
 * Call this on every protected page
 */
function requireAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = '/index.html';
    }
  });
}

/**
 * Require admin role
 */
async function requireAdmin() {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }
    
    const profile = await api.getProfile();
    if (!profile || profile.role !== 'admin') {
      window.location.href = '/dashboard.html';
    }
  });
}

/**
 * Require staff or admin role
 */
async function requireStaff() {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }
    
    const profile = await api.getProfile();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
      window.location.href = '/dashboard.html';
    }
  });
}

/**
 * Get current user's ID token
 */
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken(false);
}

/**
 * Auto refresh token every 55 minutes
 */
setInterval(async () => {
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }
}, 55 * 60 * 1000);

/**
 * Logout
 */
async function logout() {
  showLoading();
  try {
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    hideLoading();
  }
}

/**
 * Get current user email
 */
function getCurrentUserEmail() {
  const user = auth.currentUser;
  return user ? user.email : null;
}

/**
 * Get current user UID
 */
function getCurrentUserUID() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return auth.currentUser !== null;
}

/**
 * Get current user display name
 */
function getCurrentUserDisplayName() {
  return localStorage.getItem('userDisplayName') || 'ผู้ใช้';
}

/**
 * Get current user role
 */
function getCurrentUserRole() {
  return localStorage.getItem('userRole') || 'user';
}

/**
 * Get current user avatar URL
 */
function getCurrentUserAvatarUrl() {
  return localStorage.getItem('avatarUrl') || '';
}

/**
 * Update local user data
 */
function updateLocalUserData(userData) {
  if (userData.email) localStorage.setItem('userEmail', userData.email);
  if (userData.displayName) localStorage.setItem('userDisplayName', userData.displayName);
  if (userData.role) localStorage.setItem('userRole', userData.role);
  if (userData.avatarUrl) localStorage.setItem('avatarUrl', userData.avatarUrl);
  if (userData.uid) localStorage.setItem('userId', userData.uid);
}

/**
 * Clear local user data
 */
function clearLocalUserData() {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userDisplayName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('avatarUrl');
  localStorage.removeItem('userId');
}
