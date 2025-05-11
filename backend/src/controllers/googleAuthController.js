const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Adjust path as needed
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 
// Make sure you have GOOGLE_CLIENT_ID in your .env

class GoogleAuthController {
  async googleLogin(req, res) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        return res.status(400).json({ message: 'Missing Google token' });
      }

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      const { email, name, picture } = payload;

      // Check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create a new user
        user = new User({
          username: name,
          email,
          password: null, // Social logins may not have a password
          // If you have default roles or profile completion for social users:
          registrationType: 'social',
          isVerified: true, // Google accounts are generally considered verified
          isActive: true
        });
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Logged in with Google successfully',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
}

module.exports = new GoogleAuthController();
