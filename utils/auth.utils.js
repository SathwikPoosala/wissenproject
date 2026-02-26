const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Send token response
 * @param {object} user - User object
 * @param {number} statusCode - Response status code
 * @param {object} res - Response object
 */
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = this.generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};
