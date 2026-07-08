const { Router } = require('express');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect); // all order routes require authentication

router.post('/',              createOrder);
router.get('/my',             getMyOrders);
router.get('/:id',            getOrderById);
router.patch('/:id/status',   updateOrderStatus);

module.exports = router;
