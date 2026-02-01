/**
 * Letter Generator Service
 * Creates formal negotiation letters based on bill analysis
 */

class LetterGenerator {
    constructor() {
        this.templates = {
            opening: {
                financial_hardship: "I am writing to request a review and adjustment of my medical bill due to financial hardship.",
                fair_pricing: "I am writing to request a pricing review to ensure charges align with standard and reasonable rates.",
                insurance_comparable: "I am writing to request pricing comparable to what insurance companies pay for these services."
            },
            
            charge_disputes: {
                facility_fee: "The facility fee of $[AMOUNT] appears excessive for the service provided. Medicare typically reimburses $[FAIR_AMOUNT] for similar facility use.",
                supplies: "Generic supplies totaling $[AMOUNT] are marked up over [MARKUP]% from wholesale costs. Standard pricing would be approximately $[FAIR_AMOUNT].",
                medication: "[MEDICATION] was charged at $[AMOUNT] per dose, while the same medication costs $[FAIR_AMOUNT] at retail pharmacies.",
                emergency_level: "The Emergency Department Level [LEVEL] charge of $[AMOUNT] may be incorrectly coded. Based on the services provided, Level [CORRECT_LEVEL] at $[FAIR_AMOUNT] appears more appropriate."
            },
            
            closing: {
                payment_ready: "I am prepared to pay $[OFFER_AMOUNT] immediately upon acceptance of this adjusted amount.",
                payment_plan: "I can pay $[OFFER_AMOUNT] through a payment plan of $[MONTHLY] per month.",
                financial_review: "I have included financial documentation for your review and would appreciate consideration for your financial assistance program."
            }
        };
    }

    /**
     * Generate a complete negotiation letter
     * @param {Object} billData - Analyzed bill data
     * @param {Object} patientInfo - Patient information
     * @param {Object} options - Letter options (tone, strategy, etc.)
     * @returns {Object} Generated letter with HTML and plain text versions
     */
    generateLetter(billData, patientInfo, options = {}) {
        const strategy = options.strategy || 'fair_pricing';
        const paymentType = options.paymentType || 'payment_ready';
        
        // Calculate offer amount (typically 25-30% of original bill)
        const offerAmount = Math.round(billData.totalAmount * 0.28);
        const monthlyPayment = Math.round(offerAmount / 12);
        
        // Build letter sections
        const letter = {
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            patientInfo: patientInfo,
            hospitalInfo: billData.provider,
            accountNumber: billData.accountNumber,
            originalAmount: billData.totalAmount,
            offerAmount: offerAmount,
            sections: []
        };

        // Header
        letter.sections.push({
            type: 'header',
            content: this.generateHeader(letter)
        });

        // Opening
        letter.sections.push({
            type: 'opening',
            content: this.generateOpening(billData, strategy)
        });

        // Charge disputes
        letter.sections.push({
            type: 'disputes',
            content: this.generateDisputes(billData.flaggedCharges)
        });

        // Summary and offer
        letter.sections.push({
            type: 'offer',
            content: this.generateOffer(billData, offerAmount)
        });

        // Closing
        letter.sections.push({
            type: 'closing',
            content: this.generateClosing(paymentType, offerAmount, monthlyPayment)
        });

        // Convert to final formats
        return {
            html: this.toHTML(letter),
            text: this.toPlainText(letter),
            pdf: this.toPDFData(letter), // For future PDF generation
            metadata: {
                originalBill: billData.totalAmount,
                offerAmount: offerAmount,
                savings: billData.totalAmount - offerAmount,
                savingsPercent: Math.round((1 - offerAmount / billData.totalAmount) * 100)
            }
        };
    }

    generateHeader(letter) {
        return `
${letter.date}

${letter.patientInfo.name}
${letter.patientInfo.address || '[Patient Address]'}
${letter.patientInfo.city || '[City]'}, ${letter.patientInfo.state || '[State]'} ${letter.patientInfo.zip || '[ZIP]'}

${letter.hospitalInfo.name || '[Hospital Name]'}
Billing Department
${letter.hospitalInfo.address || '[Hospital Address]'}

Re: Medical Bill - Account #${letter.accountNumber}
    Original Amount: $${letter.originalAmount.toLocaleString()}
    Proposed Settlement: $${letter.offerAmount.toLocaleString()}
`;
    }

