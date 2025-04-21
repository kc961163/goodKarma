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

// Like a post
app.post("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ error: "You have already liked this post" });
    }
    
    // Create the like
    const like = await prisma.like.create({
      data: {
        postId,
        userId
      }
    });
    
    res.status(201).json(like);
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// Unlike a post
app.delete("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Find the like
    const like = await prisma.like.findFirst({
      where: {
        postId,
        userId
      }
    });
    
    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }
    
    // Delete the like
    await prisma.like.delete({
      where: {
        id: like.id
      }
    });
    
    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Failed to unlike post" });
  }
});

// Get likes for a post and check if user has liked
app.get("/posts/:id/likes", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Count likes
    const likesCount = await prisma.like.count({
      where: {
        postId
      }
    });
    
    // Check if user has liked
    const userLike = await prisma.like.findFirst({
      where: {
        postId,
        userId
      }
    });
    
    res.json({
      count: likesCount,
      userLiked: !!userLike
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
});

// Get all comments for a post
app.get("/posts/:id/comments", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Verify the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Get all comments for this post
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        // Only get top-level comments (no parentId)
        parentId: null 
      },
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
        },
        // Include replies (nested comments)
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add validation for comments
const validateComment = [
  body('content')
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 1000 }).withMessage('Comment is too long (max 1000 characters)'),
  handleValidationErrors
];

// Create a comment
app.post("/posts/:id/comments", requireAuth, validateComment, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    const { content, parentId } = req.body;
    
    // Verify the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // If this is a reply, verify the parent comment exists and belongs to this post
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) }
      });
      
      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
        parentId: parentId ? parseInt(parentId) : null
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
    
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Comment ownership verification middleware
const verifyCommentOwnership = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    
    // Check if ID is valid
    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            userId: true
          }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Allow if user is the comment author OR the post owner
    if (comment.userId === req.userId || comment.post.userId === req.userId) {
      // If we get here, the user can modify the comment
      next();
    } else {
      return res.status(403).json({ error: "You don't have permission to modify this comment" });
    }
  } catch (error) {
    console.error("Comment ownership verification error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update a comment (only the author can update)
app.put("/comments/:id", requireAuth, validateComment, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.userId;
    
    // Only the author can update the comment (not the post owner)
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }
    
    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
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
    
    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete a comment (author or post owner can delete)
app.delete("/comments/:id", requireAuth, verifyCommentOwnership, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    
    // Delete the comment
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId }
    });
    
    res.json(deletedComment);
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Get comment count for a post
app.get("/posts/:id/comments/count", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Count all comments for this post
    const commentCount = await prisma.comment.count({
      where: { postId }
    });
    
    res.json({ count: commentCount });
  } catch (error) {
    console.error("Error counting comments:", error);
    res.status(500).json({ error: "Failed to count comments" });
  }
});

// Get coaching data for a user
app.get("/users/:userId/coaching", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user can only access their own data
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to coaching data" });
    }
    
    // Find coaching data for the user
    const coachingData = await prisma.coachingData.findUnique({
      where: { userId }
    });
    
    res.json(coachingData || { userId });
  } catch (error) {
    console.error("Error fetching coaching data:", error);
    res.status(500).json({ error: "Failed to retrieve coaching data" });
  }
});

// Create or update coaching data
app.post("/users/:userId/coaching", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user can only modify their own data
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to coaching data" });
    }
    
    const { userProfile, goals, advice, progress } = req.body;
    
    // Get current data for API limit tracking
    const currentData = await prisma.coachingData.findUnique({
      where: { userId }
    });
    
    // Check if we're in a new month for advice call
    const currentMonth = new Date().getMonth();
    const lastAdviceMonth = currentData?.lastAdviceCallDate 
      ? new Date(currentData.lastAdviceCallDate).getMonth() 
      : -1;
    const resetAdviceCall = currentMonth !== lastAdviceMonth;
    
    // Check if we're in a new month for progress call
    const lastProgressMonth = currentData?.lastProgressCallDate 
      ? new Date(currentData.lastProgressCallDate).getMonth() 
      : -1;
    const resetProgressCall = currentMonth !== lastProgressMonth;
    
    // Upsert coaching data (update if exists, create if doesn't)
    const coachingData = await prisma.coachingData.upsert({
      where: { userId },
      update: {
        // Only update fields that are provided
        ...(userProfile && { userProfile }),
        ...(goals && { goals }),
        
        // Update advice data and mark API call as used
        ...(advice && { 
          advice,
          adviceCallUsedThisMonth: true,
          lastAdviceCallDate: new Date(),
        }),
        
        // Update progress data and mark API call as used
        ...(progress && { 
          progress,
          progressCallUsedThisMonth: true,
          lastProgressCallDate: new Date(),
        }),
        
        // Reset advice call limit if we're in a new month
        ...(resetAdviceCall && { 
          adviceCallUsedThisMonth: advice ? true : false,
        }),
        
        // Reset progress call limit if we're in a new month
        ...(resetProgressCall && { 
          progressCallUsedThisMonth: progress ? true : false,
        }),
      },
      create: {
        userId,
        ...(userProfile && { userProfile }),
        ...(goals && { goals }),
        ...(advice && { 
          advice,
          adviceCallUsedThisMonth: true,
          lastAdviceCallDate: new Date(),
        }),
        ...(progress && { 
          progress,
          progressCallUsedThisMonth: true,
          lastProgressCallDate: new Date(),
        }),
      }
    });
    
    res.json(coachingData);
  } catch (error) {
    console.error("Error updating coaching data:", error);
    res.status(500).json({ error: "Failed to update coaching data" });
  }
});

