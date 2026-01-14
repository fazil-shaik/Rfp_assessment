const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfp.controller');

router.post('/', rfpController.createRFP);
router.get('/', rfpController.getRFPs);
router.get('/:id', rfpController.getRFP);
router.get('/:id/compare', rfpController.compareRFPResponses);
router.post('/:id/send', rfpController.sendRFPToVendors);
router.post('/:id/response', rfpController.simulateVendorResponse);

module.exports = router;
