// Bill Bot - Enhanced Application with Better Error Handling

// Smooth scroll function
function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Initialize upload area
document.addEventListener('DOMContentLoaded', () => {
    setupUploadArea();
    setupContactForm();
});

function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        uploadArea.classList.remove('drag-over');
    }
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-content')) {
            fileInput.click();
        }
    });
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0]; // Handle first file only
    
    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        alert('Please upload a PDF or image file (JPG, PNG, HEIC)');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
    }
    
    // Show progress
    showUploadProgress();
    
    // Process with better error handling
    processWithOCR(file);
}

function showUploadProgress() {
    const uploadContent = document.querySelector('.upload-content');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.querySelector('.progress-text');
    
    uploadContent.style.display = 'none';
    uploadProgress.style.display = 'block';
    
    // Reset progress
    progressFill.style.width = '0%';
    progressText.textContent = 'Analyzing your bill...';
    
    // Animate progress bar smoothly
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 85) {
            progress = 85; // Stay at 85% until actual completion
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
    }, 300);
    
    return interval;
}

async function processWithOCR(file) {
    const formData = new FormData();
    formData.append('bill', file);
    
    // Add timeout to prevent infinite loading
    const timeout = 15000; // 15 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch('/api/process-bill', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Complete progress bar
            const progressFill = document.getElementById('progressFill');
            const progressText = document.querySelector('.progress-text');
            progressFill.style.width = '100%';
            progressText.textContent = 'Analysis complete!';
            
            // Hide upload section and show results
            setTimeout(() => {
                document.getElementById('upload').style.display = 'none';
                displayEnhancedResults(result);
            }, 500);
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        
        if (error.name === 'AbortError') {
            handleError('Analysis is taking longer than expected. Please try again.');
        } else if (error.message.includes('Failed to fetch')) {
            handleError('Unable to connect to the server. Please check your connection.');
        } else {
            handleError('Unable to analyze your bill. Please try again or use our sample bill.');
        }
    }
}

function handleError(message) {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressText = document.querySelector('.progress-text');
    
    // Show error message
    progressText.innerHTML = `
        <span style="color: #FF3B30;">${message}</span><br>
        <button onclick="resetUploadArea()" style="margin-top: 16px; padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Try Again
        </button>
        <button onclick="useSampleBill()" style="margin-left: 8px; padding: 8px 16px; background: #34C759; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Use Sample Bill
        </button>
    `;
}

function resetUploadArea() {
    const uploadContent = document.querySelector('.upload-content');
    const uploadProgress = document.getElementById('uploadProgress');
    
    uploadContent.style.display = 'block';
    uploadProgress.style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
}

function useSampleBill() {
    // Create a mock file and process it
    const mockFile = new File(['sample'], 'sample-medical-bill.pdf', { type: 'application/pdf' });
    
    // Reset UI first
    resetUploadArea();
    
    // Process the sample
    setTimeout(() => {
        handleFiles([mockFile]);
    }, 100);
}

