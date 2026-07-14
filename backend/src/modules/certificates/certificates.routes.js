const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const certificatesController = require("./certificates.controller");

router.get("/", protect, certificatesController.getCertificatesHandler);
router.get("/validate/:code", protect, certificatesController.validateCertificateHandler);

module.exports = router;
