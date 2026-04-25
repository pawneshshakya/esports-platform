import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config/env";
import { emailService } from "../services/email.service";
import { sseService } from "../services/sse.service";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: "access" },
    config.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    config.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, phone } = req.body;

    // Validate Gmail only
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ error: "Only Gmail addresses are allowed" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters with uppercase, lowercase, number and special character",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const walletAccount = `ES${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      username,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      wallet: {
        accountNumber: walletAccount,
        balance: 0,
        isLocked: false,
      },
    });

    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your Gmail inbox and verify your email.",
      userId: user._id,
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification link" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Verification failed" });
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isEmailVerified: false });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found or already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendVerificationEmail(
      email,
      user.name,
      verificationToken,
    );

    res.json({ success: true, message: "Verification email resent!" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to resend" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        error:
          "Email not verified. Please check your inbox or request a new verification link.",
        needsVerification: true,
        email: user.email,
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account has been suspended" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        userType: user.userType,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        wallet: {
          accountNumber: user.wallet.accountNumber,
          balance: user.wallet.balance,
        },
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      { userId: user._id },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// GET ME
export const getMe = async (req: any, res: Response) => {
  res.json({
    user: req.user,
  });
};
