const express = require('express');
const multer = require('multer');
const LetterGenerator = require('../src/services/letter-generator');

const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const letterGenerator = new LetterGenerator();

// Simplified bill processor with demo mode
router.post('/process-bill', upload.single('bill'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing bill:', req.file.originalname);
        
        // For now, always use demo data to ensure it works
        // In production, you'd integrate real OCR here
        const billData = generateDemoBillData(req.file.originalname);
        
        // Get patient info from request
        const patientInfo = {
            name: req.body.patientName || 'John Doe',
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        };

        // Generate negotiation letter
        const letterOptions = {
            strategy: req.body.strategy || 'fair_pricing',
            paymentType: req.body.paymentType || 'payment_ready'
        };
        
        const letter = letterGenerator.generateLetter(billData, patientInfo, letterOptions);

        // Return results
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
 * Generate realistic demo bill data
 */
function generateDemoBillData(filename) {
    // Base charges that appear on most hospital bills
    const commonCharges = [
        { name: 'Emergency Room Visit Level 5', amount: 3200, overchargeRate: 0.75 },
        { name: 'Emergency Room Visit Level 4', amount: 2100, overchargeRate: 0.70 },
        { name: 'Emergency Room Visit Level 3', amount: 1400, overchargeRate: 0.65 },
        { name: 'Facility Fee', amount: 847, overchargeRate: 0.76 },
        { name: 'Physician Services - Emergency', amount: 1200, overchargeRate: 0.40 },
        { name: 'Laboratory Processing', amount: 395, overchargeRate: 0.69 },
        { name: 'Complete Blood Count', amount: 280, overchargeRate: 0.82 },
        { name: 'Basic Metabolic Panel', amount: 320, overchargeRate: 0.84 },
        { name: 'Urinalysis', amount: 145, overchargeRate: 0.86 },
        { name: 'Medical Supplies', amount: 287, overchargeRate: 0.91 },
        { name: 'IV Therapy', amount: 787, overchargeRate: 0.81 },
        { name: 'IV Solutions', amount: 393, overchargeRate: 0.90 },
        { name: 'Bandages and Dressings', amount: 200, overchargeRate: 0.97 },
        { name: 'Ibuprofen 800mg (2 tablets)', amount: 86, overchargeRate: 0.98 },
        { name: 'Acetaminophen 500mg (2 tablets)', amount: 76, overchargeRate: 0.98 },
        { name: 'CT Scan - Abdomen', amount: 3400, overchargeRate: 0.76 },
        { name: 'X-Ray - Chest', amount: 450, overchargeRate: 0.67 },
        { name: 'EKG/ECG', amount: 380, overchargeRate: 0.71 },
        { name: 'Oxygen Administration', amount: 240, overchargeRate: 0.83 },
        { name: 'Pharmacy Services', amount: 892, overchargeRate: 0.78 }
    ];
    
    // Randomly select 5-8 charges to create a realistic bill
    const numCharges = 5 + Math.floor(Math.random() * 4);
    const selectedCharges = [];
    const usedIndexes = new Set();
    
    // Always include ER visit and facility fee
    selectedCharges.push(commonCharges[Math.floor(Math.random() * 3)]); // Random ER level
    selectedCharges.push(commonCharges[3]); // Facility fee
    
    // Add random other charges
    while (selectedCharges.length < numCharges) {
        const index = Math.floor(Math.random() * commonCharges.length);
        if (!usedIndexes.has(index) && index > 3) {
            usedIndexes.add(index);
            selectedCharges.push(commonCharges[index]);
        }
    }
    
    // Build charges array with realistic variations
    const charges = selectedCharges.map((charge, idx) => ({
        description: charge.name,
        amount: charge.amount * (0.9 + Math.random() * 0.2), // ±10% variation
        code: `CPT-${10000 + Math.floor(Math.random() * 90000)}`,
        sequence: idx + 1
    }));
    
    // Calculate total and flag overcharges
    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
    
    // Flag overcharges
    const flaggedCharges = selectedCharges.map((template, idx) => {
        const charge = charges[idx];
        const fairPrice = charge.amount * (1 - template.overchargeRate);
        
        return {
            ...charge,
            fairPrice: Math.round(fairPrice),
            estimatedFairPrice: Math.round(fairPrice),
            negotiable: template.overchargeRate > 0.5,
            flagReason: template.overchargeRate > 0.9 ? 
                `Extreme markup: ${Math.round(template.overchargeRate * 100)}% above fair pricing` :
                template.overchargeRate > 0.7 ?
                `Significant overcharge compared to Medicare rates` :
                `Above standard pricing for this service`,
            negotiationPotential: template.overchargeRate
        };
    }).filter(charge => charge.negotiable);
    
    // Determine provider based on charges
    const hasER = charges.some(c => c.description.includes('Emergency'));
    const hasImaging = charges.some(c => c.description.includes('CT') || c.description.includes('X-Ray'));
    
    const providers = [
        'Regional Medical Center',
        'St. Mary\'s Hospital',
        'University Hospital System',
        'Memorial Healthcare',
        'Community General Hospital'
    ];
    
    return {
        provider: {
            name: providers[Math.floor(Math.random() * providers.length)]
        },
        accountNumber: 'MED' + Date.now().toString().slice(-8),
        billDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        serviceDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        totalAmount: Math.round(totalAmount),
        charges: charges,
        flaggedCharges: flaggedCharges,
        patientResponsibility: Math.round(totalAmount * 0.85), // Assume some insurance
        insurancePaid: Math.round(totalAmount * 0.15),
        department: hasER ? 'Emergency Department' : hasImaging ? 'Radiology' : 'Outpatient Services'
    };
}

module.exports = router;