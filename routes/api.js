'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = function (app) {
  const uri = `mongodb+srv://amadoudiene20:${process.env.PW}@cluster0.yyqsw.mongodb.net/personal_library?retryWrites=true&w=majority`;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  });

  const Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.json('missing title');
      }

      try {
        const newBook = new Book({ title, comments: [] });
        const savedBook = await newBook.save();
        res.json({
          _id: savedBook._id,
          title: savedBook.title
        });
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('server error');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.json('no book exists');
        }
        res.json(book);
      } catch (err) {
        res.json('no book exists'); // Pour correspondre aux tests FCC
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }

      try {
        const updatedBook = await Book.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment } },
          { new: true }
        );
        if (!updatedBook) {
          return res.json('no book exists');
        }
        res.json(updatedBook);
      } catch (err) {
        res.json('no book exists');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });
};
