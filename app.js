// import
const express = require("express");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");

// config
dotenv.config();
const app = express();
app.set("port", process.env.PORT || 8010);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
passportConfig();
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => console.error(err));
const sessionMiddleware = expressSession({
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  resave: false,
  saveUninitialized: false,
});
const webSocket = require("./socket");
const sse = require("./sse");
const checkAuction = require("./checkAuction");
// node-schedule
// 서버를 재시작하면 앞으로 서버를 시작할 때마다 낙찰자를 지정하는 작업을 수행합니다.
checkAuction();

// commonmiddleware
app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// router
app.use("/", indexRouter);
app.use("/auth", authRouter);

// 404 not handler
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// error middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500).render("error");
});

// listen
const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 서버 대기 중입니다!");
});

// socket.io
webSocket(server, app);

// sse
sse(server, app);
