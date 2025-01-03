const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to validate username
const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });

  req.session.authorization = { accessToken, username };
  res.status(200).json({ message: "Login successful.", token: accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized user." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized user." });
  }

  if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found or book not reviewed by user." });
  }

  delete books[isbn].reviews[username];
  res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
