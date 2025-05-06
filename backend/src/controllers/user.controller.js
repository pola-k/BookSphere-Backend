import User from "../models/user.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
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
 


const GetUser = async (req, res) => {
  try {
    // return res.status(200).json({message:"profile mil gai"})
    // 1. Verify the HTTP-only cookie (JWT token)


    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // return res.status(200).json({message:"profile mil gai"});
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if requested user ID matches token's userId (prevent data leaks)
    // return res.status(200).json({ my_id : decoded.id,
        // });
    if (decoded.id !== req.params.user_id) {
      return res.status(403).json({ error: "forbidden: You can only access your own profile" });
    }

    // 4. Fetch user from database
    const user = await User.findOne(
      {
      where: { 

        id:req.params.user_id
      },
        attributes: { exclude: ['password', 'resetToken'] }
      });

    if (!user) {
      return res.status(404).json({ error: "User  is not found" });
    }

    // 5. Return safe user data
    return res.status(200).json({
      id: user.id,
      username: user.username,
      fullName: user.name,
      description: user.bio || "", // Handle null values
      imageUrl: user.image || "/images/default-profile-image.jpg" // Fallback image
    });

  } catch (error) {
    console.error("Profile API error:", error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
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


export  {GetUser , signup , Login , Logout}

