const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// 비밀번호가 일치하는지 확인
userSchema.methods.comparePassword = function(plainPassword, cb) {
  // bcrypt compare 비교
  // plainPassword => client에서 제공, this.password => db에 저장된 비밀번호
  if (plainPassword === this.password) {
    // login success
    cb(null, true); // error 있으면 null에, password가 맞다면 true
  } else {
    // login failure
    cb(null, false);
  }
  return cb({error: 'error'});
}

// 모델 생성, 모델을 가지고 데이터 제어 가능
const User = mongoose.model('User', userSchema);

module.exports = User;