'use strict';
const Sequelize =  require('sequelize');

module.exports = (sequelize) => {
    class Book extends Sequelize.Model{}
    Book.init({
        title: Sequelize.STRING,
        author: Sequelize.STRING,
        genre: Sequelize.STRING,
        year: Sequelize.INTEGER
    }, { sequelize });
    return Book;
}