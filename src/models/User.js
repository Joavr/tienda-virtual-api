const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato valido']
    },
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      minlength: [6, 'La contrasena debe tener al menos 6 caracteres'],
      select: false
    }
  },
  { timestamps: true }
);

// Hash de la contrasena antes de guardar (solo si fue modificada)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model('User', userSchema);
