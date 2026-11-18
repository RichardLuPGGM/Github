"use strict";
/**
 * @swagger
 * tags:
 *   name: Order Details
 *   description: API endpoints for managing order details
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
 * /api/order-details:
 *   get:
 *     summary: Returns all order details
 *     tags: [Order Details]
 *     responses:
 *       200:
 *         description: List of all order details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderDetail'
 *   post:
 *     summary: Create a new order detail
 *     tags: [Order Details]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderDetail'
 *     responses:
 *       201:
 *         description: Order detail created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *
 * /api/order-details/{id}:
 *   get:
 *     summary: Get an order detail by ID
 *     tags: [Order Details]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail ID
 *     responses:
 *       200:
 *         description: Order detail found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *       404:
 *         description: Order detail not found
 *   put:
 *     summary: Update an order detail
 *     tags: [Order Details]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderDetail'
 *     responses:
 *       200:
 *         description: Order detail updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *       404:
 *         description: Order detail not found
 *   delete:
 *     summary: Delete an order detail
 *     tags: [Order Details]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order detail ID
 *     responses:
 *       204:
 *         description: Order detail deleted successfully
 *       404:
 *         description: Order detail not found
 */
const express_1 = __importDefault(require("express"));
const orderDetailsRepo_1 = require("../repositories/orderDetailsRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new order detail
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailsRepo_1.getOrderDetailsRepository)();
        const newOrderDetail = yield repo.create(req.body);
        res.status(201).json(newOrderDetail);
    }
    catch (error) {
        next(error);
    }
}));
// Get all order details
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailsRepo_1.getOrderDetailsRepository)();
        const orderDetails = yield repo.findAll();
        res.json(orderDetails);
    }
    catch (error) {
        next(error);
    }
}));
// Get an order detail by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailsRepo_1.getOrderDetailsRepository)();
        const orderDetail = yield repo.findById(parseInt(req.params.id));
        if (orderDetail) {
            res.json(orderDetail);
        }
        else {
            res.status(404).send('Order detail not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update an order detail by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailsRepo_1.getOrderDetailsRepository)();
        const updatedOrderDetail = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedOrderDetail);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order detail not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete an order detail by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, orderDetailsRepo_1.getOrderDetailsRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Order detail not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
