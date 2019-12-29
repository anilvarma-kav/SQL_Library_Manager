const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
var createError = require('http-errors');
const Sequelize =  require('sequelize');
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
    const Allbooks = await Book.findAll();
    const pages = Math.ceil(Allbooks.length/5);
    console.log(pages);
    const books = await Book.findAll(
        {
            order: [['updatedAt', 'DESC']],
            limit: 5
        }
    );
    res.render("books/index", {books, title: "Books", pages, active: 1});
}));

// For pagination
router.get('/page/:page', asyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const Allbooks = await Book.findAll();
    const pages = Math.ceil(Allbooks.length/5);
    console.log(page);
    const books = await Book.findAll(
        {
            order: [['updatedAt', 'DESC']],
            offset: 5 * (page-1),
            limit: 5
        }
    );
    res.render("books/index", {books, title: "Books", pages, active: page});
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
router.get('/search', asyncHandler(async (req, res) => {
    const {term} = req.query;
    const Op = Sequelize.Op;
    const books = await Book.findAll(
        {
            where: {
                [Op.or]: {
                    title: {
                        [Op.like]: '%' + term + '%'
                    },
                    author: {
                        [Op.like]: '%' + term + '%'
                    },
                    genre: {
                        [Op.like]: '%' + term + '%'
                    },
                    year: {
                        [Op.like]: '%' + term + '%'
                    }
                }
            }
        }
    );
    console.log(books, term);
    if(books.length > 0) {
        res.render("books/index", {books, title: "Search results for: " + term});
    }
    else{
        res.render("books/index", {books, title: "Sorry, there are no books matching your search: " + term});
    }
}));
/* Get book details. */
router.get("/:id", asyncHandler(async(req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/details", { book, title: "Update Book" });
    } else {
        next(createError(404));
    }
}));

/* POST Update book details */
router.post('/:id', asyncHandler(async (req, res) => {
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

// Search feature


module.exports = router;