// ═══════════════════════════════════════════════════════════════════
// Google Apps Script Backend - Medical Record Request System
// Deploy as Web App: Execute as Me, Anyone can access
// ═══════════════════════════════════════════════════════════════════

const SHEET_ID = 'YOUR_SPREADSHEET_ID';
const AVATAR_FOLDER_ID = '1Axnx09iCKEAdvcjhJUpHvoZaAC4ilLUW';
const ATTACHMENT_FOLDER_ID = '1NX2itRouL3v84lwDW5RKmfCvpQrMwJ6D';

const SEED_ADMINS = ['toam2532@gmail.com', 'ritttu@kku.ac.th'];
const ALLOWED_DOMAINS = ['gmail.com', 'kku.ac.th'];

// ─────────────────────────────────────────────────────────────────
// ROUTING & REQUEST HANDLING
// ─────────────────────────────────────────────────────────────────

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doGet(e) {
  return handleRequest(e, 'GET');
}

function handleRequest(e, method) {
  try {
    const body = e.postData?.contents || '';
    const { action, params, idToken } = JSON.parse(body);
    
    // Public actions (no auth required)
    const publicActions = ['checkEmail', 'getMasterData', 'getSettings'];
    
    // Verify token for protected actions
    let email = null;
    if (!publicActions.includes(action)) {
      const tokenData = verifyGoogleToken(idToken);
      if (!tokenData) {
        return sendResponse(false, 'Invalid or expired token');
      }
      email = tokenData.email;
    }
    
    // Route by action
    let result;
    switch (action) {
      // User functions
      case 'checkEmail':
        result = checkEmail(params);
        break;
      case 'registerUser':
        result = registerUser(params, email);
        break;
      case 'getUserProfile':
        result = getUserProfile(email);
        break;
      case 'updateProfile':
        result = updateProfile(params, email);
        break;
      case 'completeOnboarding':
        result = completeOnboarding(email);
        break;
      case 'updateLastLogin':
        result = updateLastLogin(params.email);
        break;
      case 'saveAvatar':
        result = saveAvatar(params, email);
        break;
      
      // Request functions
      case 'submitRequest':
        result = submitRequest(params, email);
        break;
      case 'getMyRequests':
        result = getMyRequests(email);
        break;
      case 'getRequestById':
        result = getRequestById(params.requestId, email);
        break;
      case 'cancelRequest':
        result = cancelRequest(params.requestId, email);
        break;
      case 'saveAttachment':
        result = saveAttachment(params, email);
        break;
      case 'deleteAttachment':
        result = deleteAttachment(params, email);
        break;
      
      // Notification functions
      case 'getNotifications':
        result = getNotifications(email);
        break;
      case 'getUnreadCount':
        result = getUnreadCount(email);
        break;
      case 'markAllRead':
        result = markAllRead(email);
        break;
      case 'markOneRead':
        result = markOneRead(params.notifId, email);
        break;
      case 'deleteNotification':
        result = deleteNotification(params.notifId, email);
        break;
      
      // Master data & settings
      case 'getMasterData':
        result = getMasterData(params.category);
        break;
      case 'getMasterDataAll':
        result = getMasterDataAll(email);
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'updateSetting':
        result = updateSetting(params, email);
        break;
      case 'updateMasterData':
        result = updateMasterData(params, email);
        break;
      
      // Admin functions
      case 'getAdminOverview':
        result = getAdminOverview(email);
        break;
      case 'getPendingUsers':
        result = getPendingUsers(email);
        break;
      case 'getAllUsers':
        result = getAllUsers(email);
        break;
      case 'approveUser':
        result = approveUser(params, email);
        break;
      case 'rejectUser':
        result = rejectUser(params, email);
        break;
      case 'suspendUser':
        result = suspendUser(params, email);
        break;
      case 'reinstateUser':
        result = reinstateUser(params, email);
        break;
      case 'deleteUser':
        result = deleteUser(params, email);
        break;
      case 'changeUserRole':
        result = changeUserRole(params, email);
        break;
      case 'getAllRequests':
        result = getAllRequests(params, email);
        break;
      case 'updateRequestStatus':
        result = updateRequestStatus(params, email);
        break;
      case 'getReportData':
        result = getReportData(params, email);
        break;
      case 'exportData':
        result = exportData(params, email);
        break;
      case 'getAuditLog':
        result = getAuditLog(params, email);
        break;
      case 'sendAnnouncement':
        result = sendAnnouncement(params, email);
        break;
      case 'getAdminList':
        result = getAdminList(email);
        break;
      case 'addAdmin':
        result = addAdmin(params, email);
        break;
      case 'removeAdmin':
        result = removeAdmin(params, email);
        break;
      
      default:
        return sendResponse(false, 'Unknown action: ' + action);
    }
    
    return sendResponse(true, result);
  } catch (error) {
    console.error('Error:', error);
    return sendResponse(false, error.message);
  }
}

