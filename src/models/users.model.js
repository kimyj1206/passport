const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 스키마 생성
const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true // unique: true는 유효성 체크
  },
  password: {
    type: String,
    minLength: 5,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  }
})

// 해시된 비밀번호가 입력한 비밀번호랑 일치하는지 확인
userSchema.methods.comparePassword = function(plainPassword, cb) {
  // this.password는 db에 해시된 비밀번호
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  })
}

// db에 password 암호화
const saltRounds = 10; // 랜덤 숫자
// save 하기 전에 실행
userSchema.pre('save', function (next) {
  let user = this;
  // 비밀번호가 변경될 때
  if (user.isModified('password')) {
    // salt를 생성
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hashedPassword) {
        if (err) return next(err);
        user.password = hashedPassword;
        next();
      })
    });
  } else {
      next(); // password를 변경하지 않은 경우 => ex) 구글 로그인 시
    }
});

// 모델 생성, 모델을 가지고 데이터 제어 가능
const User = mongoose.model('User', userSchema);

module.exports = User;