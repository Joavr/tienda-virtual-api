const router = require('express').Router();
const { crearProducto, listarProductos } = require('../controllers/productController');
const { proteger } = require('../middleware/auth');

router.get('/', listarProductos);
router.post('/', proteger, crearProducto);

module.exports = router;
