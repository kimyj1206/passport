const express = require('express');
const app = express();
const config = require('config');
const serverConfig = config.get('server');
const PORT = serverConfig.port;
const { default: mongoose } = require('mongoose');
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const productsRouter = require('./routes/products.router');
require('dotenv').config();

app.use(express.json());

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

// form 내용을 parsing 해서 가져오기 위한 코드
app.use(express.urlencoded({ extended: false }));

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

// passport 설정(passport 사용을 시작, 쿠키를 사용해 인증 처리 설정)
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// view engine 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 라우터 설정
app.use('/', mainRouter);
app.use('/auth', usersRouter);
app.use('/products', productsRouter);

// error 처리
app.use((err, req, res, next) => {
  res.json({ msg : err.message });
})

// port 설정
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})