function sendResponse(success, data) {
  const response = {
    success: success,
    data: success ? data : null,
    error: success ? null : data
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────
// AUTHENTICATION & VERIFICATION
// ─────────────────────────────────────────────────────────────────

function verifyGoogleToken(idToken) {
  if (!idToken) return null;
  
  try {
    const response = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken,
      { muteHttpExceptions: true }
    );
    
    if (response.getResponseCode() !== 200) return null;
    
    const tokenData = JSON.parse(response.getContentText());
    
    // Verify email is verified
    if (!tokenData.email_verified) return null;
    
    // Verify domain
    const domain = tokenData.email.split('@')[1];
    if (!ALLOWED_DOMAINS.includes(domain)) return null;
    
    return {
      email: tokenData.email,
      name: tokenData.name,
      uid: tokenData.sub
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

function isAdmin(email) {
  const admins = getSheet('Admins');
  const data = admins.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) return true;
  }
  return false;
}

function isStaffOrAdmin(email) {
  const user = findUserByEmail(email);
  return user && (user.role === 'staff' || user.role === 'admin');
}

// ─────────────────────────────────────────────────────────────────
// SHEET UTILITIES
// ─────────────────────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(name);
}

function appendRow(sheetName, values) {
  const sheet = getSheet(sheetName);
  sheet.appendRow(values);
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  return sheet.getDataRange().getValues();
}

function findRowByValue(sheetName, columnIndex, value) {
  const data = getSheetData(sheetName);
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] === value) {
      return { row: i + 1, data: data[i] };
    }
  }
  return null;
}

function updateCell(sheetName, row, col, value) {
  const sheet = getSheet(sheetName);
  sheet.getRange(row, col).setValue(value);
}

// ─────────────────────────────────────────────────────────────────
// USER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function checkEmail(params) {
  const email = params.email;
  const user = findUserByEmail(email);
  
  if (!user) {
    return {
      exists: false,
      status: null,
      role: null,
      profileComplete: false,
      onboardingComplete: false
    };
  }
  
  return {
    exists: true,
    status: user.status,
    role: user.role,
    profileComplete: user.profileComplete === true || user.profileComplete === 'TRUE',
    onboardingComplete: user.onboardingComplete === true || user.onboardingComplete === 'TRUE',
    rejectionReason: user.rejectionReason || ''
  };
}

function findUserByEmail(email) {
  const data = getSheetData('Users');
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return {
        uid: data[i][0],
        email: data[i][1],
        displayName: data[i][2],
        firstName: data[i][3],
        lastName: data[i][4],
        occupation: data[i][5],
        position: data[i][6],
        department: data[i][7],
        phone: data[i][8],
        avatarUrl: data[i][9],
        status: data[i][10],
        role: data[i][11],
        rejectionReason: data[i][12],
        profileComplete: data[i][13],
        onboardingComplete: data[i][14],
        createdAt: data[i][15],
        approvedAt: data[i][16],
        approvedBy: data[i][17],
        lastLoginAt: data[i][18],
        suspendedAt: data[i][19],
        suspendedBy: data[i][20],
        notes: data[i][21]
      };
    }
  }
  return null;
}

function registerUser(params, email) {
  const uid = Utilities.getUuid();
  const now = new Date().toISOString();
  
  // Check if admin
  const isAdminUser = SEED_ADMINS.includes(email);
  const status = isAdminUser ? 'approved' : 'pending';
  const role = isAdminUser ? 'admin' : 'user';
  
  const values = [
    uid,
    email,
    params.firstName + ' ' + params.lastName,
    params.firstName,
    params.lastName,
    params.occupation || '',
    params.position || '',
    params.department || '',
    params.phone || '',
    '', // avatarUrl
    status,
    role,
    '', // rejectionReason
    false, // profileComplete
    false, // onboardingComplete
    now,
    isAdminUser ? now : '', // approvedAt
    isAdminUser ? 'System' : '', // approvedBy
    now, // lastLoginAt
    '', // suspendedAt
    '', // suspendedBy
    '' // notes
  ];
  
  appendRow('Users', values);
  
  // Create notification for admins
  if (!isAdminUser) {
    const admins = getAdminEmails();
    for (const adminEmail of admins) {
      createNotification(adminEmail, 'new_user_pending', {
        title: '📋 ผู้ใช้ใหม่รออนุมัติ: ' + params.firstName,
        body: email + ' | ' + params.department,
        linkUrl: '/admin/users.html'
      });
    }
  }
  
  appendAuditLog(email, 'REGISTER_USER', uid, email);
  
  return { success: true, uid };
}

