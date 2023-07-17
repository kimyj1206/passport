const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users.model');

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
passport.use('local', new LocalStrategy({usernameField: 'email', passwordField: 'password'},
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
));