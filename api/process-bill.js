// Vercel Serverless Function for processing bills
const LetterGenerator = require('./letter-generator');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('Processing bill upload...');
        
        // Generate demo bill data
        const billData = generateDemoBillData();
        
        // Generate negotiation letter
        const letterGenerator = new LetterGenerator();
        const patientInfo = {
            name: 'John Doe',
            email: 'patient@example.com'
        };
        
        const letter = letterGenerator.generateLetter(billData, patientInfo, {
            strategy: 'fair_pricing',
            paymentType: 'payment_ready'
        });
        
        // Return results
        res.status(200).json({
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
};

function generateDemoBillData() {
    const charges = [
        { name: 'Emergency Room Visit Level 5', amount: 3200, overchargeRate: 0.75 },
        { name: 'Facility Fee', amount: 847, overchargeRate: 0.76 },
        { name: 'Laboratory Processing', amount: 395, overchargeRate: 0.69 },
        { name: 'Medical Supplies', amount: 287, overchargeRate: 0.91 },
        { name: 'IV Therapy', amount: 787, overchargeRate: 0.81 },
        { name: 'Ibuprofen 800mg (2 tablets)', amount: 86, overchargeRate: 0.98 },
        { name: 'X-Ray - Chest', amount: 450, overchargeRate: 0.67 },
        { name: 'Physician Services', amount: 1200, overchargeRate: 0.40 }
    ];
    
    // Select 5-7 random charges
    const numCharges = 5 + Math.floor(Math.random() * 3);
    const selectedCharges = charges.slice(0, numCharges);
    
    const billCharges = selectedCharges.map((charge, idx) => ({
        description: charge.name,
        amount: charge.amount,
        code: `CPT-${10000 + idx * 1000}`
    }));
    
    const totalAmount = billCharges.reduce((sum, charge) => sum + charge.amount, 0);
    
    const flaggedCharges = selectedCharges.map((template, idx) => {
        const charge = billCharges[idx];
        const fairPrice = charge.amount * (1 - template.overchargeRate);
        
        return {
            ...charge,
            fairPrice: Math.round(fairPrice),
            estimatedFairPrice: Math.round(fairPrice),
            flagReason: template.overchargeRate > 0.9 ? 
                `Extreme markup: ${Math.round(template.overchargeRate * 100)}% above fair pricing` :
                `Significant overcharge compared to Medicare rates`,
            negotiationPotential: template.overchargeRate
        };
    }).filter(charge => charge.negotiationPotential > 0.5);
    
    return {
        provider: { name: 'Regional Medical Center' },
        accountNumber: 'MED' + Date.now().toString().slice(-8),
        billDate: new Date().toLocaleDateString(),
        totalAmount: Math.round(totalAmount),
        charges: billCharges,
        flaggedCharges: flaggedCharges
    };
}