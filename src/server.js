const express = require('express');
const app = express();
const config = require('config');
const serverConfig = config.get('server');
const PORT = serverConfig.port;
const { default: mongoose } = require('mongoose');
const path = require('path');
const User = require('../src/models/users.model');
const passport = require('passport');
const cookieSession = require('cookie-session');
const { checkNotAuthenticated, checkAuthenticated } = require('./middlewares/auth');
require('dotenv').config();

// cookie-session 생성
app.use(cookieSession({
  keys: [process.env.COOKIE_ENCRYPTION_KEY]
}))

// passport랑 cookie-session 같이 사용해서 발생하는 에러를 막아주는 코드
app.use(function (req, res, next) {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => {
      cb();
    }
  }
    if (req.session && !req.session.save) {
      req.session.save = (cb) => {
        cb();
    }
  }
    next();
})

// port 설정
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})

// view engine configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
// form 내용을 parsing 해서 가져오기 위한 코드
app.use(express.urlencoded({ extended: false }));

// passport configuration(passport 사용을 시작, 쿠키를 사용해 인증 처리 설정)
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// db 연결
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('mongodb server connected');
  })
  .catch((err) => {
    console.log('mongodb server error');
  })

// 미들웨어 등록, /static 경로로 들어왔을 때 정적 파일 제공
app.use('/static', express.static(path.join(__dirname, 'public')));

// 라우터 설정
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('signup');
});

// 회원가입 로직
app.post('/signup', async (req, res) => {
  // User 객체 생성
  const user = new User(req.body); // req.body에는 email, password
  console.log(req.body);
  try {
    // user 컬렉션에 user를 저장
    await user.save()
    // 저장이 성공적일 때
    return res.status(200).json({
      success: true
    })
    // 저장이 실패적일 때
  } catch(err) {
    console.error(err);
  }
});

// 로그인 로직
app.post('/login', (req, res, next) => {
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

// 로그아웃 로직
app.post('/logout', function (req, res, next) {
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
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/callback', passport.authenticate('google', {
  successReturnToOrRedirect: '/', // 성공 시 홈 화면으로 이동
  failureRedirect: '/login' // 실패 시 로그인 화면으로 이동
}));