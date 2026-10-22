const express = require('express');
const router = express.Router();
const {
  getVersionHistory,
  getEntityVersions
} = require('../controllers/versionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getVersionHistory);
router.get('/:entityType/:entityId', protect, getEntityVersions);

module.exports = router;
