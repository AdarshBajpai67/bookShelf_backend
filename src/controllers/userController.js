const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const User = require("../models/userModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const signup = async (req, res) => {
  try {
    const { username, userEmail, userPassword, userPhoneNumber, userBio } =
      req.body;
    let userProfilePicture = req.file ? req.file.path : null;
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    if (!username || !userEmail || !userPassword || !userPhoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create the user first
    const user = await User.create({
      username,
      userEmail,
      userPassword: hashedPassword,
      userPhoneNumber,
      userProfilePicture: null,
      userBio: userBio || null,
    });

    if (userProfilePicture) {
      cloudinary.uploader
        .upload(userProfilePicture, {
          folder: "bookShelf/user_profile_pictures",
        })
        .then((uploadedResponse) => {
          user.update({ userProfilePicture: uploadedResponse.secure_url });
        })
        .catch((error) => {
          console.error("Error uploading to Cloudinary:", error);
        });
    }

    res.status(201).json({ message: "User signed up successfully", user });
  } catch (error) {
    console.error("Error signing up user");
    console.error(error);
    res.status(500).json({ error: "Error signing up user" });
  }
};

const login = async (req, res) => {
  try {
    console.log(req.body);
    const { userEmail, userPassword } = req.body;
    console.log("User email:", userEmail);
    console.log("User password:", userPassword);
    if (!userEmail || !userPassword) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { userEmail } });

    if (!user) {
      console.log("Invalid email");
      return res.status(404).json({ error: "Invalid emaill or password" });
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      console.log("Invalid password");
      return res.status(404).json({ error: "Invalid email or passwordd" });
    }

    const token = jwt.sign(
      { userID: user.userID, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie('token', token, { 
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
        maxAge: 3600000 // 1 hour expiration time
      });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userID: user.userID,
        username: user.username,
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
    const userID= req.user.id;
    const {
      username,
      userEmail,
      userPhoneNumber,
      userBio,
      userLocation,
      userPaymentMethod,
    } = req.body;
    let userProfilePicture = req.file ? req.file.path : null;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({
      username: username || user.username,
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
        username: user.username,
        userEmail: user.userEmail,
        userPhoneNumber: user.userPhoneNumber,
        userProfilePicture: user.userProfilePicture,
        userBio: user.userBio,
        // userLocation: user.userLocation,
        // userPaymentMethod: user.userPaymentMethod
      },
    });

    if (userProfilePicture) {
      try {
        // Remove the old profile picture from Cloudinary if it exists
        if (user.userProfilePicture) {
          const oldPublicID = user.userProfilePicture
            .split("/")
            .pop()
            .split(".")[0];
          try {
            await cloudinary.uploader.destroy(oldPublicID);
            console.log("Old profile picture deleted successfully");
          } catch (error) {
            console.error("Error deleting old profile picture:", error);
          }
        }

        const uploadedResponse = await cloudinary.uploader.upload(
          userProfilePicture,
          {
            folder: "bookShelf/user_profile_pictures",
          }
        );

        await user.update({ userProfilePicture: uploadedResponse.secure_url });
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res
          .status(500)
          .json({ error: "Error uploading profile picture" });
      }
    }
  } catch (error) {
    console.error("Error updating user");
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userID= req.user.id;
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.userProfilePicture) {
      const publicID = user.userProfilePicture.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicID);
        console.log("Profile picture deleted successfully");
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user");
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

const logoutUser=async(req,res)=>{
    try{
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: 'User logged out successfully' });
    }catch(error){
        console.error('Error logging out user');
        console.error(error);
        res.status(500).json({error:'Error logging out user'});
    }
}

module.exports = { signup, login, updateUser, deleteUser, logoutUser };
