const { PrismaClient } = require('@prisma/client');
const aiService = require('../services/ai.service');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

const createRFP = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text description is required' });

        // AI Processing
        const structuredData = await aiService.parseRFPRequest(text);

        if (!structuredData) {
            return res.status(500).json({ error: 'Failed to process request with AI' });
        }

        const title = structuredData.title || "New RFP";
        const budget = structuredData.budget || null;
        const timeline = structuredData.timeline || null;

        const rfp = await prisma.rFP.create({
            data: {
                rawRequest: text,
                structuredData: structuredData,
                title,
                budget,
                timeline,
                status: 'OPEN'
            }
        });

        res.json(rfp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getRFPs = async (req, res) => {
    try {
        const rfps = await prisma.rFP.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { responses: true } } }
        });
        res.json(rfps);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getRFP = async (req, res) => {
    try {
        const { id } = req.params;
        const rfp = await prisma.rFP.findUnique({
            where: { id },
            include: { responses: { include: { vendor: true } } }
        });
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });

        // If we have responses, maybe add AI comparison if requested?
        // For now just return data
        res.json(rfp);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const sendRFPToVendors = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorIds } = req.body; // Array of vendor IDs

        const rfp = await prisma.rFP.findUnique({ where: { id } });
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });

        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } }
        });

        const results = [];
        for (const vendor of vendors) {
            const emailContent = `Dear ${vendor.name},\n\nWe have a new RFP: "${rfp.title}".\n\nRequirements:\n${JSON.stringify(rfp.structuredData, null, 2)}\n\nPlease reply with your proposal.\n\nThanks,\nProcurement Team`;

            const previewUrl = await emailService.sendEmail(vendor.email, `RFP Invitation: ${rfp.title}`, emailContent);
            results.push({ vendor: vendor.name, status: 'Sent', previewUrl });
        }

        res.json({ message: 'Emails sent successfully', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
};

const simulateVendorResponse = async (req, res) => {
    try {
        const { id } = req.params; // rfpId
        const { vendorId, emailBody } = req.body;

        // 1. Parse content with AI
        const structuredData = await aiService.parseVendorResponse(emailBody);

        // 2. Save response
        const response = await prisma.vendorResponse.create({
            data: {
                rfpId: id,
                vendorId,
                rawContent: emailBody,
                structuredData: structuredData || {},
                // We could calculate a score here too if we wanted single-response scoring
            }
        });

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process vendor response' });
    }
};

const compareRFPResponses = async (req, res) => {
    try {
        const { id } = req.params;
        const rfp = await prisma.rFP.findUnique({
            where: { id },
            include: { responses: { include: { vendor: true } } }
        });

        if (!rfp || rfp.responses.length === 0) {
            return res.status(400).json({ error: 'No responses to compare' });
        }

        const vendorResponses = rfp.responses.map(r => ({
            vendorName: r.vendor.name,
            data: r.structuredData,
            raw: r.rawContent
        }));

        const comparison = await aiService.compareProposals(rfp.title, rfp.budget, vendorResponses);
        res.json(comparison);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Comparison failed' });
    }
}

module.exports = {
    createRFP,
    getRFPs,
    getRFP,
    compareRFPResponses,
    sendRFPToVendors,
    simulateVendorResponse
};
