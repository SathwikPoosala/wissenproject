const User = require('../models/User.model');
const Squad = require('../models/Squad.model');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('squad', 'name batch')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('squad', 'name batch members')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/admin/users
 * @access  Admin
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, squadId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // If squad is provided, validate it
    if (squadId) {
      const squad = await Squad.findById(squadId);
      if (!squad) {
        return res.status(404).json({
          success: false,
          message: 'Squad not found'
        });
      }

      if (squad.isFull()) {
        return res.status(400).json({
          success: false,
          message: 'Squad is already full'
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      squad: squadId || null
    });

    // Add user to squad if squadId provided
    if (squadId) {
      const squad = await Squad.findById(squadId);
      squad.members.push(user._id);
      await squad.save();
    }

    const createdUser = await User.findById(user._id)
      .populate('squad', 'name batch')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, squadId } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle squad reassignment
    if (squadId !== undefined) {
      const oldSquadId = user.squad;

      // Remove from old squad
      if (oldSquadId) {
        await Squad.findByIdAndUpdate(oldSquadId, {
          $pull: { members: user._id }
        });
      }

      // Add to new squad
      if (squadId) {
        const newSquad = await Squad.findById(squadId);
        if (!newSquad) {
          return res.status(404).json({
            success: false,
            message: 'New squad not found'
          });
        }

        if (newSquad.isFull()) {
          return res.status(400).json({
            success: false,
            message: 'New squad is already full'
          });
        }

        newSquad.members.push(user._id);
        await newSquad.save();
      }

      user.squad = squadId;
    }

    // Update other fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('squad', 'name batch')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from squad if assigned
    if (user.squad) {
      await Squad.findByIdAndUpdate(user.squad, {
        $pull: { members: user._id }
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * @desc    Get users without squad
 * @route   GET /api/admin/users/unassigned
 * @access  Admin
 */
exports.getUnassignedUsers = async (req, res) => {
  try {
    const users = await User.find({ squad: null, role: 'employee' })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unassigned users',
      error: error.message
    });
  }
};
