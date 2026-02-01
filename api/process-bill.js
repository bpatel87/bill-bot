// Vercel Serverless Function for processing bills
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
        
        // Generate letter inline (simplified)
        const letter = generateLetter(billData);
        
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

function generateLetter(billData) {
    const patientInfo = { name: 'John Doe', email: 'patient@example.com' };
    const offerAmount = Math.round(billData.totalAmount * 0.28);
    const savings = billData.totalAmount - offerAmount;
    const savingsPercent = Math.round((savings / billData.totalAmount) * 100);
    
    const letterText = `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${patientInfo.name}
[Your Address]

${billData.provider.name}
Billing Department

Re: Medical Bill - Account #${billData.accountNumber}
    Original Amount: $${billData.totalAmount.toLocaleString()}
    Proposed Settlement: $${offerAmount.toLocaleString()}

Dear Billing Department,

I am writing to request a review and adjustment of my medical bill due to charges that appear to be significantly above standard rates.

After careful review of the itemized charges, I have identified several items that are priced well above Medicare reimbursement rates:

${billData.flaggedCharges.map(charge => 
`• ${charge.description}: Charged $${charge.amount}, Fair price ~$${charge.fairPrice} (${Math.round((1 - charge.fairPrice/charge.amount) * 100)}% markup)`
).join('\n')}

Based on my research, I am proposing a settlement amount of $${offerAmount.toLocaleString()}, which represents a ${savingsPercent}% reduction from the original bill.

I am prepared to pay this amount immediately upon acceptance.

Please respond within 15 business days.

Sincerely,

${patientInfo.name}`;
    
    const letterHTML = `<div style="white-space: pre-line; font-family: Arial, sans-serif; line-height: 1.6;">${letterText}</div>`;
    
    return {
        text: letterText,
        html: letterHTML,
        metadata: {
            savings: savings,
            savingsPercent: savingsPercent
        }
    };
}