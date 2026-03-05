// ═══════════════════════════════════════════════════════════════════
// Authentication Module
// ═══════════════════════════════════════════════════════════════════

// ย้ายตัวแปรตั้งค่าขึ้นมาด้านบนสุดเพื่อป้องกัน Error
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Initialize Firebase โดยอ้างอิงจาก window.CONFIG
firebase.initializeApp(CONFIG.firebaseConfig);
const auth = firebase.auth();

/**
 * ตรวจสอบว่าการเข้าสู่ระบบถูกระงับชั่วคราวหรือไม่
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
  
  return attempts >= MAX_LOGIN_ATTEMPTS;
}

/**
 * คำนวณเวลาที่เหลือของการล็อก (นาที)
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
 * บันทึกประวัติการเข้าสู่ระบบที่ล้มเหลว
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
 * ล้างสถานะการล็อก
 */
function clearLoginLock() {
  localStorage.removeItem('loginLock');
}

/**
 * เข้าสู่ระบบด้วย Google
 */
async function loginWithGoogle() {
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
    
    // ตรวจสอบ Domain ตามที่กำหนดไว้ใน CONFIG
    const domain = email.split('@')[1];
    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      await auth.signOut();
      showToast(`อีเมลนี้ไม่ได้รับอนุญาต (รับเฉพาะ @gmail.com และ @kku.ac.th)`, 'error');
      hideLoading();
      return;
    }
    
    clearLoginLock();
    
    // ตรวจสอบสถานะอีเมลผ่าน API
    const result_check = await api.checkEmail(email);
    if (!result_check) {
      await auth.signOut();
      hideLoading();
      return;
    }
    
    // อัปเดตเวลาเข้าใช้งานล่าสุด
    if (api.updateLastLogin) {
      api.updateLastLogin(email);
    }
    
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
 * จัดการเส้นทางหลังเข้าสู่ระบบสำเร็จ
 */
function routeAfterLogin(userStatus) {
  if (!userStatus.exists) {
    window.location.href = 'register.html';
    return;
  }
  
  if (userStatus.status === 'pending') {
    window.location.href = 'waiting.html';
    return;
  }
  
  if (userStatus.status === 'rejected') {
    showRejectionMessage(userStatus.rejectionReason);
    auth.signOut();
    return;
  }
  
  if (userStatus.status === 'suspended') {
    showToast('บัญชีของคุณถูกระงับ กรุณาติดต่อเจ้าหน้าที่', 'error');
    auth.signOut();
    return;
  }
  
  if (userStatus.status === 'approved' && !userStatus.profileComplete) {
    window.location.href = 'profile-setup.html';
    return;
  }
  
  if (userStatus.status === 'approved' && !userStatus.onboardingComplete) {
    window.location.href = 'onboarding.html';
    return;
  }
  
  if (userStatus.role === 'admin' || userStatus.role === 'staff') {
    window.location.href = 'admin/index.html';
    return;
  }
  
  window.location.href = 'dashboard.html';
}

/**
 * แสดงข้อความเมื่อบัญชีไม่ได้รับการอนุมัติ
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
 * บังคับให้ต้องล็อกอินก่อนเข้าถึงหน้าเพจ
 */
function requireAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
}

/**
 * บังคับสิทธิ์ Admin
 */
async function requireAdmin() {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    
    if (typeof api !== 'undefined' && api.getProfile) {
      const profile = await api.getProfile();
      if (!profile || profile.role !== 'admin') {
        window.location.href = 'dashboard.html';
      }
    }
  });
}

/**
 * บังคับสิทธิ์ Staff หรือ Admin
 */
async function requireStaff() {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    
    if (typeof api !== 'undefined' && api.getProfile) {
      const profile = await api.getProfile();
      if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
        window.location.href = 'dashboard.html';
      }
    }
  });
}

/**
 * ดึง ID Token ปัจจุบัน
 */
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken(true); // รีเฟรช Token เสมอเพื่อความปลอดภัย
}

/**
 * อัปเดต Token อัตโนมัติทุก 55 นาที
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
 * ออกจากระบบ
 */
async function logout() {
  showLoading();
  try {
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    hideLoading();
  }
}

// ─────────────────────────────────────────────────────────────
// ฟังก์ชันอำนวยความสะดวกในการจัดการข้อมูลผู้ใช้
// ─────────────────────────────────────────────────────────────

function getCurrentUserEmail() {
  const user = auth.currentUser;
  return user ? user.email : null;
}

function isAuthenticated() {
  return auth.currentUser !== null;
}

function updateLocalUserData(userData) {
  if (userData.email) localStorage.setItem('userEmail', userData.email);
  if (userData.displayName) localStorage.setItem('userDisplayName', userData.displayName);
  if (userData.role) localStorage.setItem('userRole', userData.role);
  if (userData.uid) localStorage.setItem('userId', userData.uid);
}
