import User from "../models/user.js";

const GetUser = async (req, res) => {

  try {
    const userId = req.query.id;
    if(!userId) {
      return res.status(400).json({ message: "User id is required " });
    }
    // const user = await User.findByPk(userId);
    
    const user = await User.findOne({ where: { id: userId } });
    if(!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  }
  catch (error) {
    return res.status(500).json({error: error.message || "Internal server error" });
  }
};
const Signup = async (req, res) => {
  try {
    const { username, email, password, name, bio, image } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      bio: bio || "", // Default to empty string if not provided
      image: image || "", // Default to empty string if not provided
    });

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
export default GetUser;
