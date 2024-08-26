const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const User = require("../models/userModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//function to upload to cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return reject(error);
        }
        //   console.log("Upload to Cloudinary successful:", result.secure_url);
        resolve(result.secure_url);
      }
    );
    streamifier
      .createReadStream(fileBuffer)
      .pipe(uploadStream)
      .on("error", (error) => {
        console.error("Stream error:", error);
        reject(error);
      });
  });
};

//function to delete from cloudinary
const deleteFromCloudinary = async (publicID) => {
  try {
    await cloudinary.uploader.destroy(publicID);
    console.log("Deleted from Cloudinary successfully");
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

const signup = async (req, res) => {
  // console.log("request:", req.body);
  //   console.log("uploaded file:", req.file);
  try {
    const { userName, userEmail, userPassword, userPhoneNumber, userBio } =
      req.body;
    let userProfilePicture = req.file ? req.file.buffer : null;

    if (!userName || !userEmail || !userPassword || !userPhoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // create user
    const user = await User.create({
      userName,
      userEmail,
      userPassword: hashedPassword,
      userPhoneNumber,
      userProfilePicture: null,
      userBio: userBio || null,
    });

    res.status(201).json({ message: "User signed up successfully", user });

    if (userProfilePicture) {
      // console.log("Uploading profile picture...");
      process.nextTick(async () => {
        try {
          const profilePictureUrl = await uploadToCloudinary(
            userProfilePicture,
            "bookShelf/user_profile_pictures"
          );
          //   console.log('req.file.buffer:', req.file.buffer);
          await user.update({ userProfilePicture: profilePictureUrl });
          //   console.log("Profile picture uploaded successfully");
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
        }
      });
    }

    // res.status(201).json({ message: "User signed up successfully", user });
  } catch (error) {
    console.error("Error signing up user");
    console.error(error);
    res.status(500).json({ error: "Error signing up user" });
  }
};

const login = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    // console.log("User email:", userEmail);
    // console.log("User password:", userPassword);
    if (!userEmail || !userPassword) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { userEmail } });

    if (!user) {
      console.log("Invalid email");
      return res.status(404).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      console.log("Invalid password");
      return res.status(404).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userID: user.userID, userName: user.userName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true, // to prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production", // to send cookie only over HTTPS in production
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      //   token,
      user: {
        userID: user.userID,
        userName: user.userName,
        userEmail: user.userEmail,
        userPhoneNumber: user.userPhoneNumber,
        userProfilePicture: user.userProfilePicture,
        userBio: user.userBio,
        // userLocation: user.userLocation,
        // userPaymentMethod: user.userPaymentMethod
      },
    });
  } catch (error) {
    console.error("Error logging in user");
    console.error(error);
    res.status(500).json({ error: "Error logging in user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = req.user;
    const {
      userName,
      userEmail,
      userPhoneNumber,
      userBio,
      userLocation,
      userPaymentMethod,
    } = req.body;

    // console.log(req.body);
    let userProfilePicture = req.file ? req.file.buffer : null;

    // const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // console.log("User:", user);

    await user.update({
      userName: userName || user.userName,
      userEmail: userEmail || user.userEmail,
      userPhoneNumber: userPhoneNumber || user.userPhoneNumber,
      userBio: userBio || user.userBio,
      userLocation: userLocation || user.userLocation,
      userPaymentMethod: userPaymentMethod || user.userPaymentMethod,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        userID: user.userID,
        userName: user.userName,
        userEmail: user.userEmail,
        userPhoneNumber: user.userPhoneNumber,
        userProfilePicture: user.userProfilePicture,
        userBio: user.userBio,
        // userLocation: user.userLocation,
        // userPaymentMethod: user.userPaymentMethod
      },
    });

    if (userProfilePicture) {
      process.nextTick(async () => {
        try {
          // delete old profile picture if it exists
          if (user.userProfilePicture) {
            const oldPublicID = user.userProfilePicture
              .split("/")
              .pop()
              .split(".")[0];
            await deleteFromCloudinary(oldPublicID);
          }

          const profilePictureUrl = await uploadToCloudinary(
            userProfilePicture,
            "bookShelf/user_profile_pictures"
          );
          await user.update({ userProfilePicture: profilePictureUrl });
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res
            .status(500)
            .json({ error: "Error uploading profile picture" });
        }
      });
    }
  } catch (error) {
    console.error("Error updating user");
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // const userID= req.user.id;
    // const user = await User.findByPk(userID);
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.userProfilePicture) {
      const publicID = user.userProfilePicture.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicID);
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user");
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user");
    console.error(error);
    res.status(500).json({ error: "Error logging out user" });
  }
};

const fetchUserWithUserIDorUserName = async (req, res) => {
  try {
    const { userID, userName } = req.query;
    // console.log("userID:", userID);
    // console.log("userName:", userName);
    if (!userID && !userName) {
      return res.status(400).json({ error: "userID or userName is required" });
    }

    let user;
    if (userID) {
      user = await User.findByPk(userID);
    } else {
      user = await User.findOne({ where: { userName } });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Error fetching user with userID");
    console.error(error);
    return null;
  }
};

module.exports = {
  signup,
  login,
  updateUser,
  deleteUser,
  logoutUser,
  fetchUserWithUserIDorUserName,
};
