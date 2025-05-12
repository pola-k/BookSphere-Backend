import User from "../models/user.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { s3 } from "../db.js"
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs"
import path from "path"
import PaymentPlan from "../models/payment_plan.js";


dotenv.config();
const GetUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id !== req.params.user_id) {
      return res.status(403).json({ error: "Forbidden: You can only access your own profile" });
    }

    const user = await User.findOne({
      where: { id: req.params.user_id },
      attributes: { exclude: ['password', 'resetToken'] }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let imageUrl = "/images/default-profile-image.jpg"; // fallback
    if (user.image) {
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: user.image,
        });
        imageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      } catch (err) {
        console.error("Failed to generate signed URL for image:", err);
      }
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      fullName: user.name,
      description: user.bio || "",
      imageUrl
    });

  } catch (error) {
    console.error("Profile API error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
const signup = async (req, res) => {
  try {
    const { name,username,password,email}= req.body;
    const uid = uuidv4();
    if(!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if(!email)
    {
      return res.status(400).json({message : "email is required"});
    }
    if(!name)
    {
      return res.status(400).json({message : "name is not entered"});
    }

    if (!username || !email || !password   || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username   already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      id: uid,
      username,
      email,
      name ,
      password: hashedPassword,
      bio:  "", // Default to empty string if not provided
      image:  "", // Default to empty string if not provided
    });

    const you = process.env.JWT_SECRET;

    // return res.status(200).json({message : you});
    const token = jwt.sign(

       { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
       { expiresIn: "1h" }
     );
     res.cookie("token", token, {
      httpOnly: false,    // Cannot be accessed by JS
      secure: false,      // Enable in production (HTTPS only)
      sameSite: 'Lax', // Prevent CSRF
      });
    return res.status(201).json({ 
      message: "User created successfully", 
      user_id: newUser.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
    // return res.status(500).json({ error: "Internal server error" });
  }
};
const Login = async (req, res) => {
  try {
    const {email,password} = req.body;




    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }


    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // Replace with an environment variable in production
      { expiresIn: "1h" }
    );


// Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: false,    // Cannot be accessed by JS
      secure: false,      // Enable in production (HTTPS only)
      sameSite: 'Lax', // Prevent CSRF
    });
    // Send user_id to frontend (for sessionStorage)
    return res.status(200).json({ 
      success: true,
      user_id: user.id  // Frontend will store this in sessionStorage
    });
    // return res.status(200).json({ 
    //   message: "Login successful", 
    //   token,
    //   user: {
    //     id: user.id, // Include UUID
    //     username: user.username, 
    //     email: user.email, 
    //     name: user.name, 
    //     bio: user.bio, 
    //     image: user.image 
    //   }
    // });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
 


const GetUserDetails = async (req, res) => {
  try 
  {
    const token = req.cookies?.token;
    if (!token) 
    {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne(
      {
      where: { 

        id:decoded.id
      },
        attributes: ['id', 'image', 'username']
      });

    if (!user) {
      return res.status(404).json({ error: "User  is not found" });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      user_img: user.image || "/images/default-profile-image.jpg"
    });

  } 
  catch (error) 
  {
    console.error("User Details API error:", error);

    if (error.name === 'JsonWebTokenError') 
    {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') 
    {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};


const Logout = (req, res) => {
  try {
    // Clear the cookie named "token"
    res.clearCookie("token", {
      httpOnly: false,  // match your login settings
      secure: false,    // match your login settings
      sameSite: 'Lax'
    });

    // Optionally: instruct client to remove any stored user_id/sessionStorage
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
const updateProfile = async (request, response) => {
  const logPrefix = "[updateProfile]";
  let uploadedFilename = "";

  try {
    console.log(`${logPrefix} Request body:`, request.body);
    console.log(`${logPrefix} Request file:`, request.file);

    const { user_id, name,bio ,email, password } = request.body;
    const file = request.file; // Handling a single file upload

    if (!user_id) {
      console.log(`${logPrefix} User ID missing`);
      return response.status(400).json({ message: "user_id is required" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      console.log(`${logPrefix} User not found`);
      return response.status(404).json({ message: "User not found" });
    }

    // Helper to delete from R2 if an old image exists
    const deleteFromR2 = async (key) => {
      try {
        console.log(`${logPrefix} Deleting from R2:`, key);
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key
        }));
      } catch (err) {
        console.error(`${logPrefix} failed to delete ${key} from R2`, err);
      }
    };

    // Delete the old image if it exists
    if (user.image) {
      console.log(`${logPrefix} Deleting existing image from R2`);
      await deleteFromR2(user.image);
    }

    // Upload the new file to R2
    if (file) {
      console.log(`${logPrefix} Uploading new file:`, file.filename);
      const key = `uploads/${file.filename}`; // Save files in the "uploads" folder
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
        ACL: 'private', // Keep the file private
      };

      try {
        await s3.send(new PutObjectCommand(uploadParams));
        uploadedFilename = key; // Store the uploaded file's key
        // Clean up the local file after successful R2 upload
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting temporary file: ${file.path}`, err);
          } else {
            console.info(`Successfully deleted temporary file: ${file.path}`);
          }
        });
      } catch (uploadErr) {
        console.error(`${logPrefix} Error uploading to R2:`, uploadErr);
        fs.unlink(file.path, (err) => console.error(`Error deleting file after failed upload: ${file.path}`, err));
        return response.status(500).json({ message: "Error uploading image. Please try again." });
      }
    }

    // Prepare user update data
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if(bio) updates.bio = bio;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // If an image was uploaded, save its filename (path) in the database
    if (uploadedFilename) {
      updates.image = uploadedFilename;
    }

    // Update user in the database
    const updatedUser = await user.update(updates);

    // Generate signed URL for the uploaded image
    let signedImageUrl = null;
    if (updatedUser.image) {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: updatedUser.image,
      });

      signedImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour
    }

    return response.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        image: signedImageUrl // Return signed URL for the uploaded image
      },
    });

  } catch (err) {
    console.error(`${logPrefix} Error occurred:`, err);

    // Rollback file deletion from R2 in case of error
    if (uploadedFilename) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uploadedFilename,
      }));
    }

    return response.status(500).json({
      message: err.message || "Could not update profile. Please try again.",
    });
  }
};

const SubscribeUser = async (req, res) => {
  const { user_id, plan_id } = req.body;

  try {
      // Validate user
      const user = await User.findByPk(user_id);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // Validate payment plan
      const paymentPlan = await PaymentPlan.findByPk(plan_id);
      if (!paymentPlan) {
          return res.status(404).json({ error: "Payment Plan not found" });
      }

      // Update user's payment plan
      user.plan_id = plan_id;
      await user.save();

      return res.status(200).json({ message: "User subscribed to the payment plan successfully", user });
  } catch (error) {
      return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};





export  {GetUserDetails, GetUser ,updateProfile, signup , Login , Logout, SubscribeUser}

