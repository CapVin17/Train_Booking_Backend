const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  console.log("Token:", token); // Log the token for debugging

  if (!token) {
    return res.status(401).json({ message: "Token required Login Again" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification error:", err); // Log the error
      return res.status(403).json({ message: "Invalid Token" });
    }

    req.UserId = user.id;
    next();
  });
}



module.exports = authenticateToken;