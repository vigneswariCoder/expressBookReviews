const express = require('express');
let books = require("./booksdb.js");
const public_users = express.Router();

public_users.get('/', async (req, res) => {
  try {
    const bookList = await new Promise((resolve) => resolve(books));
    res.status(200).json({ books: bookList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list.", error: error.message });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject(`Book with ISBN ${isbn} not found.`);
    });
    res.status(200).json({ book });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const result = await new Promise((resolve) => {
      resolve(
        Object.values(books).filter(book => book.author.toLowerCase() === author)
      );
    });
    if (result.length > 0) {
      res.status(200).json({ books: result });
    } else {
      res.status(404).json({ message: `No books found for author ${author}.` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author.", error: error.message });
  }
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  new Promise((resolve, reject) => {
    const result = Object.values(books).filter(book =>
      book.title.toLowerCase().includes(title)
    );
    if (result.length > 0) resolve(result);
    else reject(`No books found with title ${title}.`);
  })
    .then(result => res.status(200).json({ books: result }))
    .catch(error => res.status(404).json({ message: error }));
});

module.exports.general = public_users;
