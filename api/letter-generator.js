// Simplified Letter Generator for Vercel
class LetterGenerator {
    generateLetter(billData, patientInfo, options = {}) {
        const offerAmount = Math.round(billData.totalAmount * 0.28);
        const savings = billData.totalAmount - offerAmount;
        const savingsPercent = Math.round((savings / billData.totalAmount) * 100);
        
        const letterText = `
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${patientInfo.name}
[Your Address]

${billData.provider.name}
Billing Department

Re: Medical Bill - Account #${billData.accountNumber}
    Original Amount: $${billData.totalAmount.toLocaleString()}
    Proposed Settlement: $${offerAmount.toLocaleString()}

Dear Billing Department,

I am writing to request a review and adjustment of my medical bill due to charges that appear to be significantly above standard rates.

After careful review of the itemized charges, I have identified several items that are priced well above Medicare reimbursement rates and fair market values:

${billData.flaggedCharges.map(charge => 
`• ${charge.description}: Charged $${charge.amount}, Fair price ~$${charge.fairPrice} (${Math.round((1 - charge.fairPrice/charge.amount) * 100)}% markup)`
).join('\n')}

Based on my research of standard medical pricing and Medicare reimbursement rates, I am proposing a settlement amount of $${offerAmount.toLocaleString()}, which represents a ${savingsPercent}% reduction from the original bill.

I am prepared to pay $${offerAmount.toLocaleString()} immediately upon acceptance of this adjusted amount.

Please respond within 15 business days to avoid the need for further action, including potential complaints to the state insurance commissioner and consumer protection agencies.

Sincerely,

${patientInfo.name}
`;
        
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
}

module.exports = LetterGenerator;