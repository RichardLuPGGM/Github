"use strict";
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
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
 * /api/products:
 *   get:
 *     summary: Returns all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
const express_1 = __importDefault(require("express"));
const productsRepo_1 = require("../repositories/productsRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new product
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        const newProduct = yield repo.create(req.body);
        res.status(201).json(newProduct);
    }
    catch (error) {
        next(error);
    }
}));
// Get all products
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        const products = yield repo.findAll();
        res.json(products);
    }
    catch (error) {
        next(error);
    }
}));
// Get a product by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        const product = yield repo.findById(parseInt(req.params.id));
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).send('Product not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Get a product by name
router.get('/name/:name', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        const product = yield repo.findByName(req.params.name);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).send('Product not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update a product by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        const updatedProduct = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedProduct);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Product not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete a product by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, productsRepo_1.getProductsRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Product not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
