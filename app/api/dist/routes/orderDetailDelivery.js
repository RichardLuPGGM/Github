"use strict";
/**
 * @swagger
 * tags:
 *   name: Order Detail Deliveries
 *   description: API endpoints for managing order detail deliveries
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
 * /api/order-detail-deliveries:
 *   get:
 *     summary: Returns all order detail deliveries
 *     tags: [Order Detail Deliveries]
 *     responses:
 *       200:
 *         description: List of all order detail deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderDetailDelivery'
 *   post:
 *     summary: Create a new order detail delivery
 *     tags: [Order Detail Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderDetailDelivery'
 *     responses:
 *       201:
 *         description: Order detail delivery created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailDelivery'
 *
 * /api/order-detail-deliveries/{id}:
 *   get:
 *     summary: Get an order detail delivery by ID
 *     tags: [Order Detail Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail delivery ID
 *     responses:
 *       200:
 *         description: Order detail delivery found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailDelivery'
 *       404:
 *         description: Order detail delivery not found
 *   put:
 *     summary: Update an order detail delivery
 *     tags: [Order Detail Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail delivery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderDetailDelivery'
 *     responses:
 *       200:
 *         description: Order detail delivery updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailDelivery'
 *       404:
 *         description: Order detail delivery not found
 *   delete:
 *     summary: Delete an order detail delivery
 *     tags: [Order Detail Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail delivery ID
 *     responses:
 *       204:
 *         description: Order detail delivery deleted successfully
 *       404:
 *         description: Order detail delivery not found
 */
const express_1 = __importDefault(require("express"));
const orderDetailDeliveriesRepo_1 = require("../repositories/orderDetailDeliveriesRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new order detail delivery
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailDeliveriesRepo_1.getOrderDetailDeliveriesRepository)();
        const newOrderDetailDelivery = yield repo.create(req.body);
        res.status(201).json(newOrderDetailDelivery);
    }
    catch (error) {
        next(error);
    }
}));
// Get all order detail deliveries
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailDeliveriesRepo_1.getOrderDetailDeliveriesRepository)();
        const orderDetailDeliveries = yield repo.findAll();
        res.json(orderDetailDeliveries);
    }
    catch (error) {
        next(error);
    }
}));
// Get an order detail delivery by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailDeliveriesRepo_1.getOrderDetailDeliveriesRepository)();
        const orderDetailDelivery = yield repo.findById(parseInt(req.params.id));
        if (orderDetailDelivery) {
            res.json(orderDetailDelivery);
        }
        else {
            res.status(404).send('Order detail delivery not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update an order detail delivery by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailDeliveriesRepo_1.getOrderDetailDeliveriesRepository)();
        const updatedOrderDetailDelivery = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedOrderDetailDelivery);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order detail delivery not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete an order detail delivery by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailDeliveriesRepo_1.getOrderDetailDeliveriesRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order detail delivery not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
