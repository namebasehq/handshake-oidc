import express from 'express';
import hnsUtils from '../hns';
const router = express.Router();


function setNoCache(req, res, next) {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
}

router.get('/', setNoCache, async (req, res, next) => {
  try {
    const id = hnsUtils.atob(<string>req.query.id)
    const deviceId = hnsUtils.atob(<string>req.query.deviceId)
    const fp = hnsUtils.atob(<string>req.query.fp);
    const fingerprintRecords = (await hnsUtils.getRecordsAsync(`${deviceId}._auth.${id}`)).filter(r => r.fingerprint ? true : false);
    const isFingerprintValid = fingerprintRecords.length > 0 && fingerprintRecords[0].fingerprint == fp;
    res.send({ success: isFingerprintValid });
  } catch (e) {
    res.send({ success: false });
  }
});

export default router;
