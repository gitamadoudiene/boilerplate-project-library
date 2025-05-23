const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server'); // adapte selon ton fichier principal Express

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testBookId;

  suite('Routing tests', function() {

    suite('POST /api/books with title', function() {
      test('Create a book with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'Test Book');
            testBookId = res.body._id; // garder l'id pour tests suivants
            done();
          });
      });

      test('Create a book without title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books', function() {
      test('Get all books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if (res.body.length > 0) {
              assert.property(res.body[0], 'commentcount');
              assert.property(res.body[0], 'title');
              assert.property(res.body[0], '_id');
            }
            done();
          });
      });
    });

    suite('GET /api/books/:id', function() {
      test('Get book by valid id', function(done) {
        chai.request(server)
          .get('/api/books/' + testBookId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.equal(res.body._id, testBookId);
            done();
          });
      });

      test('Get book by invalid id', function(done) {
        chai.request(server)
          .get('/api/books/invalidid123')
          .end(function(err, res) {
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('POST /api/books/:id', function() {
      test('Add comment to book', function(done) {
        chai.request(server)
          .post('/api/books/' + testBookId)
          .send({ comment: 'This is a test comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'comments');
            assert.include(res.body.comments, 'This is a test comment');
            done();
          });
      });

      test('Add comment without comment field', function(done) {
        chai.request(server)
          .post('/api/books/' + testBookId)
          .send({})
          .end(function(err, res) {
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Add comment to invalid id', function(done) {
        chai.request(server)
          .post('/api/books/invalidid123')
          .send({ comment: 'Test comment' })
          .end(function(err, res) {
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/:id', function() {
      test('Delete book by valid id', function(done) {
        chai.request(server)
          .delete('/api/books/' + testBookId)
          .end(function(err, res) {
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Delete book by invalid id', function(done) {
        chai.request(server)
          .delete('/api/books/invalidid123')
          .end(function(err, res) {
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books', function() {
      test('Delete all books', function(done) {
        chai.request(server)
          .delete('/api/books')
          .end(function(err, res) {
            assert.equal(res.text, 'complete delete successful');
            done();
          });
      });
    });

  });
});
