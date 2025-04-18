// client/src/index.jsx

import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";

// Updated imports to reference the new files
import Posts from "./components/Posts";
import PostDetail from "./components/PostDetail";

import Feed from "./components/Feed";
import FeedDetail from "./components/FeedDetail";

import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import EditPost from "./components/EditPost";

import { AuthProvider } from "./security/AuthContext";
import RequireAuth from "./security/RequireAuth";

import "./style/normalize.css";
import "./style/index.css";

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="feed" element={<Feed />} />
          <Route path="feed/:postId" element={<FeedDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/:postId" element={<PostDetail />} />
          <Route path="posts/:postId/edit" element={<EditPost />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
