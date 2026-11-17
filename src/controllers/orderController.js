const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Suma de vuelta el stock de una lista [{ producto, cantidad }]
const restaurarStock = (lista) =>
  Promise.all(
    lista.map((i) =>
      Product.updateOne({ _id: i.producto }, { $inc: { stock: i.cantidad } })
    )
  );

// POST /api/orders  -> body: { items: [{ productoId, cantidad }] }
exports.crearOrden = async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe enviar al menos un item' });
  }

  for (const it of items) {
    if (!mongoose.isValidObjectId(it.productoId)) {
      return res.status(400).json({ error: 'productoId invalido' });
    }
    if (!Number.isInteger(it.cantidad) || it.cantidad < 1) {
      return res
        .status(400)
        .json({ error: 'La cantidad debe ser un entero mayor o igual a 1' });
    }
  }

  const descontados = []; // para poder revertir si algo falla
  const detalle = [];
  let total = 0;

  try {
    for (const it of items) {
      // Descuento atomico: solo ocurre si hay stock suficiente
      const producto = await Product.findOneAndUpdate(
        { _id: it.productoId, stock: { $gte: it.cantidad } },
        { $inc: { stock: -it.cantidad } },
        { new: true }
      );

      if (!producto) {
        await restaurarStock(descontados);
        const existe = await Product.exists({ _id: it.productoId });
        if (!existe) {
          return res
            .status(404)
            .json({ error: `Producto no encontrado: ${it.productoId}` });
        }
        return res.status(400).json({
          error: `Stock insuficiente para el producto ${it.productoId}`
        });
      }

      descontados.push({ producto: producto._id, cantidad: it.cantidad });
      detalle.push({
        producto: producto._id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: it.cantidad
      });
      total += producto.precio * it.cantidad;
    }

    const orden = await Order.create({
      usuario: req.user._id,
      items: detalle,
      total: Math.round(total * 100) / 100
    });

    return res.status(201).json({ mensaje: 'Orden creada correctamente', orden });
  } catch (error) {
    await restaurarStock(descontados).catch(() => {});
    next(error);
  }
};

// PATCH /api/orders/:id/return
exports.devolverOrden = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Identificador de orden invalido' });
    }

    // Cambio de estado atomico: solo si es del usuario y sigue "completada"
    const orden = await Order.findOneAndUpdate(
      { _id: id, usuario: req.user._id, estado: 'completada' },
      { estado: 'devuelta', fechaDevolucion: new Date() },
      { new: true }
    );

    if (!orden) {
      const existente = await Order.findOne({ _id: id, usuario: req.user._id });
      if (!existente) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }
      return res.status(409).json({ error: 'La orden ya fue devuelta' });
    }

    try {
      await restaurarStock(orden.items);
    } catch (error) {
      // Si falla la restauracion, se revierte el estado de la orden
      await Order.updateOne(
        { _id: orden._id },
        { estado: 'completada', $unset: { fechaDevolucion: 1 } }
      );
      throw error;
    }

    return res.status(200).json({ mensaje: 'Orden devuelta y stock restaurado', orden });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders -> ordenes del usuario autenticado
exports.misOrdenes = async (req, res, next) => {
  try {
    const ordenes = await Order.find({ usuario: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ total: ordenes.length, ordenes });
  } catch (error) {
    next(error);
  }
};
