// 로그인을 안 한 사람이 로그인 권한이 필요한 페이지 접근할 때
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// 로그인을 한 사람이 로그인 페이지에 접근할 때
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  } else {
    next();
  }
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
}