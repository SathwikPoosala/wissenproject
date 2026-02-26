const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUnassignedUsers
} = require('../../controllers/admin/user.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.get('/unassigned', getUnassignedUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
