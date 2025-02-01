const jwt = require("jsonwebtoken");

const verifyToken = (role) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === role || decoded.role === "main-admin") {
      console.log("Authorization Header:", req.headers.authorization);
      req.user = decoded;
      next();
    } else {
      res.status(403).json({ message: "Unauthorized access" });
    }
   } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired, please log in again" });
    }
    res.status(403).json({ message: "Invalid token" });
  }
  
};

module.exports = { verifyToken };
