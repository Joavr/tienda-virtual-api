const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nombre: { type: String, required: true },
    precioUnitario: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'La orden debe tener al menos un item'
      }
    },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['completada', 'devuelta'],
      default: 'completada'
    },
    fechaDevolucion: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
