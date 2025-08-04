const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nick, password, money } = req.body;
  try {
    const exUser = await User.findOne({
      where: { email },
    });
    if (exUser) {
      return res.redirect("/join?error=이미 가입된 이메일입니다.");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
      money,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.login = (req, res, next) => {
  try {
    // passport.use('local')는 'local' 전략을 등록하는 것이고, require("passport-local").Strategy를 통해 로컬 인증 전략을 불러와서 사용하게 됩니다.
    passport.authenticate("local", (authError, user, info) => {
      if (authError) {
        console.error(authError);
        return next(authError);
      }
      if (!user) {
        return res.redirect(`/?error=${info.message}`);
      }
      // 로그인에 성공하면 내부적으로 Passport의 serializeUser 함수가 실행되고, 세션에 사용자 정보(user.id)를 저장하고, 성공 시 홈페이지로 리다이렉트합니다.
      return req.login(user, (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  req.logout(() => {
    res.redirect("/");
  });
};
