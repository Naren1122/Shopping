import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let accessToken = req.cookies.accessToken;

    // If no cookie token, check Authorization header
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No access token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid access token" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else if (req.user && req.user.role === "vendor") {
    return res.status(403).json({ 
      message: "Access denied - Vendors cannot access admin features" 
    });
  } else {
    return res.status(403).json({ message: "Access denied - Admin only" });
  }
};

export const vendorRoute = (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    // Allow admins to bypass approval check
    if (req.user.role === "admin") {
      return next();
    }

    // Check if vendor is approved
    if (req.user.vendorProfile?.isApproved) {
      return next();
    }

    return res.status(403).json({ 
      message: "Access denied - Your vendor account is pending approval" 
    });
  } else {
    return res.status(403).json({ message: "Access denied - Vendor only" });
  }
};
