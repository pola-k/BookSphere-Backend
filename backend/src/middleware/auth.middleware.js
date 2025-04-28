import jwt from 'jsonwebtoken';
const authMiddleware = async (request, response) => {
   // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token using the secret key from your .env file
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    // Attach the decoded user info to the request object
    req.user = decoded;
    next();
  });
}

// If you prefer to use a different name, you can also export it as authMiddleware
export default { authMiddleware };
