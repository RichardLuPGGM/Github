"use strict";
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Returns all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
const express_1 = __importDefault(require("express"));
const ordersRepo_1 = require("../repositories/ordersRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new order
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, ordersRepo_1.getOrdersRepository)();
        const newOrder = yield repo.create(req.body);
        res.status(201).json(newOrder);
    }
    catch (error) {
        next(error);
    }
}));
// Get all orders
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, ordersRepo_1.getOrdersRepository)();
        const orders = yield repo.findAll();
        // Non-linear pattern example: duplicate destructuring in object
        if (orders.length > 0) {
            const { orderId: id, orderId: duplicateId } = orders[0];
            console.log('Non-linear pattern in order routes:', id, duplicateId);
        }
        res.json(orders);
    }
    catch (error) {
        next(error);
    }
}));
// Get an order by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, ordersRepo_1.getOrdersRepository)();
        const order = yield repo.findById(parseInt(req.params.id));
        if (order) {
            res.json(order);
        }
        else {
            res.status(404).send('Order not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update an order by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, ordersRepo_1.getOrdersRepository)();
        const updatedOrder = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedOrder);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete an order by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, ordersRepo_1.getOrdersRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
