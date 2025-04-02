const authMiddleware = async (request, response) => {
    
    //  define authentication steps
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Get token from headers
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = user; // Store the decoded user info in request
    next(); // Move to the next middleware or route
  });
};

export { authMiddleware , authenticateToken };
