// ═══════════════════════════════════════════════════════════════════
// File Upload Module
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert file to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file
 */
function validateFile(file, type) {
  const limits = {
    avatar: { 
      maxMB: 2, 
      types: ['image/jpeg', 'image/png'] 
    },
    attachment: { 
      maxMB: CONFIG.MAX_FILE_SIZE_MB, 
      types: ['application/pdf', 'image/jpeg', 'image/png'] 
    }
  };

  const rule = limits[type];
  if (!rule) throw new Error('ประเภทไฟล์ไม่ถูกต้อง');

  if (!rule.types.includes(file.type)) {
    throw new Error('ประเภทไฟล์ไม่รองรับ (รับเฉพาะ PDF, JPG, PNG)');
  }

  if (file.size > rule.maxMB * 1024 * 1024) {
    throw new Error(`ขนาดไฟล์เกิน ${rule.maxMB}MB`);
  }

  return true;
}

/**
 * Upload avatar image
 */
async function uploadAvatar(file) {
  try {
    validateFile(file, 'avatar');
    showLoading();
    
    const base64Data = await fileToBase64(file);
    const result = await api.saveAvatar({
      base64Data: base64Data,
      mimeType: file.type
    });
    
    if (result) {
      showToast('อัปโหลดรูปโปรไฟล์สำเร็จ', 'success');
      return result;
    }
    return null;
    
  } catch (error) {
    showToast(error.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    return null;
  } finally {
    hideLoading();
  }
}

/**
 * Upload single attachment
 */
async function uploadAttachment(file, requestId) {
  try {
    validateFile(file, 'attachment');
    
    const tempId = 'temp_' + Date.now();
    showUploadProgress(file.name, 0);
    
    const base64Data = await fileToBase64(file);
    showUploadProgress(file.name, 50);
    
    const result = await api.saveAttachment({
      base64Data: base64Data,
      mimeType: file.type,
      fileName: file.name,
      requestId: requestId || tempId
    });
    
    showUploadProgress(file.name, 100);
    
    if (result) {
      return result; // { fileId, fileName, fileUrl }
    }
    return null;
    
  } catch (error) {
    showToast(error.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    return null;
  }
}

/**
 * Upload multiple attachments
 */
async function uploadMultipleFiles(files, requestId) {
  try {
    if (files.length > CONFIG.MAX_FILES) {
      throw new Error(`ไฟล์เกินจำนวนสูงสุด ${CONFIG.MAX_FILES} ไฟล์`);
    }

    const results = [];
    for (const file of files) {
      const result = await uploadAttachment(file, requestId);
      if (result) {
        results.push(result);
      }
    }

    return results;
    
  } catch (error) {
    showToast(error.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    return [];
  }
}

/**
 * Show upload progress
 */
function showUploadProgress(fileName, percent) {
  const sanitized = sanitizeFileName(fileName);
  const progressEl = document.getElementById(`progress-${sanitized}`);
  
  if (progressEl) {
    const progressBar = progressEl.querySelector('.progress-bar');
    const progressText = progressEl.querySelector('.progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${percent}%`;
    }
  }
}

/**
 * Create file tag element
 */
function createFileTag(fileResult, onRemove) {
  const div = document.createElement('div');
  div.className = 'flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2';
  div.dataset.fileId = fileResult.fileId;
  
  div.innerHTML = `
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <span class="text-blue-600">📎</span>
      <a href="${fileResult.fileUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 underline truncate">
        ${fileResult.fileName}
      </a>
    </div>
    <button type="button" class="ml-2 text-red-500 hover:text-red-700 flex-shrink-0" onclick="this.parentElement.remove(); if (typeof onRemove === 'function') onRemove('${fileResult.fileId}')">
      ✕
    </button>
  `;
  
  return div;
}

/**
 * Setup drag and drop zone
 */
function setupDropzone(dropzoneEl, inputEl, onFilesSelected) {
  if (!dropzoneEl || !inputEl) return;

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, () => {
      dropzoneEl.classList.add('border-blue-500', 'bg-blue-50');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, () => {
      dropzoneEl.classList.remove('border-blue-500', 'bg-blue-50');
    }, false);
  });

  // Handle dropped files
  dropzoneEl.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    onFilesSelected(files);
  }, false);

  // Handle file input change
  inputEl.addEventListener('change', (e) => {
    onFilesSelected(e.target.files);
  }, false);

  // Handle click on dropzone
  dropzoneEl.addEventListener('click', () => {
    inputEl.click();
  });
}

/**
 * Get file extension
 */
function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}

/**
 * Get file icon based on type
 */
function getFileIcon(fileName) {
  const ext = getFileExtension(fileName);
  
  const icons = {
    pdf: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊'
  };
  
  return icons[ext] || '📎';
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create upload progress element
 */
function createUploadProgressElement(fileName) {
  const sanitized = sanitizeFileName(fileName);
  const div = document.createElement('div');
  div.id = `progress-${sanitized}`;
  div.className = 'mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200';
  div.innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <span class="text-sm text-gray-700">📎 ${fileName}</span>
      <span class="progress-text text-xs text-gray-500">0%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="progress-bar bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
    </div>
  `;
  return div;
}

/**
 * Remove upload progress element
 */
function removeUploadProgressElement(fileName) {
  const sanitized = sanitizeFileName(fileName);
  const progressEl = document.getElementById(`progress-${sanitized}`);
  if (progressEl) {
    progressEl.remove();
  }
}

/**
 * Validate multiple files before upload
 */
function validateMultipleFiles(files) {
  const errors = [];
  
  if (files.length > CONFIG.MAX_FILES) {
    errors.push(`ไฟล์เกินจำนวนสูงสุด ${CONFIG.MAX_FILES} ไฟล์`);
  }
  
  for (const file of files) {
    try {
      validateFile(file, 'attachment');
    } catch (error) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }
  
  return errors;
}

/**
 * Check if file is image
 */
function isImageFile(file) {
  return file.type.startsWith('image/');
}

/**
 * Check if file is PDF
 */
function isPDFFile(file) {
  return file.type === 'application/pdf';
}

/**
 * Create image preview
 */
function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'max-w-xs max-h-64 rounded-lg border border-gray-200';
      resolve(img);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
