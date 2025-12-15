import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role? }
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

export const isAdmin = (req, res, next) => {
  // Determine if we need to check db or if JWT has role. 
  // Since existing JWTs won't have role, we should ideally fetch from DB in a real robust app,
  // but for simplicity let's stick to JWT based (which requires re-login) OR 
  // we can do a quick DB lookup here if needed. 
  // Let's assume we update the login flow to include role in token.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
};
