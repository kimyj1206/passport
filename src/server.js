const express = require('express');
const app = express();
const PORT = 5000;
const { default: mongoose } = require('mongoose');
const path = require('path');
const User = require('../src/models/users.model');
const passport = require('passport');
const cookieSession = require('cookie-session');

const cookieEncryptionKey = 'secret-key';

// cookie-session 생성
app.use(cookieSession({
  keys: [cookieEncryptionKey]
}))

// passport랑 cookie-session 같이 사용해서 에러 발생을 막아주는 코드
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

// port 설정
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})

// db 연결
mongoose.set('strictQuery', false);
mongoose.connect(``)
  .then(() => {
    console.log('mongodb server connected');
  })
  .catch((err) => {
    console.log('mongodb server error');
  })

// 미들웨어 등록, /static 경로로 들어왔을 때 정적 파일 제공
app.use('/static', express.static(path.join(__dirname, 'public')));

// 라우터 설정
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
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