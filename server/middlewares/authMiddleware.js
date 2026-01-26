import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.JWT_KEY) {
      console.error("JWT_KEY is missing in environment variables");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);

    // Validate payload shape (don’t trust token blindly)
    if (!payload?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = payload.userId;
    return next();
  } catch (err) {
    // Token expired / invalid signature / malformed
    return res.status(401).json({ error: "Unauthorized" });
  }
};
