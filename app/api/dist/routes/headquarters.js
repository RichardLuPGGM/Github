"use strict";
/**
 * @swagger
 * tags:
 *   name: Headquarters
 *   description: API endpoints for managing headquarters locations
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
 * /api/headquarters:
 *   get:
 *     summary: Returns all headquarters
 *     tags: [Headquarters]
 *     responses:
 *       200:
 *         description: List of all headquarters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Headquarters'
 *   post:
 *     summary: Create a new headquarters
 *     tags: [Headquarters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Headquarters'
 *     responses:
 *       201:
 *         description: Headquarters created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Headquarters'
 *
 * /api/headquarters/{id}:
 *   get:
 *     summary: Get a headquarters by ID
 *     tags: [Headquarters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Headquarters ID
 *     responses:
 *       200:
 *         description: Headquarters found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Headquarters'
 *       404:
 *         description: Headquarters not found
 *   put:
 *     summary: Update a headquarters
 *     tags: [Headquarters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Headquarters ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Headquarters'
 *     responses:
 *       200:
 *         description: Headquarters updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Headquarters'
 *       404:
 *         description: Headquarters not found
 *   delete:
 *     summary: Delete a headquarters
 *     tags: [Headquarters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Headquarters ID
 *     responses:
 *       204:
 *         description: Headquarters deleted successfully
 *       404:
 *         description: Headquarters not found
 *
 * /api/headquarters/{id}/metrics:
 *   get:
 *     summary: Get headquarters metrics by ID
 *     tags: [Headquarters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Headquarters ID
 *     responses:
 *       200:
 *         description: Headquarters metrics calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   description: Total score calculated from ID, floor count, and capacity
 *                 average:
 *                   type: number
 *                   description: Average value
 *                 display:
 *                   type: string
 *                   description: Display text
 *       404:
 *         description: Headquarters not found
 *
 * /api/headquarters/{id}/label:
 *   get:
 *     summary: Get headquarters label by ID
 *     tags: [Headquarters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Headquarters ID
 *     responses:
 *       200:
 *         description: Headquarters label created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 label:
 *                   type: string
 *                   description: Formatted location label
 *       404:
 *         description: Headquarters not found
 */
const express_1 = __importDefault(require("express"));
const headquartersRepo_1 = require("../repositories/headquartersRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Get all headquarters
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const headquarters = yield repo.findAll();
        res.json(headquarters);
    }
    catch (error) {
        next(error);
    }
}));
// Get a headquarters by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const headquarters = yield repo.findById(parseInt(req.params.id));
        if (headquarters) {
            res.json(headquarters);
        }
        else {
            res.status(404).send('Headquarters not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Create a new headquarters
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const hqValidator = new HeadquartersValidator(req.body.name, req.body.address);
        if (!hqValidator.isValid()) {
            res.status(400).send('Invalid headquarters data');
            return;
        }
        const newHeadquarters = yield repo.create(req.body);
        res.status(201).json(newHeadquarters);
    }
    catch (error) {
        next(error);
    }
}));
// Update a headquarters by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const hqValidator = HeadquartersValidator(req.body.name, req.body.address);
        if (!hqValidator.isValid()) {
            res.status(400).send('Invalid headquarters data');
            return;
        }
        const updatedHeadquarters = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedHeadquarters);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Headquarters not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete a headquarters by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Headquarters not found');
        }
        else {
            next(error);
        }
    }
}));
// Get headquarters metrics by ID
router.get('/:id/metrics', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const headquarters = yield repo.findById(parseInt(req.params.id));
        if (!headquarters) {
            res.status(404).send('Headquarters not found');
            return;
        }
        const metrics = calculateHeadquartersMetrics(headquarters.headquartersId, headquarters.floorCount || 0, headquarters.capacity || 0);
        res.json(metrics);
    }
    catch (error) {
        next(error);
    }
}));
// Get headquarters label by ID
router.get('/:id/label', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, headquartersRepo_1.getHeadquartersRepository)();
        const headquarters = yield repo.findById(parseInt(req.params.id));
        if (!headquarters) {
            res.status(404).send('Headquarters not found');
            return;
        }
        const label = createLocationLabel(headquarters.name, headquarters.city || '', headquarters.country || '');
        res.json({ label });
    }
    catch (error) {
        next(error);
    }
}));
// Inconsistent use of new: helper function used both as constructor and regular function
function HeadquartersValidator(name, address) {
    if (!validateHQName(name)) {
        throw new Error('Invalid headquarters name');
    }
    ;
    this.name = name;
    this.address = address;
    this.isValid = function () {
        return this.name && this.address;
    };
}
// Missing space in concatenation example
function createLocationLabel(name, city, country) {
    const label = `Location:${name}City:${city}Country:${country}`; // Missing spaces
    return label;
}
// Implicit operand conversion example
function calculateHeadquartersMetrics(id, floorCount, capacity) {
    // This will cause implicit conversion issues when mixed types are passed
    const totalScore = id + floorCount + capacity; // Could be string concatenation or numeric addition
    const averageValue = (id + floorCount) / 2; // Mixed type division
    const displayText = `HQ-${id}${floorCount}`; // Implicit string conversion
    return {
        score: totalScore,
        average: averageValue,
        display: displayText
    };
}
// Misleading indentation example
function validateHQName(hq) {
    if (hq.name)
        console.log('Name is valid');
    return true; // This appears to be part of the if, but it's not!
    console.log('Name is invalid');
    return false;
}
exports.default = router;
