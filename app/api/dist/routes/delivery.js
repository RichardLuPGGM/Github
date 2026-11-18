"use strict";
/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: API endpoints for managing deliveries
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
 * /api/deliveries:
 *   get:
 *     summary: Returns all deliveries
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: List of all deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Delivery'
 *   post:
 *     summary: Create a new delivery
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       201:
 *         description: Delivery created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get a delivery by ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery ID
 *     responses:
 *       200:
 *         description: Delivery found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       404:
 *         description: Delivery not found
 *   put:
 *     summary: Update a delivery
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       200:
 *         description: Delivery updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       404:
 *         description: Delivery not found
 *   delete:
 *     summary: Delete a delivery
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery ID
 *     responses:
 *       204:
 *         description: Delivery deleted successfully
 *       404:
 *         description: Delivery not found
 *
 * /api/deliveries/{id}/status:
 *   put:
 *     summary: Update the status of a delivery
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the delivery
 *               deliveryPartner:
 *                 type: string
 *                 description: Optional delivery partner to notify via the notify-service about the status update
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Delivery'
 *                 - type: object
 *                   properties:
 *                     delivery:
 *                       $ref: '#/components/schemas/Delivery'
 *                     commandOutput:
 *                       type: string
 *                       description: Output from the notify-service command
 *       404:
 *         description: Delivery not found
 *       500:
 *         description: Error executing notify command
 */
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const deliveriesRepo_1 = require("../repositories/deliveriesRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new delivery
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        const newDelivery = yield repo.create(req.body);
        res.status(201).json(newDelivery);
    }
    catch (error) {
        next(error);
    }
}));
// Get all deliveries
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        const deliveries = yield repo.findAll();
        res.json(deliveries);
    }
    catch (error) {
        next(error);
    }
}));
// Get a delivery by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        const delivery = yield repo.findById(parseInt(req.params.id));
        if (delivery) {
            res.json(delivery);
        }
        else {
            res.status(404).send('Delivery not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update the status of a delivery
router.put('/:id/status', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, deliveryPartner } = req.body;
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        const delivery = yield repo.findById(parseInt(req.params.id));
        if (delivery) {
            const updatedDelivery = yield repo.updateStatus(parseInt(req.params.id), status);
            if (deliveryPartner) {
                (0, child_process_1.exec)(`notify ${deliveryPartner}`, (error, stdout) => {
                    if (error) {
                        console.error(`Error executing command: ${error}`);
                        return res.status(500).json({ error: error.message });
                    }
                    res.json({ delivery: updatedDelivery, commandOutput: stdout });
                });
            }
            else {
                res.json(updatedDelivery);
            }
        }
        else {
            res.status(404).send('Delivery not found');
        }
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Delivery not found');
        }
        else {
            next(error);
        }
    }
}));
// Update a delivery by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        const updatedDelivery = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedDelivery);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Delivery not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete a delivery by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, deliveriesRepo_1.getDeliveriesRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Delivery not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
