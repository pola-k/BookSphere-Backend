import express from "express";
import multer from "multer";
import { upload } from "../middleware/multer.middleware.js";
import {
    GetComments,
    CreateComment,
    DeleteComment,
    EditComment,
    ToggleCommentLike,
} from "../controllers/comments.controller.js";
import {
    GetSinglePost,
    GetPosts,
    CreateTextPost,
    CreateMediaPost,
    DeletePost, TogglePostLike,
} from "../controllers/posts.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { GetUser, signup,updateProfile, Login, GetUserDetails, Logout, SubscribeUser } from "../controllers/user.controller.js";
import {SavePost,UnsavePost,GetSavedPosts} from "../controllers/savedPost.controller.js";
import { GetSearchResults } from "../controllers/search.controller.js";
import { GetPaymentPlan, AddPaymentPlan, DeletePaymentPlan } from "../controllers/paymentPlan.controller.js";
const router = express.Router();

// 🗨️ Comment routes
router.get("/get-comments", GetComments);
router.post("/create-comment", CreateComment);
router.delete("/delete-comment", DeleteComment);
router.put("/edit-comment", EditComment);
router.put("/toggle-comment-like", ToggleCommentLike);

// user ki profile ka data access karna 
router.get("/profile/:user_id", GetUser)
router.get("/user/getUserDetails", GetUserDetails)

router.get("/get-single-post", GetSinglePost)
router.get("/get-posts", GetPosts)
router.post("/create-text-post", CreateTextPost)
router.post("/create-media-post", upload.array("media[]", 10), (req, res, next) => {
    try {
        CreateMediaPost(req, res);
    } catch (err) {
        next(err);
    }
});

router.post("/updateProfile",upload.single("profile_pic"), (req, res, next) => {
  try {
      updateProfile(req, res);
  }
  catch (err) {
      next(err);
  }
  
});

router.delete("/delete-post", DeletePost);

// 🔐 Auth routes
router.post("/signup", signup);
router.post("/login", Login);

// 🔖 Saved post routes (✅ Secured with authMiddleware)
router.post("/save-post", authMiddleware, SavePost);
router.post("/unsave-post", authMiddleware, UnsavePost);
router.get("/get-saved-posts", authMiddleware, GetSavedPosts);

router.get("/payment-plans", GetPaymentPlan);
router.post("/payment-plans", AddPaymentPlan);
router.delete("/payment-plans/:id", DeletePaymentPlan);

router.post("/subscribe-user", SubscribeUser);


// ❗ Custom error handler
router.use((err, req, res, next) => {
    if (err.status === 400) {
        return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
});

router.delete("/delete-post", DeletePost)
router.put("/toggle-post-like", TogglePostLike)

// new user created
router.post("/logout",Logout)

router.get("/search", GetSearchResults);
export default router
