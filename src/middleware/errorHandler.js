// Manejador global de errores
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Datos invalidos', detalles: mensajes });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador invalido' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'El email ya esta registrado' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = errorHandler;
