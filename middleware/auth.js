const jwt = require('jsonwebtoken');

const auth = (rolesOrReq, res, next) => {
  // Called as plain middleware: router.post('/', auth, handler)
  if (!Array.isArray(rolesOrReq)) {
    const req = rolesOrReq;
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ msg: 'Token is not valid' });
    }
    return;
  }

  // Called as factory: router.get('/', auth(['admin']), handler)
  const roles = rolesOrReq;
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied' });
      }
      next();
    } catch {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = auth;
