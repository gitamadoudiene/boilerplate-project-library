'use strict';
const Book = require('../models/Book');

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({}, 'title comments');
        const formatted = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formatted);
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .post(async function (req, res) {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');

      try {
        const book = new Book({ title });
        await book.save();
        res.json({ _id: book._id, title: book.title });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      const { comment } = req.body;
      if (!comment) return res.send('missing required field comment');

      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      try {
        const deleted = await Book.findByIdAndDelete(req.params.id);
        if (!deleted) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });

};
