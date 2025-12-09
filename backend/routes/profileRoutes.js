const router = require('express').Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');


router.get('/me', requireAuth, profileController.getMyProfile);
router.post('/', requireAuth, profileController.createProfile);

router.get('/:userId', requireAuth, profileController.getProfileByUserId);
router.put('/:userId', requireAuth, profileController.updateProfilePut);



module.exports = router;
