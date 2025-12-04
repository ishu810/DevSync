import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const isEmail = (input) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(input);

//  Register a new user
export const registerUser = async (req, res) => {
  console.log('Incoming registration body:', req.body);
  const { username, email, password, role = 'citizen' } = req.body;

    if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }
  if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

  try {
    
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: 'User already exists with that email or username.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Create JWT
    const payload = {
       user: { id: user._id, role: user.role, username: user.username },
     };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        msg: 'User registered successfully',
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// login logic
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; 

  try {
    //  Validate inputs
    if (!identifier || !password) {
      return res.status(400).json({ msg: "Email/Username and password are required" });
    }

    //  Find user by email or username
    let user;
    if (isEmail(identifier)) {
      user = await User.findOne({ email: identifier.trim().toLowerCase() });
    } else {
      user = await User.findOne({ username: identifier.trim() });
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    //  Compare password securely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    //  Create JWT payload
    const payload = {
      user: { id: user._id, role: user.role, username: user.username },
    };

    //  Sign and send token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;

      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

