const express = require('express');
const usersRouter = express.Router();
const passport = require('passport');
const User = require('../models/users.model');
const sendEMail = require('../mail/mail');

// 회원가입
usersRouter.post('/signup', async (req, res) => {
  // User 객체 생성
  const user = new User(req.body); // req.body에는 email, password
  console.log(req.body);
  try {
    // user 컬렉션에 user를 저장
    await user.save();
    // 이메일 보내기
    sendEMail('kimyj1592@naver.com', 'KimYeJin', 'goodbye');
    // 저장이 성공적일 때
    res.redirect('/');
    // 저장이 실패적일 때
  } catch(err) {
    console.error(err);
  }
});

// 로그인
usersRouter.post('/login', (req, res, next) => {
  // authenticate를 호출하면 passport.use( ) 호출돼서 ... 실행 후 해당 함수의 콜백 실행
  passport.authenticate("local", (err, user, info) => {
    // error 발생시 error 처리기로 처리
    if (err) {
      return next(err)
    };

    // user가 없으면
    if (!user) {
      return res.json({ msg: info });
    }

    // user가 정상적으로 있다면 로그인 세션 생성(req.user = user) user는 passport.serializeUser()로 들어감
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      // 정상적으로 로그인이 되면 홈 화면으로 이동
      res.redirect('/');
    });
    // 미들웨어 안에 미들웨어 호출하기 위해 아래 코드 작성
  })(req, res, next);
});

// 로그아웃
usersRouter.post('/logout', function (req, res, next) {
  // 로그아웃 시 에러 났을 때 에러 처리
  req.logOut(function (err) {
    if (err) {
      return next(err);
    } else {
      res.redirect('/login'); // 로그아웃이 성공했을 시
    }
  });
});

// 구글 로그인
usersRouter.get('/google', passport.authenticate('google'));
usersRouter.get('/google/callback', passport.authenticate('google', {
  successReturnToOrRedirect: '/', // 성공 시 홈 화면으로 이동
  failureRedirect: '/login' // 실패 시 로그인 화면으로 이동
}));

module.exports = usersRouter;