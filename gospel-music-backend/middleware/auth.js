// middleware/auth.js
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const admin = async (req, res, next) => {
  try {
    // Note: We need the full user object to check role if it's not in the token
    // For performance, we usually put the role in the JWT payload
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
