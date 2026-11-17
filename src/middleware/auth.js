const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifica el JWT enviado en "Authorization: Bearer <token>"
const proteger = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ error: 'El usuario del token ya no existe' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};

module.exports = { proteger };
