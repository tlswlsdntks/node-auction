exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(404).send("로그인 필요");
  }
};
exports.isNotLoggedIn = (req, res, next) => {
  // req.isAuthenticated()는 쿠키(connect.sid)에 담긴 세션 ID와 세션(session)에 담긴 데이터(req.user)를 비교하는 과정입니다.
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(404).send("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};