function getUserProfile(email) {
  return findUserByEmail(email);
}

function updateProfile(params, email) {
  const user = findUserByEmail(email);
  if (!user) return { success: false, error: 'User not found' };
  
  const sheet = getSheet('Users');
  const data = getSheetData('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      // Update profile fields
      sheet.getRange(i + 1, 3).setValue(params.firstName + ' ' + params.lastName);
      sheet.getRange(i + 1, 4).setValue(params.firstName);
      sheet.getRange(i + 1, 5).setValue(params.lastName);
      sheet.getRange(i + 1, 6).setValue(params.occupation || '');
      sheet.getRange(i + 1, 7).setValue(params.position || '');
      sheet.getRange(i + 1, 8).setValue(params.department || '');
      sheet.getRange(i + 1, 9).setValue(params.phone || '');
      sheet.getRange(i + 1, 14).setValue(true); // profileComplete
      
      appendAuditLog(email, 'UPDATE_PROFILE', user.uid, '');
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function completeOnboarding(email) {
  const user = findUserByEmail(email);
  if (!user) return { success: false };
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      sheet.getRange(i + 1, 15).setValue(true); // onboardingComplete
      appendAuditLog(email, 'COMPLETE_ONBOARDING', user.uid, '');
      return { success: true };
    }
  }
  
  return { success: false };
}

function updateLastLogin(params) {
  const email = params.email;
  const user = findUserByEmail(email);
  if (!user) return { success: false };
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      sheet.getRange(i + 1, 19).setValue(now);
      return { success: true };
    }
  }
  
  return { success: false };
}

function saveAvatar(params, email) {
  try {
    const user = findUserByEmail(email);
    if (!user) return { success: false, error: 'User not found' };
    
    // Delete old avatar
    deleteOldAvatar(user.uid);
    
    // Create new avatar
    const base64Data = params.base64Data;
    const mimeType = params.mimeType || 'image/jpeg';
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, 'avatar_' + user.uid + '.jpg');
    
    const folder = DriveApp.getFolderById(AVATAR_FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    // Update user record
    const data = getSheetData('Users');
    const sheet = getSheet('Users');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        sheet.getRange(i + 1, 10).setValue(fileUrl);
        break;
      }
    }
    
    appendAuditLog(email, 'UPLOAD_AVATAR', file.getId(), '');
    
    return { success: true, fileUrl, fileId: file.getId() };
  } catch (error) {
    console.error('Avatar save error:', error);
    return { success: false, error: error.message };
  }
}

