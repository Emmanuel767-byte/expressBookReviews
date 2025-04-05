const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User Registration
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// 🛒 Get the book list using Promise callbacks
public_users.get("/", (req, res) => {
  new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((bookList) => res.status(200).json(bookList))
    .catch(() => res.status(500).json({ message: "Error retrieving books" }));
});

// 🛒 Get the book list using async-await
public_users.get("/async/books", async (req, res) => {
  try {
    const bookList = await new Promise((resolve) => resolve(books));
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

// 📖 Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// 📖 Get book details based on ISBN using async-await
public_users.get("/async/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject("Book not found");
    });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// ✍️ Get book details based on Author using Promises
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author);
    if (matchingBooks.length) resolve(matchingBooks);
    else reject("No books found by this author");
  })
    .then((books) => res.status(200).json({ books }))
    .catch((err) => res.status(404).json({ message: err }));
});

// ✍️ Get book details based on Author using async-await
public_users.get("/async/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter((book) => book.author.toLowerCase() === author);
      result.length ? resolve(result) : reject("No books found by this author");
    });
    res.status(200).json({ books: booksByAuthor });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// 🔤 Get book details based on Title using Promises
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const book = Object.values(books).find((b) => b.title.toLowerCase() === title);
    if (book) resolve(book);
    else reject("No book found with this title");
  })
    .then((book) => res.status(200).json({ book }))
    .catch((err) => res.status(404).json({ message: err }));
});

// 🔤 Get book details based on Title using async-await
public_users.get("/async/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const bookByTitle = await new Promise((resolve, reject) => {
      const result = Object.values(books).find((book) => book.title.toLowerCase() === title);
      result ? resolve(result) : reject("No book found with this title");
    });
    res.status(200).json({ book: bookByTitle });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// ⭐ Get book review
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
