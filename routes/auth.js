const express = require("express");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/auth");

const router = express.Router();

// post /auth/join
router.post("/join", isNotLoggedIn, join);

// post /auth/login
router.post("/login", isNotLoggedIn, login);

// post /get/logout
router.get("/logout", isLoggedIn, logout);

module.exports = router;
