const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  renderMain,
  renderJoin,
  renderGood,
  createGood,
  renderAuction,
  bid,
  renderList,
} = require("../controllers");

const router = express.Router();

// common
router.use((req, res, next) => {
  // console.log(req.user, req.signedCookies, req.session.passport);
  // router.use에서 res.locals.user에 사용자 정보를 저장하면, 이후 모든 템플릿 렌더링 시 별도로 매번 사용자 정보를 전달하지 않아도 Nunjucks 템플릿에서 {{ user.nick }}처럼 바로 접근할 수 있습니다.
  res.locals.user = req.user;
  next();
});

// get /
router.get("/", renderMain);

// get /join
router.get("/join", isNotLoggedIn, renderJoin);

// get /good
router.get("/good", isLoggedIn, renderGood);

// post /good
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/good", isLoggedIn, upload.single("img"), createGood);

// get /good/:id
router.get("/good/:id", isLoggedIn, renderAuction);

// get /good/:id/bid
router.post("/good/:id/bid", isLoggedIn, bid);

// get /list
router.get("/list", isLoggedIn, renderList);

module.exports = router;