function deleteOldAvatar(uid) {
  try {
    const folder = DriveApp.getFolderById(AVATAR_FOLDER_ID);
    const files = folder.getFilesByName('avatar_' + uid + '.jpg');
    while (files.hasNext()) {
      files.next().setTrashed(true);
    }
  } catch (error) {
    console.error('Delete avatar error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────
// REQUEST FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function submitRequest(params, email) {
  try {
    const user = findUserByEmail(email);
    if (!user) return { success: false, error: 'User not found' };
    
    // Validate patients
    if (!params.patients || params.patients.length === 0) {
      return { success: false, error: 'ต้องมีผู้ป่วยอย่างน้อย 1 ราย' };
    }
    
    const settings = getSettingsMap();
    if (params.patients.length > parseInt(settings.max_patients || 20)) {
      return { success: false, error: 'จำนวนผู้ป่วยเกินสูงสุด' };
    }
    
    // Validate documents
    if (!params.requestedDocs || params.requestedDocs.length === 0) {
      return { success: false, error: 'ต้องเลือกเอกสารอย่างน้อย 1 รายการ' };
    }
    
    // Generate request ID
    const requestId = generateRequestId();
    const now = new Date().toISOString();
    
    // Calculate SLA deadline
    const slaDeadline = calculateSLADeadline(params.urgency || 'normal');
    
    // Prepare request data
    const values = [
      requestId,
      params.requestType, // IPD or OPD
      user.uid,
      email,
      user.displayName,
      user.occupation,
      user.department,
      user.phone,
      JSON.stringify(params.patients),
      JSON.stringify(params.requestedDocs),
      params.additionalNote || '',
      params.purpose || '',
      params.purposeDetail || '',
      params.relationship || '',
      params.relationshipDetail || '',
      params.deliveryFormat || 'digital',
      params.urgency || 'normal',
      params.urgencyReason || '',
      JSON.stringify(params.attachmentUrls || []),
      JSON.stringify(params.attachmentLabels || []),
      true, // pdpaConsented
      now, // pdpaConsentedAt
      'รอดำเนินการ', // status
      slaDeadline,
      '', // staffNote
      '', // resultUrl
      '', // resultLabel
      '', // rejectionReason
      now, // createdAt
      now, // updatedAt
      '' // processedBy
    ];
    
    appendRow('Requests', values);
    
    // Create status history
    appendStatusHistory(requestId, 'รอดำเนินการ', email, '');
    
    // Create audit log
    appendAuditLog(email, 'SUBMIT_REQUEST', requestId, params.requestType);
    
    // Create notifications
    createNotification(email, 'request_received', {
      title: 'รับคำร้อง ' + requestId + ' แล้ว',
      body: 'ประเภท ' + params.requestType + ' จำนวน ' + params.patients.length + ' HN กำหนดเสร็จ ' + formatThaiDate(slaDeadline),
      linkUrl: '/request-detail.html?id=' + requestId,
      requestId: requestId
    });
    
    const admins = getAdminEmails();
    for (const adminEmail of admins) {
      createNotification(adminEmail, 'new_request_alert', {
        title: '⚡ คำร้องใหม่ ' + requestId + ' [' + (params.urgency === 'urgent' ? 'เร่งด่วน' : 'ปกติ') + ']',
        body: user.displayName + ' ยื่น' + params.requestType + ' จำนวน ' + params.patients.length + ' HN',
        linkUrl: '/admin/requests.html',
        requestId: requestId
      });
    }
    
    return { success: true, requestId, slaDeadline };
  } catch (error) {
    console.error('Submit request error:', error);
    return { success: false, error: error.message };
  }
}

function getMyRequests(email) {
  const data = getSheetData('Requests');
  const requests = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === email) {
      requests.push(formatRequestRow(data[i]));
    }
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getRequestById(requestId, email) {
  const data = getSheetData('Requests');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      const request = formatRequestRow(data[i]);
      
      // Check access
      if (request.requesterEmail !== email && !isStaffOrAdmin(email)) {
        return null;
      }
      
      return request;
    }
  }
  
  return null;
}

function cancelRequest(requestId, email) {
  const request = getRequestById(requestId, email);
  if (!request) return { success: false, error: 'Request not found' };
  
  if (request.requesterEmail !== email) {
    return { success: false, error: 'Permission denied' };
  }
  
  if (request.status !== 'รอดำเนินการ') {
    return { success: false, error: 'Cannot cancel request in this status' };
  }
  
  const data = getSheetData('Requests');
  const sheet = getSheet('Requests');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      sheet.getRange(i + 1, 23).setValue('ยกเลิก');
      sheet.getRange(i + 1, 29).setValue(new Date().toISOString());
      break;
    }
  }
  
  appendStatusHistory(requestId, 'ยกเลิก', email, '');
  appendAuditLog(email, 'CANCEL_REQUEST', requestId, '');
  
  // Notify admins
  const admins = getAdminEmails();
  for (const adminEmail of admins) {
    createNotification(adminEmail, 'request_cancelled', {
      title: '🚫 ' + requestId + ' ถูกยกเลิกโดยผู้ยื่น',
      body: request.requesterName,
      linkUrl: '/admin/requests.html',
      requestId: requestId
    });
  }
  
  return { success: true };
}

function formatRequestRow(row) {
  return {
    requestId: row[0],
    requestType: row[1],
    requesterUid: row[2],
    requesterEmail: row[3],
    requesterName: row[4],
    requesterOccupation: row[5],
    requesterDepartment: row[6],
    requesterPhone: row[7],
    patients: safeParseJSON(row[8], []),
    requestedDocs: safeParseJSON(row[9], []),
    additionalNote: row[10],
    purpose: row[11],
    purposeDetail: row[12],
    relationship: row[13],
    relationshipDetail: row[14],
    deliveryFormat: row[15],
    urgency: row[16],
    urgencyReason: row[17],
    attachmentUrls: safeParseJSON(row[18], []),
    attachmentLabels: safeParseJSON(row[19], []),
    pdpaConsented: row[20],
    pdpaConsentedAt: row[21],
    status: row[22],
    slaDeadline: row[23],
    staffNote: row[24],
    resultUrl: row[25],
    resultLabel: row[26],
    rejectionReason: row[27],
    createdAt: row[28],
    updatedAt: row[29],
    processedBy: row[30]
  };
}

