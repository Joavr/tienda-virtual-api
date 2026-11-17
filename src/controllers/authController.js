const jwt = require('jsonwebtoken');
const User = require('../models/User');

const firmarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });

// POST /api/auth/register
exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const usuario = await User.create({ nombre, email, password });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contrasena son obligatorios' });
    }

    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    return res.status(200).json({
      mensaje: 'Inicio de sesion exitoso',
      token: firmarToken(usuario._id),
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    next(error);
  }
};
