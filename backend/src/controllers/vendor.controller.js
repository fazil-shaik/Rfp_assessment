const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createVendor = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const vendor = await prisma.vendor.create({
            data: { name, email, phone, address }
        });
        res.json(vendor);
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(400).json({ error: 'Vendor with this email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createVendor,
    getVendors
};
