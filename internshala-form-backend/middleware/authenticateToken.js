// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure JWT_SECRET is in your .env file

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer TOKEN_STRING"

  if (token == null) {
    console.log("AuthMiddleware: No token provided.");
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error('AuthMiddleware: JWT Verification Error:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired.' });
      }
      return res.status(403).json({ message: 'Forbidden: Invalid or malformed token.' });
    }
    
    // --- CORRECTED CHECK HERE: Expect 'userId' (lowercase 'd') ---
    if (!userPayload || !userPayload.userId) { 
        console.error('AuthMiddleware: JWT Payload Error: userId (lowercase d) missing in token payload.', userPayload);
        return res.status(403).json({ message: 'Forbidden: Token payload invalid (missing userId).' });
    }
    
    // req.user will now correctly have { userId: '...', email: '...' }
    // because userPayload already has userId (lowercase d)
    req.user = userPayload; 
    console.log("AuthMiddleware: Token verified, req.user set:", req.user);
    next();
  });
}

module.exports = authenticateToken;