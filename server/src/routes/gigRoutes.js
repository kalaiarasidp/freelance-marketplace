const { Router } = require('express');
const { createGig, getGigs, getGigById, updateGig, deleteGig } = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = Router();

router.get('/',    getGigs);
router.get('/:id', getGigById);

// Only users with role "freelancer" or "both" may create gigs.
router.post('/',    protect, authorize('freelancer', 'both'), createGig);

// Ownership check is handled inside the controller, so protect alone is enough here.
router.put('/:id',    protect, updateGig);
router.delete('/:id', protect, deleteGig);

module.exports = router;