function saveAttachment(params, email) {
  try {
    const base64Data = params.base64Data;
    const mimeType = params.mimeType;
    const fileName = params.fileName;
    const requestId = params.requestId;
    
    // Validate file
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mimeType)) {
      return { success: false, error: 'File type not allowed' };
    }
    
    const settings = getSettingsMap();
    const maxMB = parseInt(settings.max_file_mb || 10);
    const base64Length = base64Data.length;
    const fileSizeMB = (base64Length * 0.75) / (1024 * 1024);
    
    if (fileSizeMB > maxMB) {
      return { success: false, error: 'File size exceeds limit' };
    }
    
    // Create file
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
    
    // Create subfolder for request
    let requestFolder;
    const parentFolder = DriveApp.getFolderById(ATTACHMENT_FOLDER_ID);
    const folders = parentFolder.getFoldersByName(requestId);
    
    if (folders.hasNext()) {
      requestFolder = folders.next();
    } else {
      requestFolder = parentFolder.createFolder(requestId);
    }
    
    const file = requestFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';
    
    appendAuditLog(email, 'UPLOAD_ATTACH', file.getId(), fileName);
    
    return { success: true, fileId: file.getId(), fileName, fileUrl };
  } catch (error) {
    console.error('Attachment save error:', error);
    return { success: false, error: error.message };
  }
}

function deleteAttachment(params, email) {
  try {
    const fileId = params.fileId;
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    
    appendAuditLog(email, 'DELETE_ATTACH', fileId, '');
    return { success: true };
  } catch (error) {
    console.error('Delete attachment error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────
// NOTIFICATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function getNotifications(email) {
  const data = getSheetData('Notifications');
  const notifications = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && data[i][13] !== true) { // isDeleted
      notifications.push({
        notifId: data[i][0],
        recipientEmail: data[i][1],
        senderName: data[i][2],
        type: data[i][3],
        title: data[i][4],
        body: data[i][5],
        linkUrl: data[i][6],
        requestId: data[i][7],
        actionUrl: data[i][8],
        actionLabel: data[i][9],
        isRead: data[i][10],
        readAt: data[i][11],
        createdAt: data[i][12]
      });
    }
  }
  
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUnreadCount(email) {
  const data = getSheetData('Notifications');
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && !data[i][10] && data[i][13] !== true) {
      count++;
    }
  }
  
  return { count };
}

function markAllRead(email) {
  const data = getSheetData('Notifications');
  const sheet = getSheet('Notifications');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && !data[i][10]) {
      sheet.getRange(i + 1, 11).setValue(true);
      sheet.getRange(i + 1, 12).setValue(now);
    }
  }
  
  return { success: true };
}

function markOneRead(notifId, email) {
  const data = getSheetData('Notifications');
  const sheet = getSheet('Notifications');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === notifId && data[i][1] === email) {
      sheet.getRange(i + 1, 11).setValue(true);
      sheet.getRange(i + 1, 12).setValue(now);
      return { success: true };
    }
  }
  
  return { success: false };
}

function deleteNotification(notifId, email) {
  const data = getSheetData('Notifications');
  const sheet = getSheet('Notifications');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === notifId && data[i][1] === email) {
      sheet.getRange(i + 1, 14).setValue(true); // isDeleted
      return { success: true };
    }
  }
  
  return { success: false };
}

function createNotification(recipientEmail, type, options) {
  const notifId = 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();
  
  const values = [
    notifId,
    recipientEmail,
    options.senderName || 'ระบบ',
    type,
    options.title || '',
    options.body || '',
    options.linkUrl || '',
    options.requestId || '',
    options.actionUrl || '',
    options.actionLabel || '',
    false, // isRead
    '', // readAt
    now, // createdAt
    false // isDeleted
  ];
  
  appendRow('Notifications', values);
}

// ─────────────────────────────────────────────────────────────────
// MASTER DATA & SETTINGS
// ─────────────────────────────────────────────────────────────────

function getMasterData(params) {
  const category = params.category;
  const data = getSheetData('MasterData');
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === category && data[i][4] === true) {
      result.push({
        value: data[i][1],
        labelTH: data[i][2],
        sortOrder: data[i][3]
      });
    }
  }
  
  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

function getMasterDataAll(email) {
  if (!isAdmin(email)) return null;
  return getSheetData('MasterData');
}

function getSettings() {
  return getSettingsMap();
}

function getSettingsMap() {
  const data = getSheetData('Settings');
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  
  return settings;
}

function updateSetting(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const data = getSheetData('Settings');
  const sheet = getSheet('Settings');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.key) {
      sheet.getRange(i + 1, 2).setValue(params.value);
      sheet.getRange(i + 1, 4).setValue(now);
      sheet.getRange(i + 1, 5).setValue(email);
      
      appendAuditLog(email, 'UPDATE_SETTING', params.key, params.value);
      return { success: true };
    }
  }
  
  return { success: false, error: 'Setting not found' };
}

