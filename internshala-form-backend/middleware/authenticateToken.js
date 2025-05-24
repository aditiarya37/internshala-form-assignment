const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

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
    
    if (!userPayload || !userPayload.userId) { 
        console.error('AuthMiddleware: JWT Payload Error: userId (lowercase d) missing in token payload.', userPayload);
        return res.status(403).json({ message: 'Forbidden: Token payload invalid (missing userId).' });
    }
    
    req.user = userPayload; 
    console.log("AuthMiddleware: Token verified, req.user set:", req.user);
    next();
  });
}

module.exports = authenticateToken;