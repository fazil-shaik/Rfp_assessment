const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');

router.post('/', vendorController.createVendor);
router.get('/', vendorController.getVendors);

module.exports = router;
