const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;

// req.logIn(user) 호출시 세션 데이터 생성 코드 실행
passport.serializeUser((User, done) => {
  done(null, User.id);
})

// client에서 session을 가지고 요청시
passport.deserializeUser((id, done) => {
  // db에 id가 있는지 확인
  User.findById(id)
    .then(User => {
      done(null, User);
    })
    // req.user에 user가 들어가게 됨
})

// localStrategy는 usernameField와 passwordField를 제공,
// 지금 프로젝트와 맞지 않아 임의로 name을 email로 수정
const localStrategyConfig = new LocalStrategy({usernameField: 'email', passwordField: 'password'},
  // done을 호출하면 passport.authenticate("local", ...)의 ...부분 호출
  (email, password, done) => {
    User.findOne({
      email: email.toLocaleLowerCase()
    }, (err, User) => {
      if (err) return done(err);

      if (!User) {
        return done(null, false, {msg: `Email ${email} not found`}) // false에는 user를 넣어줌
      }

      // 비밀번호가 일치하는지 확인
      User.comparePassword(password, (err, isMatch) => {
        // error 코드
        if (err) return done(err);

        // isMatch가 true => 비밀번호가 맞았다는 뜻
        if (isMatch) {
          return done(null, User);
        }
        // password가 틀렸을 때 해당 코드 실행, error는 없고, user 정보 없음
        return done(null, false, {msg: 'Invalid email or password.'});
      })
    })
  }
);

passport.use('local', localStrategyConfig);

// 구글 전략
const googleStrategyConfig = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // googleClientId랑 googleClientSecret를 발급받아 넣어줬기 때문에 구글 로그인 화면으로 이동할 수 있었음.
  callbackURL: '/auth/google/callback',
  scope: ['email', 'profile'] // 구글에 email, profile 받아옴
}, (accessToken, refreshToken, profile, done) => {
  // console.log('profile', profile); // user 정보를 가져오지 못해서 콘솔이 안찍힘 => 라우터에서 옵션 지정해야 콘솔 찍힘
  // 가져온 user 정보를 db에 저장하는데 이미 저장됐는지 확인
  User.findOne({googleId: profile.id}, (err, existingUser) => {
    if (err) { return done(err); }

    // user 정보가 존재한다면 => 로그인을 했던 사람
    if (existingUser) {
      return done(null, existingUser);
    } else {
      // user 정보가 없다면 => 새롭게 로그인 하는 사람 / 구글에서 제공하는 정보를 user에 넣어 db에 저장
      const user = new User();
      user.email = profile.emails[0].value;
      user.googleId = profile.id;
      user.save((err) => {
        console.log(err);
        if (err) {
          return done(err);
        } else {
          done(null, user);
        }
      });
    }
  })
})

passport.use('google', googleStrategyConfig);

// 카카오 전략
const kakaoStrategyConfig = new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: '/auth/kakao/callback',
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ kakaoId: profile.id }, (err, existingUser) => {
    if (err) { return done(err); }

    if (existingUser) {
      return done(null, existingUser);
    } else {
      const user = new User();
      user.kakaoId = profile.id;
      user.email = profile._json.kakao_account.email;
      user.save((err) => {
        if (err) {
          return done(err);
        } else {
          done(null, user);
        }
      });
    }
  })
})

passport.use('kakao', kakaoStrategyConfig);