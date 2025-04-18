// api/index.js

import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { body, param, validationResult } from 'express-validator';

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Format validation errors to match existing frontend error handling
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Your frontend expects an error property, not an errors array
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Middleware to verify JWT token sent by the client
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // attaching the user id to the request object, this will make it available in the endpoints that use this middleware
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

const validateRegistration = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors
];

app.post("/register", validateRegistration, async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true },
  });

  const payload = { userId: newUser.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  res.json(newUser);
});

const validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

app.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  // password: 123456
  // user.password: $2b$10$naV1eAwirV13nyBYVS96W..52QzN8U/UQ7mmi/IEEVJDtCAdDmOl2
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  // ensure that the password is not sent to the client
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  res.json(userData);
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

// Add validation rules for posts
const validatePost = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters')
    .trim(),
  body('content')
    .optional()
    .isString().withMessage('Content must be text'),
  handleValidationErrors
];

// Add post ownership verification middleware
const verifyPostOwnership = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Check if ID is valid
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (post.userId !== req.userId) {
      return res.status(403).json({ error: "You don't have permission to access this post" });
    }
    
    // If we get here, the user owns the post
    next();
  } catch (error) {
    console.error("Ownership verification error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

app.get("/posts", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.post("/posts", requireAuth, validatePost, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content } = req.body;
    
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.get("/posts/:id", requireAuth, verifyPostOwnership, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
    });
    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Failed to retrieve post" });
  }
});

app.put("/posts/:id", requireAuth, verifyPostOwnership, validatePost, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    res.json(updatedPost);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

app.delete("/posts/:id", requireAuth, verifyPostOwnership, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deletedPost = await prisma.post.delete({
      where: { id },
    });
    res.json(deletedPost);
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// New endpoint for social feed (shows all posts including the user's own)
app.get("/feed", requireAuth, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get all posts ordered by creation date
    const posts = await prisma.post.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const totalPosts = await prisma.post.count();
    
    res.json({
      posts: posts,
      pagination: {
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
        currentPage: page,
        limit: limit
      }
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

app.get("/feed/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Get feed post error:", error);
    res.status(500).json({ error: "Failed to retrieve post" });
  }
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
