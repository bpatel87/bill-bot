const Tesseract = require('tesseract.js');

/**
 * OCR Service for extracting text from medical bills
 * Uses Tesseract.js with custom medical billing configurations
 */

class OCRService {
    constructor() {
        this.worker = null;
        this.initialized = false;
    }

    /**
     * Initialize Tesseract worker
     */
    async initialize() {
        if (this.initialized) return;
        
        this.worker = await Tesseract.createWorker({
            logger: m => console.log(m), // Optional: log progress
        });
        
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
        
        // Configure for medical bill recognition
        await this.worker.setParameters({
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz $.,/-():',
            preserve_interword_spaces: '1',
        });
        
        this.initialized = true;
    }

    /**
     * Extract text from image or PDF
     * @param {Buffer|String} input - Image buffer or file path
     * @returns {Object} Extracted bill data
     */
    async extractBillData(input) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Perform OCR
            const { data: { text } } = await this.worker.recognize(input);
            
            // Parse the extracted text
            const billData = this.parseBillText(text);
            
            return {
                success: true,
                data: billData,
                rawText: text
            };
        } catch (error) {
            console.error('OCR Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse extracted text into structured bill data
     * @param {String} text - Raw OCR text
     * @returns {Object} Structured bill data
     */
    parseBillText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const billData = {
            provider: '',
            patientName: '',
            accountNumber: '',
            billDate: '',
            totalAmount: 0,
            charges: [],
            insurance: {
                paid: 0,
                adjustments: 0,
                patientResponsibility: 0
            }
        };

        // Patterns for common medical bill elements
        const patterns = {
            provider: /(?:hospital|medical center|clinic|health system)[\s:]*([^\n]+)/i,
            accountNumber: /(?:account|acct)[\s#:]*([A-Z0-9\-]+)/i,
            date: /(?:date|service date|bill date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            total: /(?:total|balance due|amount due)[\s:$]*([0-9,]+\.?\d*)/i,
            charge: /([A-Z\s\-]+?)\s+(?:CPT:|Code:)?\s*([0-9A-Z\-]+)?\s*\$?([0-9,]+\.?\d{2})/g
        };

        // Extract provider name
        const providerMatch = text.match(patterns.provider);
        if (providerMatch) {
            billData.provider = providerMatch[1].trim();
        }

        // Extract account number
        const accountMatch = text.match(patterns.accountNumber);
        if (accountMatch) {
            billData.accountNumber = accountMatch[1].trim();
        }

        // Extract date
        const dateMatch = text.match(patterns.date);
        if (dateMatch) {
            billData.billDate = dateMatch[1];
        }

        // Extract total amount
        const totalMatch = text.match(patterns.total);
        if (totalMatch) {
            billData.totalAmount = this.parseAmount(totalMatch[1]);
        }

        // Extract individual charges
        billData.charges = this.extractCharges(text);

        // Identify common overcharges
        billData.flaggedCharges = this.flagOvercharges(billData.charges);

        return billData;
    }

    /**
     * Extract individual line item charges
     * @param {String} text - Bill text
     * @returns {Array} Array of charge objects
     */
    extractCharges(text) {
        const charges = [];
        const lines = text.split('\n');
        
        // Common charge patterns in medical bills
        const chargePatterns = [
            // Pattern: Description ... $Amount
            /^(.+?)\s+\$([0-9,]+\.?\d{2})$/,
            // Pattern: Description Code Amount
            /^(.+?)\s+([A-Z0-9]{5})\s+\$?([0-9,]+\.?\d{2})$/,
            // Pattern: Code Description Amount
            /^([A-Z0-9]{5})\s+(.+?)\s+\$?([0-9,]+\.?\d{2})$/
        ];

        lines.forEach(line => {
            for (const pattern of chargePatterns) {
                const match = line.match(pattern);
                if (match) {
                    const charge = {
                        description: '',
                        code: '',
                        amount: 0
                    };

                    if (match.length === 3) {
                        // Description and amount only
                        charge.description = this.cleanDescription(match[1]);
                        charge.amount = this.parseAmount(match[2]);
                    } else if (match.length === 4) {
                        // Includes code
                        if (match[1].match(/^[A-Z0-9]{5}$/)) {
                            charge.code = match[1];
                            charge.description = this.cleanDescription(match[2]);
                            charge.amount = this.parseAmount(match[3]);
                        } else {
                            charge.description = this.cleanDescription(match[1]);
                            charge.code = match[2];
                            charge.amount = this.parseAmount(match[3]);
                        }
                    }

                    if (charge.amount > 0) {
                        charges.push(charge);
                    }
                    break;
                }
            }
        });

        return charges;
    }

    /**
     * Flag potential overcharges based on known patterns
     * @param {Array} charges - Array of charge objects
     * @returns {Array} Flagged charges with negotiation potential
     */
    flagOvercharges(charges) {
        const flagged = [];
        const overchargeKeywords = [
            { keyword: 'facility fee', avgOvercharge: 0.76 },
            { keyword: 'room charge', avgOvercharge: 0.75 },
            { keyword: 'bandage', avgOvercharge: 0.97 },
            { keyword: 'ibuprofen', avgOvercharge: 0.98 },
            { keyword: 'acetaminophen', avgOvercharge: 0.98 },
            { keyword: 'tylenol', avgOvercharge: 0.98 },
            { keyword: 'aspirin', avgOvercharge: 0.95 },
            { keyword: 'supplies', avgOvercharge: 0.80 },
            { keyword: 'pharmacy', avgOvercharge: 0.70 },
            { keyword: 'lab', avgOvercharge: 0.65 },
            { keyword: 'emergency', avgOvercharge: 0.75 }
        ];

        charges.forEach(charge => {
            const desc = charge.description.toLowerCase();
            
            overchargeKeywords.forEach(({ keyword, avgOvercharge }) => {
                if (desc.includes(keyword)) {
                    flagged.push({
                        ...charge,
                        flagReason: `Common overcharge: ${keyword}`,
                        negotiationPotential: avgOvercharge,
                        estimatedFairPrice: charge.amount * (1 - avgOvercharge)
                    });
                }
            });

            // Flag high-dollar generic charges
            if (charge.amount > 500 && desc.match(/misc|other|general|supplies/i)) {
                flagged.push({
                    ...charge,
                    flagReason: 'Vague high-value charge',
                    negotiationPotential: 0.70,
                    estimatedFairPrice: charge.amount * 0.30
                });
            }
        });

        return flagged;
    }

    /**
     * Clean and normalize charge descriptions
     * @param {String} description - Raw description
     * @returns {String} Cleaned description
     */
    cleanDescription(description) {
        return description
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^a-zA-Z0-9\s\-\/]/g, '')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Parse amount string to number
     * @param {String} amountStr - Amount string (may include commas, $)
     * @returns {Number} Parsed amount
     */
    parseAmount(amountStr) {
        return parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
    }

    /**
     * Cleanup Tesseract worker
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.initialized = false;
        }
    }
}

module.exports = OCRService;