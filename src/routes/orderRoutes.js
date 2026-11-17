const router = require('express').Router();
const { crearOrden, devolverOrden, misOrdenes } = require('../controllers/orderController');
const { proteger } = require('../middleware/auth');

router.use(proteger); // todas las rutas de ordenes requieren JWT

router.get('/', misOrdenes);
router.post('/', crearOrden);
router.patch('/:id/return', devolverOrden);

module.exports = router;