app.get("/users/:userId/coaching/api-status", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const coachingData = await prisma.coachingData.findUnique({
      where: { userId },
      select: { 
        adviceCallUsedThisMonth: true,
        progressCallUsedThisMonth: true,
        lastAdviceCallDate: true,
        lastProgressCallDate: true
      }
    });
    
    if (!coachingData) {
      return res.json({
        canMakeAdviceCall: true,
        canMakeProgressCall: true,
        nextAdviceResetDate: null,
        nextProgressResetDate: null
      });
    }
    
    // Check if this is a new month since the last advice call
    const currentMonth = new Date().getMonth();
    const lastAdviceMonth = coachingData.lastAdviceCallDate 
      ? new Date(coachingData.lastAdviceCallDate).getMonth() 
      : -1;
    
    // Check if this is a new month since the last progress call
    const lastProgressMonth = coachingData.lastProgressCallDate 
      ? new Date(coachingData.lastProgressCallDate).getMonth() 
      : -1;
    
    // Calculate next reset date (1st of next month)
    const today = new Date();
    const nextResetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Can make API calls if never used before OR in a new month
    const canMakeAdviceCall = !coachingData.adviceCallUsedThisMonth || currentMonth !== lastAdviceMonth;
    const canMakeProgressCall = !coachingData.progressCallUsedThisMonth || currentMonth !== lastProgressMonth;
    
    res.json({
      canMakeAdviceCall,
      canMakeProgressCall,
      nextResetDate: nextResetDate
    });
  } catch (error) {
    console.error("Error checking API status:", error);
    res.status(500).json({ error: "Failed to check API status" });
  }
});

// Get coaching progress
app.get("/users/:userId/coaching/progress", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to coaching progress" });
    }
    
    const coachingData = await prisma.coachingData.findUnique({
      where: { userId },
      select: { progress: true }
    });
    
    res.json(coachingData?.progress || null);
  } catch (error) {
    console.error("Error fetching coaching progress:", error);
    res.status(500).json({ error: "Failed to retrieve coaching progress" });
  }
});

// Update coaching progress
app.post("/users/:userId/coaching/progress", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to coaching progress" });
    }
    
    // Extract both progress data and updated insights
    const { progress, updatedAdvice } = req.body;
    
    // Get current coaching data to ensure we have the latest advice
    const currentData = await prisma.coachingData.findUnique({
      where: { userId },
      select: { advice: true }
    });
    
    // Update both progress AND advice fields
    const coachingData = await prisma.coachingData.upsert({
      where: { userId },
      update: { 
        progress,
        // Use updatedAdvice which should already contain merged data
        ...(updatedAdvice && { advice: updatedAdvice }),
        progressCallUsedThisMonth: true,
        lastProgressCallDate: new Date()
      },
      create: { 
        userId, 
        progress,
        ...(updatedAdvice && { advice: updatedAdvice }),
        progressCallUsedThisMonth: true,
        lastProgressCallDate: new Date()
      }
    });
    
    res.json(coachingData);
  } catch (error) {
    console.error("Error updating coaching progress:", error);
    res.status(500).json({ error: "Failed to update coaching progress" });
  }
});

// Get karma statistics for a user
app.get("/users/:userId/karma-stats", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user can only access their own data
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Get all user's posts
    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        likes: true
      }
    });
    
    // Initialize category counters
    const categories = {
      meditation: 0,
      journaling: 0,
      yoga: 0,
      volunteering: 0,
      donation: 0
    };
    
    // Helper function to extract deed type from post content
    const extractDeedMetadata = (contentStr) => {
      if (!contentStr) return null;
      
      const metadataMatch = contentStr.match(/<!-- DEED_METADATA:(.*?) -->/);
      if (!metadataMatch || !metadataMatch[1]) return null;
      
      try {
        return JSON.parse(metadataMatch[1]);
      } catch (e) {
        console.error("Error parsing deed metadata:", e);
        return null;
      }
    };
    
    // Count posts by category and calculate points
    let totalPoints = 0;
    
    posts.forEach(post => {
      // Extract deed type from post content
      const metadata = extractDeedMetadata(post.content);
      if (metadata && metadata.deedType) {
        // Increment category counter
        if (categories.hasOwnProperty(metadata.deedType)) {
          categories[metadata.deedType] += 1;
        }
        
        // Calculate points (base points + bonus for likes)
        const basePoints = 10; // Base points per deed
        const likeBonus = post.likes.length * 2; // 2 points per like
        totalPoints += basePoints + likeBonus;
      }
    });
    
    res.json({
      categories,
      totalPoints,
      postCount: posts.length
    });
  } catch (error) {
    console.error("Error calculating karma stats:", error);
    res.status(500).json({ error: "Failed to calculate karma statistics" });
  }
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
