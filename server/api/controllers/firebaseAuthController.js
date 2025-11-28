const admin = require('firebase-admin');

const generateFirebaseToken = async (req, res) => {
  try {
    const userId = req.user.id; // This comes from your JWT middleware
    
    // Generate a Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(userId);
    
    res.json({ firebaseToken });
  } catch (error) {
    console.error('Error generating Firebase token:', error);
    res.status(500).json({ error: 'Failed to generate Firebase token' });
  }
};

module.exports = {
  generateFirebaseToken
};
