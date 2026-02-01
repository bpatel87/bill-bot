// DIY Negotiation Toolkit Interactive JavaScript

// Script Tab Management
function showScript(scriptType) {
    // Hide all scripts
    document.querySelectorAll('.script-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected script
    document.getElementById(`script-${scriptType}`).style.display = 'block';
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Email Template Modal
function showTemplate(templateType) {
    const templates = {
        initial: {
            subject: 'Medical Bill Inquiry - Account #[ACCOUNT NUMBER]',
            body: `Dear Billing Department,

I am writing regarding my medical bill for account #[ACCOUNT NUMBER] dated [DATE], with a balance of $[AMOUNT].

After reviewing the itemized charges, I have identified several items that appear to be significantly above standard market rates for these services. I am committed to paying a fair amount for the services I received and would like to work with you to resolve this matter.

Specifically, I have concerns about the following charges:
- [CHARGE 1]: $[AMOUNT] (Medicare rate: $[MEDICARE AMOUNT])
- [CHARGE 2]: $[AMOUNT] (Fair market price: $[FAIR AMOUNT])
- [CHARGE 3]: $[AMOUNT] (Markup: [PERCENTAGE]%)

I am prepared to discuss a reasonable settlement that reflects the actual value of services provided. Please contact me at [PHONE] or reply to this email so we can work together toward a fair resolution.

I appreciate your attention to this matter and look forward to resolving it promptly.

Sincerely,
[YOUR NAME]`
        },
        dispute: {
            subject: 'Formal Billing Dispute - Account #[ACCOUNT NUMBER]',
            body: `Dear Billing Department,

RE: Formal Dispute of Medical Charges - Account #[ACCOUNT NUMBER]

I am formally disputing the charges on the above-referenced account totaling $[AMOUNT]. After careful review and comparison with standard medical pricing, I have identified numerous overcharges that require immediate correction.

DISPUTED CHARGES:
1. Facility Fee - $847
   Medicare reimbursement: $200
   Overcharge: $647 (323%)

2. Medical Supplies - $[AMOUNT]
   Actual cost: $[COST]
   Overcharge: $[DIFFERENCE] ([PERCENTAGE]%)

3. Laboratory Processing - $[AMOUNT]
   Regional average: $[AVERAGE]
   Overcharge: $[DIFFERENCE] ([PERCENTAGE]%)

LEGAL BASIS FOR DISPUTE:
- These charges violate reasonable and customary pricing standards
- Similar services are reimbursed at significantly lower rates by Medicare and private insurers
- The charges appear to be balance billing attempts prohibited under [STATE] law

PROPOSED RESOLUTION:
Based on Medicare rates and fair market pricing, the reasonable value of services is $[FAIR TOTAL]. I am prepared to pay $[OFFER] to settle this account in full within 10 business days of written agreement.

ACTION REQUIRED:
Please respond within 15 business days with:
1. Corrected billing reflecting accurate charges
2. Acceptance of my settlement offer
3. Written confirmation that this resolves all charges

If this matter is not resolved satisfactorily, I will file complaints with:
- [STATE] Attorney General's Office
- [STATE] Department of Insurance
- Centers for Medicare & Medicaid Services
- Consumer Financial Protection Bureau

I am recording all communications regarding this matter and will pursue all available legal remedies if necessary.

Sincerely,
[YOUR NAME]
[DATE]

Attachments:
- Itemized bill
- Medicare pricing documentation
- Insurance EOB comparisons`
        },
        settlement: {
            subject: 'Settlement Offer - Account #[ACCOUNT NUMBER]',
            body: `Dear [BILLING MANAGER NAME],

Following our conversation on [DATE], I am submitting this formal settlement offer for account #[ACCOUNT NUMBER].

SETTLEMENT OFFER TERMS:
- Original balance: $[ORIGINAL AMOUNT]
- Settlement amount: $[OFFER AMOUNT]
- Payment method: [CHECK/CREDIT CARD/BANK TRANSFER]
- Payment date: Within [X] days of acceptance

CONDITIONS:
1. This payment settles all charges related to service date [DATE]
2. No additional bills or fees will be assessed
3. Account will be marked "Paid in Full"
4. No negative credit reporting
5. Written confirmation provided before payment

PAYMENT DETAILS:
Upon receipt of written acceptance of these terms, I will immediately submit payment of $[OFFER AMOUNT]. This represents a good-faith effort to resolve this matter while acknowledging the significant overcharges in the original bill.

TIME LIMITATION:
This offer is valid for 10 business days from the date of this letter. After this period, I reserve the right to pursue other remedies including regulatory complaints and legal action.

Please respond in writing to [EMAIL] or [PHONE].

Respectfully,
[YOUR NAME]`
        },
        escalation: {
            subject: 'Final Notice Before Regulatory Action - Account #[ACCOUNT NUMBER]',
            body: `Dear Hospital Administration,

This is my final attempt to resolve the billing dispute for account #[ACCOUNT NUMBER] before filing formal complaints with state and federal agencies.

SUMMARY OF DISPUTE:
- Original bill: $[AMOUNT]
- Documented overcharges: $[OVERCHARGE AMOUNT]
- Fair market value: $[FAIR AMOUNT]
- Previous attempts to resolve: [LIST DATES/METHODS]

IMMEDIATE ACTION REQUIRED:
I require a written response within 72 hours accepting one of the following:
1. Reduce bill to Medicare-comparable rate of $[MEDICARE AMOUNT]
2. Accept my settlement offer of $[OFFER AMOUNT]
3. Provide detailed justification for charges with supporting documentation

PENDING ACTIONS:
Without satisfactory resolution, I will immediately:
- File complaint with [STATE] Attorney General (draft attached)
- Report to [STATE] Department of Insurance
- Submit complaint to CFPB
- Post detailed reviews on Google, Yelp, and Healthgrades
- Contact local media consumer advocates
- Pursue legal action for violations of fair billing practices

DOCUMENTATION:
I have compiled a complete file including:
- All bills and correspondence
- Recorded phone calls (where legal)
- Medicare and insurance pricing comparisons
- Evidence of systematic overcharging

This matter could have been resolved simply. I remain willing to pay a fair amount for services received. However, I will not be victimized by predatory billing practices.

You have 72 hours to respond.

[YOUR NAME]
[DATE]

CC: [HOSPITAL CEO NAME]
     [STATE] Attorney General Consumer Division
     [LOCAL NEWS STATION] Consumer Reporter`
        }
    };
    
    const template = templates[templateType];
    if (!template) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'template-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${template.subject}</h3>
            <textarea class="template-text" rows="20">${template.body}</textarea>
            <div class="modal-actions">
                <button onclick="copyTemplate()" class="copy-btn">Copy to Clipboard</button>
                <button onclick="closeModal()" class="close-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .template-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 16px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-content h3 {
            margin-bottom: 20px;
        }
        .template-text {
            width: 100%;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            resize: vertical;
        }
        .modal-actions {
            margin-top: 20px;
            display: flex;
            gap: 16px;
        }
        .copy-btn, .close-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        .copy-btn {
            background: #007AFF;
            color: white;
            flex: 1;
        }
        .copy-btn:hover {
            background: #0051D5;
        }
        .close-btn {
            background: #f0f0f0;
            color: #333;
        }
    `;
    document.head.appendChild(style);
}

function copyTemplate() {
    const textarea = document.querySelector('.template-text');
    textarea.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#34C759';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#007AFF';
    }, 2000);
}

function closeModal() {
    const modal = document.querySelector('.template-modal');
    if (modal) modal.remove();
}

// Fair Price Calculator
function calculateFairPrice() {
    const desc = document.getElementById('charge-desc').value.toLowerCase();
    const amount = parseFloat(document.getElementById('charge-amount').value);
    
    if (!desc || !amount) {
        alert('Please enter both description and amount');
        return;
    }
    
    let fairPrice, medicarePrice, message;
    
    // Simple matching logic (in production, this would use a comprehensive database)
    if (desc.includes('facility')) {
        fairPrice = Math.min(amount * 0.24, 200);
        medicarePrice = 185;
        message = 'Facility fees are often completely negotiable or removable.';
    } else if (desc.includes('emergency') || desc.includes('er')) {
        fairPrice = amount * 0.25;
        medicarePrice = amount * 0.22;
        message = 'ER charges are frequently miscoded. Verify the level of service.';
    } else if (desc.includes('supplies') || desc.includes('bandage')) {
        fairPrice = amount * 0.05;
        medicarePrice = amount * 0.03;
        message = 'Supply charges have the highest markups - often 1000-2000%.';
    } else if (desc.includes('lab') || desc.includes('blood')) {
        fairPrice = amount * 0.30;
        medicarePrice = amount * 0.25;
        message = 'Lab work can often be done independently for 70-80% less.';
    } else if (desc.includes('scan') || desc.includes('mri') || desc.includes('ct')) {
        fairPrice = amount * 0.35;
        medicarePrice = amount * 0.28;
        message = 'Imaging has huge price variations. Shop around for better rates.';
    } else {
        fairPrice = amount * 0.40;
        medicarePrice = amount * 0.35;
        message = 'Standard markup detected. This charge is negotiable.';
    }
    
    const resultDiv = document.getElementById('fair-price-result');
    resultDiv.innerHTML = `
        <div style="color: #007AFF; font-weight: 600; margin-bottom: 8px;">Analysis Complete</div>
        <div>Charged: $${amount.toFixed(2)}</div>
        <div>Fair Price: $${fairPrice.toFixed(2)}</div>
        <div>Medicare Rate: $${medicarePrice.toFixed(2)}</div>
        <div style="color: #34C759; font-weight: 600; margin-top: 8px;">
            Potential Savings: $${(amount - fairPrice).toFixed(2)} (${((1 - fairPrice/amount) * 100).toFixed(0)}%)
        </div>
        <div style="margin-top: 12px; font-style: italic; color: #666;">${message}</div>
    `;
}

// Settlement Calculator
function calculateSettlement() {
    const total = parseFloat(document.getElementById('total-bill').value);
    
    if (!total) {
        alert('Please enter the total bill amount');
        return;
    }
    
    const aggressive = total * 0.25;
    const moderate = total * 0.35;
    const conservative = total * 0.45;
    
    const resultDiv = document.getElementById('settlement-result');
    resultDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
            <strong>Aggressive Offer (25%):</strong>
            <div style="color: #FF3B30;">$${aggressive.toFixed(2)}</div>
            <div style="font-size: 12px;">Best for: High overcharges, strong evidence</div>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>Moderate Offer (35%):</strong>
            <div style="color: #FF9500;">$${moderate.toFixed(2)}</div>
            <div style="font-size: 12px;">Best for: Standard negotiations</div>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>Conservative Offer (45%):</strong>
            <div style="color: #34C759;">$${conservative.toFixed(2)}</div>
            <div style="font-size: 12px;">Best for: Quick settlement</div>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
            <strong>Strategy:</strong> Start with aggressive, settle at moderate
        </div>
    `;
}

// Silence Timer for Negotiation Calls
let timerInterval;
function startSilenceTimer() {
    const display = document.getElementById('timer-display');
    const button = event.target;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        button.textContent = 'Start Power Pause';
        display.textContent = 'Use strategic silence';
        return;
    }
    
    button.textContent = 'Stop Timer';
    let seconds = 0;
    
    timerInterval = setInterval(() => {
        seconds++;
        
        if (seconds < 3) {
            display.textContent = `Keep quiet... ${seconds}s`;
            display.style.color = '#FF9500';
        } else if (seconds < 7) {
            display.textContent = `Good! Keep going... ${seconds}s`;
            display.style.color = '#007AFF';
        } else if (seconds < 10) {
            display.textContent = `Excellent! They're cracking... ${seconds}s`;
            display.style.color = '#34C759';
        } else {
            display.textContent = `POWER MOVE! ${seconds}s - They'll make an offer soon`;
            display.style.color = '#34C759';
            display.style.fontWeight = '700';
        }
        
        // Tips at certain intervals
        if (seconds === 5) {
            display.innerHTML += '<br><small>Tip: They hate silence more than you do</small>';
        } else if (seconds === 10) {
            display.innerHTML += '<br><small>Tip: First to speak loses leverage</small>';
        } else if (seconds === 15) {
            display.innerHTML += '<br><small>Tip: They're checking what they can do</small>';
        }
    }, 1000);
}

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});