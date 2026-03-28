import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../lib/email.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "24h",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res) => {
  const { email, password, name, adminSecretKey } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if admin secret key is provided and valid
    let role = "customer"; // Default role
    if (adminSecretKey && adminSecretKey === process.env.ADMIN_SECRET_KEY) {
      role = "admin";
    }

    const user = await User.create({ name, email, password, role });

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    // Note: refresh token stored in cookie only (no Redis)
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken, // Return token for frontend storage
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      setCookies(res, accessToken, refreshToken);

      res.json({
        message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken, // Return token for frontend storage
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Note: Redis disabled - skipping stored token verification
    // Token validity is checked via JWT signature

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Track product view (browsing history)
// @route   POST /api/auth/track-view
// @access  Private
export const trackBrowsingHistory = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in history (don't add duplicates)
    const existingIndex = user.browsingHistory.findIndex(
      (h) => h.product.toString() === productId,
    );

    if (existingIndex !== -1) {
      // Update the viewedAt timestamp
      user.browsingHistory[existingIndex].viewedAt = new Date();
    } else {
      // Add to beginning of array (most recent first)
      user.browsingHistory.unshift({
        product: productId,
        viewedAt: new Date(),
      });
    }

    // Keep only last 20 products
    if (user.browsingHistory.length > 20) {
      user.browsingHistory = user.browsingHistory.slice(0, 20);
    }

    await user.save();

    res.json({ message: "Browsing history updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============== FORGOT PASSWORD ==============

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // IMPORTANT: Always return success to prevent email enumeration
    // This way attackers can't know which emails are registered
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token (random bytes)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving to database (security best practice)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      // Clear the token if email failed to send
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        message: "Failed to send password reset email. Please try again.",
      });
    }

    res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============== RESET PASSWORD ==============

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Hash the token from the URL to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and where expiration is in the future
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token hasn't expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============== CHANGE PASSWORD (when logged in) ==============

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Please provide current password, new password, and confirmation",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    // Check if new password is different from current password
    const isSameAsCurrent = await user.comparePassword(newPassword);
    if (isSameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Get user from database
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password does not match",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============== CHECK AUTH (for redirecting logged-in users) ==============

export const checkAuth = async (req, res) => {
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
      // User is not authenticated
      return res.status(200).json({ isAuthenticated: false });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(200).json({ isAuthenticated: false });
      }

      // User is authenticated - return user info and redirect flag
      return res.status(200).json({
        isAuthenticated: true,
        redirectTo: "/dashboard",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Token expired - treat as not authenticated
        return res.status(200).json({ isAuthenticated: false });
      }
      // Invalid token - treat as not authenticated
      return res.status(200).json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(200).json({ isAuthenticated: false });
  }
};