function updateMasterData(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  // CRUD operations for master data
  // Implementation depends on specific operation
  appendAuditLog(email, 'UPDATE_MASTER_DATA', params.category, '');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────
// ADMIN FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function getAdminOverview(email) {
  if (!isStaffOrAdmin(email)) return null;
  
  const users = getSheetData('Users');
  const requests = getSheetData('Requests');
  const now = new Date();
  
  // Count users
  let totalUsers = 0;
  let pendingUsers = 0;
  for (let i = 1; i < users.length; i++) {
    if (users[i][10] !== 'deleted') {
      totalUsers++;
      if (users[i][10] === 'pending') pendingUsers++;
    }
  }
  
  // Count requests
  let todayRequests = 0;
  let waitingRequests = 0;
  let overSLARequests = 0;
  let urgentRequests = 0;
  
  for (let i = 1; i < requests.length; i++) {
    const createdDate = new Date(requests[i][28]);
    const isToday = createdDate.toDateString() === now.toDateString();
    
    if (isToday) todayRequests++;
    if (requests[i][22] === 'รอดำเนินการ') waitingRequests++;
    if (requests[i][16] === 'urgent') urgentRequests++;
    
    const slaDate = new Date(requests[i][23]);
    if (slaDate < now && requests[i][22] !== 'เสร็จสิ้น' && requests[i][22] !== 'ปฏิเสธ') {
      overSLARequests++;
    }
  }
  
  return {
    totalUsers,
    pendingUsers,
    todayRequests,
    waitingRequests,
    urgentRequests,
    overSLARequests
  };
}

function getPendingUsers(email) {
  if (!isAdmin(email)) return null;
  
  const data = getSheetData('Users');
  const pending = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][10] === 'pending') {
      pending.push(formatUserRow(data[i], i + 1));
    }
  }
  
  return pending;
}

function getAllUsers(email) {
  if (!isAdmin(email)) return null;
  
  const data = getSheetData('Users');
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][10] !== 'deleted') {
      users.push(formatUserRow(data[i], i + 1));
    }
  }
  
  return users;
}

function formatUserRow(row, rowNum) {
  return {
    uid: row[0],
    email: row[1],
    displayName: row[2],
    firstName: row[3],
    lastName: row[4],
    occupation: row[5],
    position: row[6],
    department: row[7],
    phone: row[8],
    avatarUrl: row[9],
    status: row[10],
    role: row[11],
    lastLoginAt: row[18],
    createdAt: row[15],
    rowNum: rowNum
  };
}

function approveUser(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  const newRole = params.role || 'user';
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 11).setValue('approved');
      sheet.getRange(i + 1, 12).setValue(newRole);
      sheet.getRange(i + 1, 17).setValue(now);
      sheet.getRange(i + 1, 18).setValue(email);
      
      appendAuditLog(email, 'APPROVE_USER', data[i][0], targetEmail);
      
      createNotification(targetEmail, 'user_approved', {
        title: '✅ บัญชีของท่านได้รับการอนุมัติแล้ว',
        body: 'ยินดีต้อนรับสู่ระบบเวชระเบียนศรีนครินทร์',
        linkUrl: '/dashboard.html'
      });
      
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function rejectUser(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  const reason = params.reason || '';
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 11).setValue('rejected');
      sheet.getRange(i + 1, 13).setValue(reason);
      
      appendAuditLog(email, 'REJECT_USER', data[i][0], targetEmail);
      
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function suspendUser(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 11).setValue('suspended');
      sheet.getRange(i + 1, 20).setValue(now);
      sheet.getRange(i + 1, 21).setValue(email);
      
      appendAuditLog(email, 'SUSPEND_USER', data[i][0], targetEmail);
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function reinstateUser(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 11).setValue('approved');
      sheet.getRange(i + 1, 20).setValue('');
      sheet.getRange(i + 1, 21).setValue('');
      
      appendAuditLog(email, 'REINSTATE_USER', data[i][0], targetEmail);
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function deleteUser(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 11).setValue('deleted');
      
      appendAuditLog(email, 'DELETE_USER', data[i][0], targetEmail);
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function changeUserRole(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  const newRole = params.role;
  
  const data = getSheetData('Users');
  const sheet = getSheet('Users');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetEmail) {
      sheet.getRange(i + 1, 12).setValue(newRole);
      
      appendAuditLog(email, 'CHANGE_ROLE', data[i][0], newRole);
      return { success: true };
    }
  }
  
  return { success: false, error: 'User not found' };
}

