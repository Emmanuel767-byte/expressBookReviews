const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = "e3bceb65a98b4ae410361f2c180b0f5ed03dbdd2e3fd75ad33caf300a8d27785"

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Function to authenticate user credentials
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user exists and password is correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization;

  // Log the token to debug
  console.log("Token received:", token);

  if (!token) {
    return res.status(403).json({ message: "Access denied. Token is missing" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    console.log("Decoded Token:", decoded);

    return res.status(200).json({ message: "Token is valid", user: decoded.username });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Assuming authentication middleware sets req.user

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has reviews
  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Check if the user has added a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(403).json({ message: "You have not reviewed this book" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
