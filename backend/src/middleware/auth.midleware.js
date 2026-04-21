import jwt from "jsonwebtoken";

/**
 * protect — verifies the Bearer token and attaches decoded payload to req.user
 *
 * req.user shape (matches generateAccessToken payload):
 *   { userId, email, role }
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Debug: show header when missing to aid troubleshooting
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.debug("protect middleware — missing/invalid Authorization header:", authHeader);
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { userId, email, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * authorizeRoles(...roles) — role-based access guard
 * Must be used AFTER protect middleware.
 *
 * Usage:
 *   router.post("/", protect, authorizeRoles("job_poster", "admin"), createJob);
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};