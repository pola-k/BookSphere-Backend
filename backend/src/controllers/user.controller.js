import User from "../models/user.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const GetUser = async (req, res) => {
  try {
    const userId = req.params.id;  // ✅ Corrected line
    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user); // Or `{ user }` if frontend expects it nested
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

const signup = async (req, res) => {
  try {

    const  username= req.query.username;
    const  email = req.query.email;
    const  password = req.query.password;
    const  bio = req.query.bio;
    const  name = req.query.name;
    const  image= req.query.image;

    const uid = uuidv4();
    if(!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if(!email)
    {
      return res.status(400).json({message : "email is required"});
    }

    if (!username || !email || !password || !name) {
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
      password: hashedPassword,
      name,
      bio: bio || "", // Default to empty string if not provided
      image: image || "", // Default to empty string if not provided
    });

    const you = process.env.JWT_SECRET;

    // return res.status(200).json({message : you});
    const token = jwt.sign(

       { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
       { expiresIn: "1h" }
     );

    return res.status(201).json({ 
      message: "User created successfully", 
      token,
      user: { 
        id: newUser.id, // Include UUID
        username: newUser.username, 
        email: newUser.email, 
        name: newUser.name, 
        bio: newUser.bio, 
        image: newUser.image 
      }
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

    return res.status(200).json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.id, // Include UUID
        username: user.username, 
        email: user.email, 
        name: user.name, 
        bio: user.bio, 
        image: user.image 
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
export  {GetUser , signup , Login}

