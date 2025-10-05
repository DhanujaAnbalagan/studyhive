const express = require('express');
const { signup, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// User Signup
router.post('/signup', signup);

// User Login
router.post('/login', login);

// Get Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // or { user } if you prefer
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, branch, year, interests } = req.body;
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!username || !email)
      return res.status(400).json({ message: 'Username and email required' });

    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser)
      return res.status(400).json({ message: 'Username or email already exists' });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, branch, year, interests },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// Delete Profile
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

module.exports = router;