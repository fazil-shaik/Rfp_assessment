const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

const compareProposals = async (rfpTitle, rfpBudget, vendorResponses) => {
    // vendorResponses is array of { vendorName: string, data: parsedJSON, raw: string }
    const prompt = `
    You are a senior procurement manager. 
    Compare the following vendor proposals for the RFP: "${rfpTitle}" (Budget: ${rfpBudget}).
    
    Vendor Proposals:
    ${JSON.stringify(vendorResponses, null, 2)}
    
    Provide a comparison summary and a recommendation.
    Return JSON with:
    - summary: A paragraph comparing the options.
    - recommendation: The name of the recommended vendor.
    - reasoning: Why you chose them.
    - scores: An object mapping vendorName to a score (0-100).
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Comparison Error:", error);
        return null;
    }
};

module.exports = {
    parseRFPRequest,
    parseVendorResponse,
    compareProposals
};