function displayEnhancedResults(data) {
    const resultsSection = document.getElementById('results');
    
    // Create formatted charges list
    const chargesHTML = data.charges.map(charge => `
        <div class="flagged-item">
            <div class="flagged-item-info">
                <h4>${charge.description}</h4>
                <p>${charge.flagReason}</p>
            </div>
            <div class="flagged-item-amount">
                <div class="current">$${charge.amount.toFixed(2)}</div>
                <div class="fair">Fair price: $${Math.round(charge.estimatedFairPrice || charge.fairPrice)}</div>
            </div>
        </div>
    `).join('');
    
    // Update the results section with letter generation UI
    resultsSection.innerHTML = `
        <div class="container">
            <div class="results-container">
                <h2 class="results-title">Bill Analysis Complete</h2>
                
                <div class="bill-summary">
                    <div class="summary-row">
                        <span>Original Bill</span>
                        <span class="amount">$${data.billAnalysis.originalAmount.toLocaleString()}</span>
                    </div>
                    <div class="summary-row">
                        <span>Negotiable Charges Found</span>
                        <span class="amount negotiable">${data.billAnalysis.negotiableCharges}</span>
                    </div>
                    <div class="summary-row estimated">
                        <span>Estimated Savings</span>
                        <span class="amount savings">$${data.billAnalysis.estimatedSavings.toLocaleString()} (${data.billAnalysis.savingsPercent}%)</span>
                    </div>
                </div>
                
                <div class="flagged-charges" id="flaggedCharges">
                    <h3>Flagged Overcharges</h3>
                    <div id="chargesList">${chargesHTML}</div>
                </div>
                
                <div class="letter-section">
                    <h3>Your Negotiation Letter</h3>
                    <p>We've prepared a professional negotiation letter based on your bill analysis.</p>
                    
                    <div class="letter-preview" id="letterPreview">
                        ${data.letter.html}
                    </div>
                    
                    <div class="letter-actions">
                        <button onclick="downloadLetter(\`${escapeString(data.letter.text)}\`)" class="download-button">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2V12M10 12L7 9M10 12L13 9M3 17H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Download Letter
                        </button>
                        <button onclick="copyLetter(\`${escapeString(data.letter.text)}\`)" class="copy-button">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="4" y="4" width="10" height="14" stroke="currentColor" stroke-width="2" rx="2"/>
                                <path d="M8 4V2C8 1.44772 8.44772 1 9 1H17C17.5523 1 18 1.44772 18 2V12C18 12.5523 17.5523 13 17 13H14" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>Ready to Send?</h3>
                    <p>Enter your details to finalize the letter and get guidance on next steps.</p>
                    
                    <form class="contact-form" id="enhancedContactForm">
                        <input type="text" name="name" placeholder="Your full name" required>
                        <input type="email" name="email" placeholder="Email address" required>
                        <input type="tel" name="phone" placeholder="Phone number" required>
                        <div class="address-group">
                            <input type="text" name="address" placeholder="Street address" required>
                            <div class="city-state-zip">
                                <input type="text" name="city" placeholder="City" required>
                                <input type="text" name="state" placeholder="State" maxlength="2" required>
                                <input type="text" name="zip" placeholder="ZIP" required>
                            </div>
                        </div>
                        <button type="submit" class="submit-button">Get Personalized Letter</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Show results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Setup the enhanced form
    setupEnhancedForm(data);
}

// Escape string for safe inclusion in template literal
function escapeString(str) {
    return str.replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$/g, '\\$');
}

function downloadLetter(text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-bill-negotiation-letter-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function copyLetter(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const button = event.target.closest('.copy-button');
        const originalText = button.innerHTML;
        button.innerHTML = '✓ Copied!';
        button.style.background = '#34C759';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy. Please try downloading instead.');
    });
}

function setupEnhancedForm(billData) {
    const form = document.getElementById('enhancedContactForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const patientInfo = Object.fromEntries(formData);
        
        // Show success message
        form.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="margin-bottom: 20px;">
                    <circle cx="30" cy="30" r="28" stroke="#34C759" stroke-width="4"/>
                    <path d="M20 30L26 36L40 22" stroke="#34C759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3 style="color: #34C759; margin-bottom: 12px;">Letter Personalized!</h3>
                <p>Your negotiation letter has been updated with your information.</p>
                <p style="margin-top: 20px; font-weight: 600;">Next Steps:</p>
                <ol style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li>Print or email the letter to the hospital billing department</li>
                    <li>Send via certified mail for best results</li>
                    <li>Follow up in 7-10 business days if no response</li>
                    <li>Keep all documentation for your records</li>
                </ol>
                <div style="margin-top: 32px;">
                    <a href="toolkit.html" style="display: inline-block; padding: 12px 24px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        Get Phone Scripts & More Tips
                    </a>
                </div>
            </div>
        `;
    });
}

// Original functions remain for compatibility
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('Form submission:', data);
        
        form.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="margin-bottom: 20px;">
                    <circle cx="30" cy="30" r="28" stroke="#34C759" stroke-width="4"/>
                    <path d="M20 30L26 36L40 22" stroke="#34C759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3 style="color: #34C759; margin-bottom: 12px;">Success!</h3>
                <p>We'll contact you within 24 hours to start your negotiation.</p>
            </div>
        `;
    });
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});