function getAllRequests(params, email) {
  if (!isStaffOrAdmin(email)) return null;
  
  const data = getSheetData('Requests');
  const requests = [];
  
  for (let i = 1; i < data.length; i++) {
    const req = formatRequestRow(data[i]);
    
    // Apply filters
    if (params.status && req.status !== params.status) continue;
    if (params.requestType && req.requestType !== params.requestType) continue;
    if (params.urgency && req.urgency !== params.urgency) continue;
    
    requests.push(req);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateRequestStatus(params, email) {
  if (!isStaffOrAdmin(email)) return { success: false, error: 'Staff only' };
  
  const requestId = params.requestId;
  const newStatus = params.status;
  
  const data = getSheetData('Requests');
  const sheet = getSheet('Requests');
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      sheet.getRange(i + 1, 23).setValue(newStatus);
      sheet.getRange(i + 1, 25).setValue(params.staffNote || '');
      sheet.getRange(i + 1, 26).setValue(params.resultUrl || '');
      sheet.getRange(i + 1, 27).setValue(params.resultLabel || '');
      sheet.getRange(i + 1, 28).setValue(params.rejectionReason || '');
      sheet.getRange(i + 1, 30).setValue(now);
      sheet.getRange(i + 1, 31).setValue(email);
      
      appendStatusHistory(requestId, newStatus, email, params.staffNote || '');
      appendAuditLog(email, 'UPDATE_STATUS', requestId, newStatus);
      
      // Create notification
      const request = formatRequestRow(data[i]);
      let notifType = 'status_update';
      let notifTitle = 'คำร้อง ' + requestId + ': ' + newStatus;
      
      if (newStatus === 'เสร็จสิ้น' && params.resultUrl) {
        notifType = 'result_ready';
        notifTitle = '✅ ' + requestId + ' ข้อมูลของท่านพร้อมแล้ว';
      } else if (newStatus === 'ปฏิเสธ') {
        notifType = 'request_rejected';
        notifTitle = '❌ ' + requestId + ' ไม่สามารถดำเนินการได้';
      }
      
      createNotification(request.requesterEmail, notifType, {
        title: notifTitle,
        body: params.staffNote || '',
        linkUrl: '/request-detail.html?id=' + requestId,
        requestId: requestId,
        actionUrl: params.resultUrl,
        actionLabel: params.resultLabel
      });
      
      return { success: true };
    }
  }
  
  return { success: false, error: 'Request not found' };
}

function getReportData(params, email) {
  if (!isStaffOrAdmin(email)) return null;
  
  const data = getSheetData('Requests');
  const dateFrom = new Date(params.dateFrom);
  const dateTo = new Date(params.dateTo);
  
  const monthlyCounts = {};
  const statusDistribution = {};
  const purposeCounts = {};
  let onTimeCount = 0;
  let totalCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const createdDate = new Date(data[i][28]);
    
    if (createdDate >= dateFrom && createdDate <= dateTo) {
      totalCount++;
      
      // Monthly counts
      const month = createdDate.toISOString().substring(0, 7);
      if (!monthlyCounts[month]) monthlyCounts[month] = { ipd: 0, opd: 0 };
      if (data[i][1] === 'IPD') monthlyCounts[month].ipd++;
      else monthlyCounts[month].opd++;
      
      // Status distribution
      const status = data[i][22];
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      
      // Purpose counts
      const purpose = data[i][11];
      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
      
      // SLA check
      const slaDate = new Date(data[i][23]);
      if (slaDate >= createdDate) onTimeCount++;
    }
  }
  
  return {
    monthlyCounts: Object.entries(monthlyCounts).map(([month, counts]) => ({ month, ...counts })),
    statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({ status, count })),
    purposeCounts: Object.entries(purposeCounts).map(([purpose, count]) => ({ purpose, count })),
    kpi: {
      total: totalCount,
      onTimePercent: totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 0
    }
  };
}

function exportData(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const data = getSheetData('Requests');
  const dateFrom = new Date(params.dateFrom);
  const dateTo = new Date(params.dateTo);
  
  const exported = [];
  
  for (let i = 1; i < data.length; i++) {
    const createdDate = new Date(data[i][28]);
    if (createdDate >= dateFrom && createdDate <= dateTo) {
      exported.push(formatRequestRow(data[i]));
    }
  }
  
  appendAuditLog(email, 'EXPORT_DATA', '', params.dateFrom + '~' + params.dateTo);
  
  return exported;
}

