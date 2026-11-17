const Product = require('../models/Product');

// POST /api/products (ruta protegida)
exports.crearProducto = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const producto = await Product.create({ nombre, descripcion, precio, stock });
    return res.status(201).json({ mensaje: 'Producto creado', producto });
  } catch (error) {
    next(error);
  }
};

// GET /api/products
exports.listarProductos = async (req, res, next) => {
  try {
    const productos = await Product.find().sort({ createdAt: 1 });
    return res.status(200).json({ total: productos.length, productos });
  } catch (error) {
    next(error);
  }
};
