// Vercel Serverless Function - Simplified
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Simple bill data
        const totalAmount = 7653;
        const offerAmount = 2143;
        const savingsPercent = 72;
        
        const charges = [
            {
                description: 'Emergency Room Visit Level 5',
                amount: 3200,
                code: 'E0005',
                fairPrice: 800,
                estimatedFairPrice: 800,
                flagReason: 'Significant overcharge compared to Medicare rates',
                negotiationPotential: 0.75
            },
            {
                description: 'Facility Fee',
                amount: 847,
                code: 'FAC01',
                fairPrice: 203,
                estimatedFairPrice: 203,
                flagReason: 'Common overcharge that is often negotiable',
                negotiationPotential: 0.76
            },
            {
                description: 'Laboratory Processing',
                amount: 395,
                code: 'LAB12',
                fairPrice: 122,
                estimatedFairPrice: 122,
                flagReason: 'Lab charges typically marked up 300-400%',
                negotiationPotential: 0.69
            },
            {
                description: 'Medical Supplies',
                amount: 287,
                code: 'SUP99',
                fairPrice: 25,
                estimatedFairPrice: 25,
                flagReason: 'Extreme markup: 91% above fair pricing',
                negotiationPotential: 0.91
            },
            {
                description: 'IV Therapy',
                amount: 787,
                code: 'IV001',
                fairPrice: 150,
                estimatedFairPrice: 150,
                flagReason: 'IV therapy commonly overcharged by 400-500%',
                negotiationPotential: 0.81
            }
        ];
        
        const letterText = `January 30, 2026

John Doe
[Your Address]

Regional Medical Center
Billing Department

Re: Medical Bill - Account #MED12345678
    Original Amount: $7,653
    Proposed Settlement: $2,143

Dear Billing Department,

I am writing to request a review and adjustment of my medical bill due to charges that appear to be significantly above standard rates.

After careful review of the itemized charges, I have identified several items that are priced well above Medicare reimbursement rates:

• Emergency Room Visit Level 5: Charged $3,200, Fair price ~$800 (75% markup)
• Facility Fee: Charged $847, Fair price ~$203 (76% markup)
• Laboratory Processing: Charged $395, Fair price ~$122 (69% markup)
• Medical Supplies: Charged $287, Fair price ~$25 (91% markup)
• IV Therapy: Charged $787, Fair price ~$150 (81% markup)

Based on my research, I am proposing a settlement amount of $2,143, which represents a 72% reduction from the original bill.

I am prepared to pay this amount immediately upon acceptance.

Please respond within 15 business days.

Sincerely,

John Doe`;
        
        const response = {
            success: true,
            billAnalysis: {
                originalAmount: totalAmount,
                negotiableCharges: charges.length,
                estimatedSavings: totalAmount - offerAmount,
                savingsPercent: savingsPercent
            },
            charges: charges,
            letter: {
                html: `<div style="white-space: pre-line; font-family: Arial, sans-serif; line-height: 1.6;">${letterText}</div>`,
                text: letterText,
                metadata: {
                    savings: totalAmount - offerAmount,
                    savingsPercent: savingsPercent
                }
            }
        };
        
        return res.status(200).json(response);
        
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to process bill',
            message: error.toString()
        });
    }
}