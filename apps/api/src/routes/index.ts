import { Router } from "express";
import { auth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as validations from "../validations";

// Controllers
import * as authCtrl from "../controllers/auth.controller";
import * as userCtrl from "../controllers/user.controller";
import * as eventCtrl from "../controllers/event.controller";
import * as roomCtrl from "../controllers/room.controller";
import * as walletCtrl from "../controllers/wallet.controller";
import * as blogCtrl from "../controllers/blog.controller";
import * as adminCtrl from "../controllers/admin.controller";
import * as subCtrl from "../controllers/subscription.controller";
import * as friendCtrl from "../controllers/friend.controller";
import * as withdrawCtrl from "../controllers/withdrawal.controller";
import * as notifCtrl from "../controllers/notification.controller";
import * as chatCtrl from "../controllers/chat.controller";

// ✅ NEW CONTROLLERS
import * as configCtrl from "../controllers/config.controller";
import * as kycCtrl from "../controllers/kyc.controller";
import * as emailVerifyCtrl from "../controllers/emailVerify.controller";

// ✅ NEW MIDDLEWARE
import { require2FAForLargeTransfer } from "../middleware/largeTransfer2FA";
import { checkDeviceFingerprint } from "../middleware/deviceFingerprint";
import { requireActiveSubscription } from "../middleware/subscriptionCheck";

// Multer
import multer from "multer";
const upload = multer({ dest: "uploads/" });

// ✅ KYC Upload
const kycUpload = multer({ dest: "uploads/kyc/" });

const router = Router();

// ✅ Email Verification
router.post(
  "/auth/send-verification",
  auth,
  emailVerifyCtrl.sendVerificationOTP,
);
router.post("/auth/verify-email", auth, emailVerifyCtrl.verifyEmailOTP);
router.get(
  "/auth/verification-status",
  auth,
  emailVerifyCtrl.checkVerificationStatus,
);

// ================= CONFIG =================
router.get("/config", configCtrl.getPublicConfig);

// ================= USERS =================
router.get("/users/search", auth, friendCtrl.searchUsers);
router.get("/users/friends", auth, friendCtrl.getFriends);
router.post("/users/friends/request", auth, friendCtrl.sendFriendRequest);
router.post("/users/friends/respond", auth, friendCtrl.respondFriendRequest);
router.put("/users/profile", auth, userCtrl.updateProfile);
router.post(
  "/users/avatar",
  auth,
  upload.single("avatar"),
  userCtrl.uploadAvatar,
);

// ================= EVENTS =================
router.get("/events", auth, eventCtrl.getEvents);
router.post(
  "/events",
  auth,
  validate(validations.createEventSchema),
  eventCtrl.createEvent,
);
router.get("/events/:id", auth, eventCtrl.getEventById);
router.post("/events/:id/join", auth, eventCtrl.joinEvent);

// ✅ UPDATED / NEW
router.get("/events/search", auth, eventCtrl.searchEvents);
router.post("/events/:id/cancel", auth, eventCtrl.cancelEvent);
router.put(
  "/events/:id/approve",
  auth,
  requireRole("admin"),
  eventCtrl.approveEvent,
);

// ================= ROOMS =================
router.get("/rooms/:id", auth, roomCtrl.getRoom);

// ✅ UPDATED / NEW
router.post("/rooms/create-direct", auth, roomCtrl.createDirectRoom);
router.post("/rooms/:roomId/invite", auth, roomCtrl.inviteFriendsToRoom);
router.post("/rooms/join", auth, roomCtrl.joinRoom);

// Existing
router.post(
  "/rooms/:roomId/screenshot",
  auth,
  upload.single("image"),
  roomCtrl.uploadScreenshot,
);
router.post("/rooms/screenshot/verify", auth, roomCtrl.verifyScreenshot);
router.post(
  "/rooms/mediator-decision",
  auth,
  requireRole("mediator", "admin"),
  roomCtrl.mediatorDecision,
);

// ================= CHAT =================
router.get("/rooms/:roomId/messages", auth, chatCtrl.getMessages);
router.post("/rooms/:roomId/messages", auth, chatCtrl.sendMessage);

// ================= WALLET =================
router.get("/wallet", auth, walletCtrl.getWallet);
router.post("/wallet/setup", auth, walletCtrl.setupWalletPassword);

// ✅ UPDATED (2FA + Device Check)
router.post(
  "/wallet/transfer",
  auth,
  checkDeviceFingerprint,
  require2FAForLargeTransfer,
  validate(validations.transferSchema),
  walletCtrl.transferTokens,
);

router.get("/wallet/transactions", auth, walletCtrl.getTransactions);
router.post(
  "/wallet/withdraw",
  auth,
  upload.single("kyc"),
  withdrawCtrl.requestWithdrawal,
);

// ✅ NEW
router.get("/wallet/withdrawals", auth, walletCtrl.getWithdrawalStatus);

// ================= KYC =================
router.post(
  "/kyc/submit",
  auth,
  kycUpload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  kycCtrl.submitKYC,
);

router.get("/kyc/me", auth, kycCtrl.getMyKYC);

// Admin KYC
router.get(
  "/admin/kyc/pending",
  auth,
  requireRole("admin"),
  kycCtrl.getPendingKYC,
);
router.put("/admin/kyc/:kycId", auth, requireRole("admin"), kycCtrl.reviewKYC);

// ================= BLOG =================
router.get("/blogs", auth, blogCtrl.getBlogs);
router.get("/blogs/:slug", auth, blogCtrl.getBlogBySlug);
router.post(
  "/blogs",
  auth,
  requireRole("partner", "admin"),
  validate(validations.createBlogSchema),
  blogCtrl.createBlog,
);
router.post(
  "/blogs/:blogId/submit",
  auth,
  requireRole("partner"),
  blogCtrl.submitForApproval,
);
router.put(
  "/blogs/:blogId/review",
  auth,
  requireRole("admin"),
  blogCtrl.reviewBlog,
);

// ================= SUBSCRIPTIONS =================
router.get("/subscriptions/plans", auth, subCtrl.getPlans);
router.post("/subscriptions/order", auth, subCtrl.createOrder);
router.post("/subscriptions/verify", auth, subCtrl.verifyAndActivate);

// ================= NOTIFICATIONS =================
router.get("/notifications", auth, notifCtrl.getNotifications);
router.put("/notifications/:id/read", auth, notifCtrl.markAsRead);
router.delete("/notifications/:id", auth, notifCtrl.deleteNotification);
router.get("/notifications/unread-count", auth, notifCtrl.getUnreadCount);

// ================= ADMIN =================
router.get(
  "/admin/stats",
  auth,
  requireRole("admin"),
  adminCtrl.getDashboardStats,
);
router.get(
  "/admin/pending-approvals",
  auth,
  requireRole("admin"),
  adminCtrl.getPendingApprovals,
);
router.get("/admin/users", auth, requireRole("admin"), adminCtrl.getAllUsers);
router.put(
  "/admin/users/:userId",
  auth,
  requireRole("admin"),
  adminCtrl.manageUser,
);

router.post(
  "/admin/pricing",
  auth,
  requireRole("admin"),
  validate(validations.pricingPlanSchema),
  adminCtrl.createPricingPlan,
);
router.put(
  "/admin/pricing/:planId",
  auth,
  requireRole("admin"),
  adminCtrl.updatePricingPlan,
);
router.delete(
  "/admin/pricing/:planId",
  auth,
  requireRole("admin"),
  adminCtrl.deletePricingPlan,
);

router.get(
  "/admin/withdrawals",
  auth,
  requireRole("admin"),
  withdrawCtrl.getWithdrawals,
);
router.put(
  "/admin/withdrawals/:withdrawalId",
  auth,
  requireRole("admin"),
  withdrawCtrl.processWithdrawal,
);

// ✅ NEW ADMIN CONFIG
router.put(
  "/admin/config",
  auth,
  requireRole("admin"),
  configCtrl.updateConfig,
);

// ================= PLACEHOLDER =================
router.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

export default router;