    generateOpening(billData, strategy) {
        let opening = this.templates.opening[strategy] || this.templates.opening.fair_pricing;
        
        opening += "\n\nI have carefully reviewed the itemized charges on my bill dated " + 
                   billData.billDate + " and identified several charges that appear to be significantly above standard rates. ";
        
        opening += "I am requesting a good-faith adjustment to align these charges with reasonable and customary rates.";
        
        return opening;
    }

    generateDisputes(flaggedCharges) {
        if (!flaggedCharges || flaggedCharges.length === 0) return '';
        
        let disputes = "Specific charges requiring review:\n\n";
        
        flaggedCharges.slice(0, 5).forEach(charge => {
            const template = this.getDisputeTemplate(charge.description);
            if (template) {
                disputes += "• " + this.fillTemplate(template, {
                    AMOUNT: charge.amount.toLocaleString(),
                    FAIR_AMOUNT: Math.round(charge.fairPrice).toLocaleString(),
                    MARKUP: Math.round((charge.amount / charge.fairPrice - 1) * 100),
                    MEDICATION: charge.description,
                    LEVEL: '5',
                    CORRECT_LEVEL: '3'
                }) + "\n\n";
            }
        });
        
        return disputes;
    }

    generateOffer(billData, offerAmount) {
        const totalFlagged = billData.flaggedCharges.reduce((sum, charge) => 
            sum + (charge.amount - charge.fairPrice), 0);
        
        let offer = `Based on my research of standard medical pricing and Medicare reimbursement rates, `;
        offer += `the identified overcharges total approximately $${Math.round(totalFlagged).toLocaleString()}. `;
        offer += `\n\nIn the interest of resolving this matter promptly and fairly, `;
        offer += `I am proposing a settlement amount of $${offerAmount.toLocaleString()}, `;
        offer += `which represents a ${Math.round((1 - offerAmount / billData.totalAmount) * 100)}% reduction from the original bill. `;
        offer += `This amount more accurately reflects the fair market value of the services provided.`;
        
        return offer;
    }

    generateClosing(paymentType, offerAmount, monthlyPayment) {
        let closing = this.templates.closing[paymentType];
        
        closing = this.fillTemplate(closing, {
            OFFER_AMOUNT: offerAmount.toLocaleString(),
            MONTHLY: monthlyPayment.toLocaleString()
        });
        
        closing += "\n\nI appreciate your understanding and look forward to resolving this matter. ";
        closing += "Please respond within 15 business days to avoid the need for further action, ";
        closing += "including potential complaints to the state insurance commissioner and consumer protection agencies.";
        
        closing += "\n\nSincerely,\n\n\n[Signature]\n";
        
        return closing;
    }

    getDisputeTemplate(description) {
        const desc = description.toLowerCase();
        if (desc.includes('facility')) return this.templates.charge_disputes.facility_fee;
        if (desc.includes('supplies')) return this.templates.charge_disputes.supplies;
        if (desc.includes('ibuprofen') || desc.includes('acetaminophen')) return this.templates.charge_disputes.medication;
        if (desc.includes('emergency')) return this.templates.charge_disputes.emergency_level;
        return this.templates.charge_disputes.supplies; // Default
    }

    fillTemplate(template, values) {
        return template.replace(/\[(\w+)\]/g, (match, key) => values[key] || match);
    }

    toHTML(letter) {
        let html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
            color: #333;
        }
        .header { 
            margin-bottom: 30px; 
            white-space: pre-line;
        }
        .section { 
            margin-bottom: 20px; 
        }
        .disputes {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .signature {
            margin-top: 60px;
        }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
`;
        
        letter.sections.forEach(section => {
            html += `<div class="section ${section.type}">`;
            html += section.content.replace(/\n/g, '<br>');
            html += '</div>';
        });
        
        html += '</body></html>';
        return html;
    }

    toPlainText(letter) {
        return letter.sections.map(section => section.content).join('\n\n');
    }

    toPDFData(letter) {
        // Placeholder for PDF generation
        // In production, use a library like jsPDF or Puppeteer
        return {
            content: this.toPlainText(letter),
            metadata: {
                title: `Medical Bill Negotiation - Account ${letter.accountNumber}`,
                subject: 'Settlement Offer',
                author: letter.patientInfo.name
            }
        };
    }
}

module.exports = LetterGenerator;