function getAuditLog(params, email) {
  if (!isAdmin(email)) return null;
  
  const data = getSheetData('AuditLog');
  const dateFrom = new Date(params.dateFrom);
  const dateTo = new Date(params.dateTo);
  
  const logs = [];
  
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    
    if (timestamp >= dateFrom && timestamp <= dateTo) {
      if (!params.userEmail || data[i][1] === params.userEmail) {
        if (!params.action || data[i][2] === params.action) {
          logs.push({
            timestamp: data[i][0],
            userEmail: data[i][1],
            action: data[i][2],
            targetId: data[i][3],
            detail: data[i][4]
          });
        }
      }
    }
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function sendAnnouncement(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  let recipients = [];
  
  if (params.target === 'single') {
    recipients = [params.email];
  } else if (params.target === 'request') {
    const req = getRequestById(params.requestId, email);
    if (req) recipients = [req.requesterEmail];
  } else if (params.target === 'all_users') {
    const data = getSheetData('Users');
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === 'user' && data[i][10] === 'approved') {
        recipients.push(data[i][1]);
      }
    }
  } else if (params.target === 'all_staff') {
    const data = getSheetData('Users');
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === 'staff' && data[i][10] === 'approved') {
        recipients.push(data[i][1]);
      }
    }
  } else if (params.target === 'everyone') {
    const data = getSheetData('Users');
    for (let i = 1; i < data.length; i++) {
      if (data[i][10] === 'approved') {
        recipients.push(data[i][1]);
      }
    }
  }
  
  for (const recipient of recipients) {
    createNotification(recipient, 'announcement', {
      title: params.title,
      body: params.body,
      linkUrl: params.linkUrl || '',
      actionUrl: params.actionUrl || '',
      actionLabel: params.actionLabel || ''
    });
  }
  
  appendAuditLog(email, 'SEND_ANNOUNCEMENT', '', params.title);
  
  return { success: true, count: recipients.length };
}

function getAdminList(email) {
  if (!isAdmin(email)) return null;
  
  const data = getSheetData('Admins');
  const admins = [];
  
  for (let i = 1; i < data.length; i++) {
    admins.push({
      email: data[i][0],
      addedAt: data[i][1],
      addedBy: data[i][2]
    });
  }
  
  return admins;
}

function addAdmin(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const newAdminEmail = params.email;
  
  // Check if already admin
  const admins = getAdminList(email);
  if (admins.some(a => a.email === newAdminEmail)) {
    return { success: false, error: 'Already an admin' };
  }
  
  const now = new Date().toISOString();
  appendRow('Admins', [newAdminEmail, now, email]);
  
  appendAuditLog(email, 'ADD_ADMIN', newAdminEmail, '');
  
  return { success: true };
}

function removeAdmin(params, email) {
  if (!isAdmin(email)) return { success: false, error: 'Admin only' };
  
  const targetEmail = params.email;
  
  if (targetEmail === email) {
    return { success: false, error: 'Cannot remove yourself' };
  }
  
  const data = getSheetData('Admins');
  const sheet = getSheet('Admins');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === targetEmail) {
      sheet.deleteRow(i + 1);
      appendAuditLog(email, 'REMOVE_ADMIN', targetEmail, '');
      return { success: true };
    }
  }
  
  return { success: false, error: 'Admin not found' };
}

// ─────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function generateRequestId() {
  const counters = getSheet('Counters');
  const data = counters.getDataRange().getValues();
  
  let currentCounter = 0;
  let counterRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'requestCounter') {
      currentCounter = parseInt(data[i][1]) || 0;
      counterRow = i + 1;
      break;
    }
  }
  
  currentCounter++;
  
  if (counterRow > 0) {
    counters.getRange(counterRow, 2).setValue(currentCounter);
  }
  
  const buddhistYear = new Date().getFullYear() + 543;
  const requestId = 'REQ-' + buddhistYear + '-' + String(currentCounter).padStart(4, '0');
  
  return requestId;
}

function calculateSLADeadline(urgency) {
  const settings = getSettingsMap();
  const days = urgency === 'urgent' 
    ? parseInt(settings.sla_urgent_days || 1)
    : parseInt(settings.sla_normal_days || 3);
  
  let deadline = new Date();
  let daysAdded = 0;
  
  while (daysAdded < days) {
    deadline.setDate(deadline.getDate() + 1);
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return deadline.toISOString().split('T')[0];
}

function appendStatusHistory(requestId, status, changedBy, note) {
  const now = new Date().toISOString();
  appendRow('StatusHistory', [requestId, status, changedBy, now, note]);
}

function appendAuditLog(userEmail, action, targetId, detail) {
  const now = new Date().toISOString();
  appendRow('AuditLog', [now, userEmail, action, targetId, detail]);
}

function getAdminEmails() {
  const data = getSheetData('Admins');
  const emails = [];
  
  for (let i = 1; i < data.length; i++) {
    emails.push(data[i][0]);
  }
  
  return emails;
}

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function formatThaiDate(isoString) {
  const date = new Date(isoString);
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  return day + ' ' + month + ' ' + year;
}
