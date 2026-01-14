const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfp.controller');

router.post('/', rfpController.createRFP);
router.get('/', rfpController.getRFPs);
router.get('/:id', rfpController.getRFP);
router.get('/:id/compare', rfpController.compareRFPResponses);

module.exports = router;
