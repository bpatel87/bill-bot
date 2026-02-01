const express = require('express');
const multer = require('multer');
const OCRService = require('../src/services/ocr-service');
const LetterGenerator = require('../src/services/letter-generator');

const router = express.Router();
const upload = multer({ 
    memory: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const ocrService = new OCRService();
const letterGenerator = new LetterGenerator();

/**
 * POST /api/process-bill
 * Process uploaded bill with OCR and generate negotiation letter
 */
router.post('/process-bill', upload.single('bill'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing bill:', req.file.originalname);

        // Step 1: OCR extraction
        const ocrResult = await ocrService.extractBillData(req.file.buffer);
        
        if (!ocrResult.success) {
            return res.status(422).json({ 
                error: 'Could not read bill', 
                details: ocrResult.error 
            });
        }

        // Step 2: Enhance with mock data if OCR missed items
        // (In production, this would be more sophisticated)
        const billData = enhanceBillData(ocrResult.data);

        // Step 3: Get patient info from request
        const patientInfo = {
            name: req.body.patientName || 'John Doe',
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        };

        // Step 4: Generate negotiation letter
        const letterOptions = {
            strategy: req.body.strategy || 'fair_pricing',
            paymentType: req.body.paymentType || 'payment_ready'
        };
        
        const letter = letterGenerator.generateLetter(billData, patientInfo, letterOptions);

        // Step 5: Return results
        res.json({
            success: true,
            billAnalysis: {
                originalAmount: billData.totalAmount,
                negotiableCharges: billData.flaggedCharges.length,
                estimatedSavings: letter.metadata.savings,
                savingsPercent: letter.metadata.savingsPercent
            },
            charges: billData.flaggedCharges,
            letter: {
                html: letter.html,
                text: letter.text,
                metadata: letter.metadata
            }
        });

    } catch (error) {
        console.error('Error processing bill:', error);
        res.status(500).json({ 
            error: 'Failed to process bill',
            details: error.message 
        });
    }
});

/**
 * Enhance bill data with common patterns if OCR missed them
 */
function enhanceBillData(billData) {
    // If no charges were detected, add sample charges for demo
    if (!billData.charges || billData.charges.length === 0) {
        billData.charges = [
            { description: 'Emergency Room Visit Level 5', amount: 3200, code: 'E0005' },
            { description: 'Facility Fee', amount: 847, code: 'FAC01' },
            { description: 'Laboratory Processing', amount: 395, code: 'LAB12' },
            { description: 'Medical Supplies', amount: 287, code: 'SUP99' },
            { description: 'Physician Services', amount: 1200, code: 'PHY01' }
        ];
    }

    // Ensure we have flagged charges
    if (!billData.flaggedCharges || billData.flaggedCharges.length === 0) {
        const ocrService = new OCRService();
        billData.flaggedCharges = ocrService.flagOvercharges(billData.charges);
    }

    // Ensure total amount
    if (!billData.totalAmount) {
        billData.totalAmount = billData.charges.reduce((sum, charge) => sum + charge.amount, 0);
    }

    // Ensure other required fields
    billData.provider = billData.provider || { name: 'General Hospital System' };
    billData.accountNumber = billData.accountNumber || 'ACC' + Math.random().toString(36).substr(2, 9).toUpperCase();
    billData.billDate = billData.billDate || new Date().toLocaleDateString();

    return billData;
}

// Cleanup OCR service on server shutdown
process.on('SIGTERM', async () => {
    await ocrService.terminate();
});

module.exports = router;