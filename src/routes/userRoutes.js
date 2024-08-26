const express = require("express");
const cors = require("cors");
const multer = require("multer");

const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/signup",
  upload.single("userProfilePicture"),
  userController.signup
);
router.post("/login", userController.login);
router.put(
  "/update/",
  upload.single("userProfilePicture"),
  authMiddleware,
  userController.updateUser
);
router.delete("/delete/", authMiddleware, userController.deleteUser);
router.post("/logout", authMiddleware, userController.logoutUser);
router.get("/fetchuser", userController.fetchUserWithUserIDorUserName);

module.exports = router;
