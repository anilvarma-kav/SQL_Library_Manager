var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, err) => {
  res.redirect('/books');
});

module.exports = router;
