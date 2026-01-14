const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const parseRFPRequest = async (text) => {
    const prompt = `
    You are an expert procurement assistant. 
    Analyze the following procurement request and extract structured data in JSON format.
    
    Request: "${text}"
    
    Return a valid JSON object with the following keys:
    - title: A short descriptive title for the RFP.
    - items: An array of objects, each with 'name', 'quantity', 'specs' (string details).
    - budget: The budget amount if mentioned (string).
    - timeline: Delivery timeline if mentioned (string).
    - requirements: key requirements (string array).
    
    Do not markdown format the output, just return raw JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Parsing Error:", error);
        return null;
    }
};

const parseVendorResponse = async (emailBody) => {
    const prompt = `
    You are a procurement assistant.
    Analyze the following email response from a vendor and extract structured data in JSON format.
    
    Email Body: "${emailBody}"
    
    Return a valid JSON object with:
    - price: The total price quoted (number or string).
    - deliveryDate: Promised delivery date or timeline.
    - warranty: Warranty terms mentioned.
    - comments: Any specific conditions or notes.
    
    Do not markdown format the output, just return raw JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Vendor Response Parsing Error:", error);
        return null;
    }
};

const prompt = `
    You are a senior procurement manager. 
    Compare the following vendor proposals for the RFP: "${rfpTitle}" (Budget: ${rfpBudget}).
    
    Vendor Proposals:
    ${JSON.stringify(vendorResponses, null, 2)}
    
    Provide a comparison summary and a recommendation.
    Return ONLY valid JSON with the following structure:
    {
      "summary": "A paragraph comparing the options...",
      "recommendation": "Vendor Name",
      "reasoning": "Why you chose them...",
      "scores": { "Vendor Name": 85 }
    }
    
    Do not include any conversational text outside the JSON object.
  `;

try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    return JSON.parse(text);
} catch (error) {
    console.error("Comparison Error:", error);
    // Return a safe fallback rather than null to prevent frontend crash
    return {
        summary: "AI analysis failed to generate valid JSON.",
        recommendation: "Manual Review Required",
        reasoning: "The AI model returned an invalid response format.",
        scores: {}
    };
};

module.exports = {
    parseRFPRequest,
    parseVendorResponse,
    compareProposals
};
