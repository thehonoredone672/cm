const certificatesService = require("./certificates.service");

const getCertificatesHandler = async (req, res, next) => {
  try {
    const list = await certificatesService.getCertificates(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const validateCertificateHandler = async (req, res, next) => {
  try {
    const cert = await certificatesService.validateCertificate(req.params.code);
    res.status(200).json({ success: true, message: "Certificate verified.", data: cert });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCertificatesHandler,
  validateCertificateHandler
};
