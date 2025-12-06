export function getRFPExtractionPrompt(userInput: string): string {
  return `You are an expert at analyzing procurement requirements and extracting structured RFP (Request for Proposal) information.

Analyze the following procurement request and extract all relevant information into a structured JSON format.

User Input:
${userInput}

Extract the following information:
1. Title - A clear, concise title for this RFP
2. Description - A brief description of what is being procured
3. Items - An array of items with:
   - name: Item name
   - quantity: Number/amount needed
   - specifications: Technical or detailed requirements
4. Budget - Budget range or amount (if mentioned)
5. Delivery Timeline - Expected delivery date or timeline
6. Payment Terms - Payment terms (if mentioned)
7. Warranty - Warranty requirements (if mentioned)

Return ONLY a valid JSON object with this structure:
{
  "title": "string",
  "description": "string",
  "items": [
    {
      "name": "string",
      "quantity": "string",
      "specifications": "string"
    }
  ],
  "budget": "string or null",
  "deliveryTimeline": "string or null",
  "paymentTerms": "string or null",
  "warranty": "string or null"
}

Do not include any markdown formatting, explanations, or additional text. Return only the JSON object.`;
}

export function getProposalParsingPrompt(
  emailBody: string,
  rfpItems: Array<{ name: string; quantity: string; specifications: string }>
): string {
  const itemsList = rfpItems
    .map((item, idx) => `${idx + 1}. ${item.name} (Qty: ${item.quantity}) - ${item.specifications}`)
    .join("\n");

  return `You are an expert at parsing vendor proposals and extracting structured pricing and terms information.

Analyze the following vendor proposal email and extract all relevant information into a structured JSON format.

Original RFP Items Requested:
${itemsList}

Vendor Email Content:
${emailBody}

Extract the following information:
1. Line Items - An array matching the RFP items with:
   - itemName: Name of the item (match to RFP item)
   - price: Price per unit or total
   - quantity: Quantity offered
   - specifications: Any specifications or notes
2. Total Cost - Total cost of the proposal
3. Delivery Terms - Delivery timeline and terms
4. Payment Terms - Payment terms offered
5. Warranty - Warranty information provided
6. Completeness Score - A score from 0 to 1 indicating how complete the proposal is (1 = fully addresses all RFP items, 0 = missing critical information)

Return ONLY a valid JSON object with this structure:
{
  "lineItems": [
    {
      "itemName": "string",
      "price": "string",
      "quantity": "string",
      "specifications": "string or null"
    }
  ],
  "totalCost": "string or null",
  "deliveryTerms": "string or null",
  "paymentTerms": "string or null",
  "warranty": "string or null",
  "completenessScore": number
}

Do not include any markdown formatting, explanations, or additional text. Return only the JSON object.`;
}

export function getRecommendationPrompt(
  rfpTitle: string,
  proposals: Array<{
    vendorName: string;
    totalCost: string | null;
    deliveryTerms: string | null;
    paymentTerms: string | null;
    warranty: string | null;
    completenessScore: number | null;
  }>
): string {
  const proposalsList = proposals
    .map(
      (p, idx) => `
Vendor ${idx + 1}: ${p.vendorName}
- Total Cost: ${p.totalCost || "Not specified"}
- Delivery Terms: ${p.deliveryTerms || "Not specified"}
- Payment Terms: ${p.paymentTerms || "Not specified"}
- Warranty: ${p.warranty || "Not specified"}
- Completeness Score: ${p.completenessScore || 0}`
    )
    .join("\n");

  return `You are an expert procurement analyst. Analyze the following vendor proposals for an RFP and provide a recommendation.

RFP Title: ${rfpTitle}

Vendor Proposals:
${proposalsList}

Analyze each proposal considering:
1. Price competitiveness
2. Delivery timeline
3. Payment terms favorability
4. Warranty coverage
5. Completeness of response
6. Overall value proposition

Return ONLY a valid JSON object with this structure:
{
  "recommendedVendor": "string (vendor name)",
  "reasoning": "string (2-3 sentences explaining why this vendor was recommended)",
  "summary": {
    "vendorName": "string",
    "strengths": ["string", "string"],
    "concerns": ["string", "string"] or null
  }
}

Do not include any markdown formatting, explanations, or additional text. Return only the JSON object.`;
}

