function authenticate(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }

  req.user = req.session.user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền admin' });
  }

  next();
}

module.exports = {
  authenticate,
  requireAdmin,
};