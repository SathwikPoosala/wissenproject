const Squad = require('../../models/Squad.model');
const User = require('../../models/User.model');

/**
 * @desc    Create new squad
 * @route   POST /api/admin/squads
 * @access  Admin
 */
exports.createSquad = async (req, res) => {
  try {
    const { name, batch } = req.body;

    // Check if squad already exists
    const existingSquad = await Squad.findOne({ name });
    if (existingSquad) {
      return res.status(400).json({
        success: false,
        message: 'Squad with this name already exists'
      });
    }

    // Count existing squads
    const squadCount = await Squad.countDocuments();
    if (squadCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum squad limit (10) reached'
      });
    }

    const squad = await Squad.create({
      name,
      batch,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Squad created successfully',
      data: squad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating squad',
      error: error.message
    });
  }
};

/**
 * @desc    Get all squads
 * @route   GET /api/admin/squads
 * @access  Admin
 */
exports.getAllSquads = async (req, res) => {
  try {
    const squads = await Squad.find()
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: squads.length,
      data: squads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching squads',
      error: error.message
    });
  }
};

/**
 * @desc    Get single squad
 * @route   GET /api/admin/squads/:id
 * @access  Admin
 */
exports.getSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id)
      .populate('members', 'name email isActive')
      .populate('createdBy', 'name email');

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    res.status(200).json({
      success: true,
      data: squad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching squad',
      error: error.message
    });
  }
};

/**
 * @desc    Update squad
 * @route   PUT /api/admin/squads/:id
 * @access  Admin
 */
exports.updateSquad = async (req, res) => {
  try {
    const { name, batch, isActive } = req.body;

    let squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    squad = await Squad.findByIdAndUpdate(
      req.params.id,
      { name, batch, isActive },
      { new: true, runValidators: true }
    ).populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Squad updated successfully',
      data: squad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating squad',
      error: error.message
    });
  }
};

/**
 * @desc    Delete squad
 * @route   DELETE /api/admin/squads/:id
 * @access  Admin
 */
exports.deleteSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    // Remove squad reference from all members
    await User.updateMany(
      { squad: squad._id },
      { squad: null }
    );

    await squad.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Squad deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting squad',
      error: error.message
    });
  }
};

/**
 * @desc    Add member to squad
 * @route   POST /api/admin/squads/:id/members
 * @access  Admin
 */
exports.addMemberToSquad = async (req, res) => {
  try {
    const { userId } = req.body;

    const squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already in another squad
    if (user.squad && user.squad.toString() !== squad._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'User is already assigned to another squad'
      });
    }

    await squad.addMember(userId);

    const updatedSquad = await Squad.findById(squad._id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member added to squad successfully',
      data: updatedSquad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding member to squad',
      error: error.message
    });
  }
};

/**
 * @desc    Remove member from squad
 * @route   DELETE /api/admin/squads/:id/members/:userId
 * @access  Admin
 */
exports.removeMemberFromSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    await squad.removeMember(req.params.userId);

    const updatedSquad = await Squad.findById(squad._id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed from squad successfully',
      data: updatedSquad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member from squad',
      error: error.message
    });
  }
};

/**
 * @desc    Get squads by batch
 * @route   GET /api/admin/squads/batch/:batch
 * @access  Admin
 */
exports.getSquadsByBatch = async (req, res) => {
  try {
    const squads = await Squad.find({ batch: req.params.batch })
      .populate('members', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: squads.length,
      data: squads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching squads by batch',
      error: error.message
    });
  }
};
