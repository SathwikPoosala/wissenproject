const express = require('express');
const router = express.Router();
const {
  createSquad,
  getAllSquads,
  getSquad,
  updateSquad,
  deleteSquad,
  addMemberToSquad,
  removeMemberFromSquad,
  getSquadsByBatch
} = require('../../controllers/admin/squad.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllSquads)
  .post(createSquad);

router.route('/batch/:batch')
  .get(getSquadsByBatch);

router.route('/:id')
  .get(getSquad)
  .put(updateSquad)
  .delete(deleteSquad);

router.route('/:id/members')
  .post(addMemberToSquad);

router.route('/:id/members/:userId')
  .delete(removeMemberFromSquad);

module.exports = router;
