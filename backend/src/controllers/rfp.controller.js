const { PrismaClient } = require('@prisma/client');
const aiService = require('../services/ai.service');

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
    compareRFPResponses
};
