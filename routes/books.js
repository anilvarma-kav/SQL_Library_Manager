const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
        try {
            await cb(req, res, next)
        } catch(error){
            res.status(500).send(error);
        }
    }
}
/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAll({order: [["createdAt", "DESC"]]});
    res.render("books/index", {books, title: "Books"});
}));

/* GET books listing. */
router.get('/newbook',  (req, res) => {
    res.render("books/newBook", {title: "New Book"});
});

/* POST create book. */
router.post('/', asyncHandler(async (req, res) => {
    let book;
    try{
        book = await Book.create(req.body);
        res.redirect("/books/");
    }
    catch (e) {
        if(e.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            res.render("books/newBook", { book, errors: e.errors, title: "New Book" })
        } else {
            throw e;
        }
    }

}));
/* Get book details. */
router.get("/:id/details", asyncHandler(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/details", { book, title: "Update Book" });
    } else {
        res.render("error");
    }
}));

/* POST Update book details */
router.post('/:id/update', asyncHandler(async (req, res) => {
    let book;
    try{
        book = await Book.findByPk(req.params.id);
        if(book){
            await book.update(req.body);
            res.redirect("/books/");
        }
        else{
            res.sendStatus(404);
        }

    }
    catch (e) {
        if(e.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render("books/"+book.id+"/details", { book, errors: e.errors, title: "Update Book" })
        } else {
            throw e;
        }
    }

}));
router.post('/:id/delete', asyncHandler(async (req, res) => {
    let book;
    book = await Book.findByPk(req.params.id);
    if(book){
        await book.destroy();
        res.redirect("/books/");
    }
    else{
        res.sendStatus(404);
    }
}));
module.exports = router;