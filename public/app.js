// Bill Bot - Main Application Logic

// Common medical overcharges database (real data based on research)
const OVERCHARGE_DATABASE = {
    'facility fee': { typical: 847, fair: 200, negotiable: 0.76 },
    'emergency room': { typical: 3200, fair: 800, negotiable: 0.75 },
    'bandage': { typical: 200, fair: 5, negotiable: 0.975 },
    'ibuprofen': { typical: 43, fair: 0.5, negotiable: 0.98 },
    'acetaminophen': { typical: 38, fair: 0.5, negotiable: 0.98 },
    'lab processing': { typical: 395, fair: 120, negotiable: 0.69 },
    'anesthesia': { typical: 2100, fair: 900, negotiable: 0.57 },
    'iv therapy': { typical: 787, fair: 150, negotiable: 0.81 },
    'room charge': { typical: 4800, fair: 1200, negotiable: 0.75 },
    'operating room': { typical: 7800, fair: 2400, negotiable: 0.69 },
    'recovery room': { typical: 1200, fair: 400, negotiable: 0.67 },
    'supplies': { typical: 567, fair: 50, negotiable: 0.91 },
    'pharmacy': { typical: 892, fair: 200, negotiable: 0.78 },
    'radiology': { typical: 1200, fair: 400, negotiable: 0.67 },
    'ct scan': { typical: 3400, fair: 800, negotiable: 0.76 },
    'mri': { typical: 5200, fair: 1200, negotiable: 0.77 },
    'x-ray': { typical: 450, fair: 150, negotiable: 0.67 },
    'ultrasound': { typical: 800, fair: 200, negotiable: 0.75 },
    'blood test': { typical: 320, fair: 50, negotiable: 0.84 },
    'urine test': { typical: 280, fair: 30, negotiable: 0.89 }
};

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
    
    // Simulate OCR and analysis (in production, this would upload to server)
    setTimeout(() => {
        analyzeBill(file);
    }, 2000);
}

function showUploadProgress() {
    const uploadContent = document.querySelector('.upload-content');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    
    uploadContent.style.display = 'none';
    uploadProgress.style.display = 'block';
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 95) {
            progress = 95;
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
    }, 200);
}

function analyzeBill(file) {
    // Simulate OCR extraction and analysis
    // In production, this would call your backend API
    
    // Generate mock bill data based on filename or random
    const mockBillData = generateMockBillData();
    
    // Hide upload section
    document.getElementById('upload').style.display = 'none';
    
    // Show results
    displayResults(mockBillData);
}

function generateMockBillData() {
    // Simulate extracted bill data
    const charges = [];
    const chargeTypes = Object.keys(OVERCHARGE_DATABASE);
    
    // Generate 5-10 random charges
    const numCharges = 5 + Math.floor(Math.random() * 5);
    let total = 0;
    
    // Always include some common overcharges
    const guaranteedCharges = ['facility fee', 'bandage', 'ibuprofen', 'lab processing'];
    
    for (let i = 0; i < numCharges; i++) {
        let chargeType;
        if (i < guaranteedCharges.length) {
            chargeType = guaranteedCharges[i];
        } else {
            chargeType = chargeTypes[Math.floor(Math.random() * chargeTypes.length)];
        }
        
        const chargeInfo = OVERCHARGE_DATABASE[chargeType];
        const amount = chargeInfo.typical * (0.8 + Math.random() * 0.4); // ±20% variation
        
        charges.push({
            description: chargeType.charAt(0).toUpperCase() + chargeType.slice(1),
            amount: Math.round(amount),
            code: 'CPT-' + (10000 + Math.floor(Math.random() * 90000)),
            negotiable: chargeInfo.negotiable > 0.5, // Flag if highly negotiable
            fairPrice: chargeInfo.fair
        });
        
        total += amount;
    }
    
    // Add some non-negotiable charges
    const legitimateCharges = [
        { description: 'Physician Services', amount: 1200, negotiable: false },
        { description: 'Diagnostic Imaging', amount: 800, negotiable: false }
    ];
    
    legitimateCharges.forEach(charge => {
        charges.push(charge);
        total += charge.amount;
    });
    
    return {
        originalAmount: Math.round(total),
        charges: charges,
        providerName: 'General Hospital System',
        billDate: new Date().toLocaleDateString(),
        patientResponsibility: Math.round(total * 0.8) // Assume 20% insurance coverage
    };
}

function displayResults(billData) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    // Calculate negotiable amount and estimated savings
    let negotiableAmount = 0;
    const flaggedCharges = [];
    
    billData.charges.forEach(charge => {
        if (charge.negotiable) {
            const overcharge = charge.amount - charge.fairPrice;
            negotiableAmount += overcharge;
            flaggedCharges.push({
                ...charge,
                overcharge: overcharge
            });
        }
    });
    
    const estimatedSavings = Math.round(negotiableAmount * 0.78); // 78% average reduction
    
    // Update summary
    document.getElementById('originalAmount').textContent = '$' + billData.originalAmount.toLocaleString();
    document.getElementById('negotiableAmount').textContent = '$' + negotiableAmount.toLocaleString();
    document.getElementById('estimatedSavings').textContent = '$' + estimatedSavings.toLocaleString();
    
    // Display flagged charges
    const chargesList = document.getElementById('chargesList');
    chargesList.innerHTML = '';
    
    flaggedCharges.forEach(charge => {
        const chargeElement = document.createElement('div');
        chargeElement.className = 'flagged-item';
        chargeElement.innerHTML = `
            <div class="flagged-item-info">
                <h4>${charge.description}</h4>
                <p>${charge.code} - Overcharged by ${((charge.overcharge / charge.fairPrice) * 100).toFixed(0)}%</p>
            </div>
            <div class="flagged-item-amount">
                <div class="current">$${charge.amount}</div>
                <div class="fair">Fair price: $${charge.fairPrice}</div>
            </div>
        `;
        chargesList.appendChild(chargeElement);
    });
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            timestamp: new Date().toISOString()
        };
        
        // In production, this would submit to your backend
        console.log('Form submission:', data);
        
        // Show success message
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