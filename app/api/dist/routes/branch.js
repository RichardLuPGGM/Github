"use strict";
/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: API endpoints for managing branches
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
 * /api/branches:
 *   get:
 *     summary: Returns all branches
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: List of all branches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Branch'
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *
 * /api/branches/{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *   put:
 *     summary: Update a branch
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       204:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 */
const express_1 = __importDefault(require("express"));
const branchesRepo_1 = require("../repositories/branchesRepo");
const errors_1 = require("../utils/errors");
const router = express_1.default.Router();
// Create a new branch
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, branchesRepo_1.getBranchesRepository)();
        const newBranch = yield repo.create(req.body);
        res.status(201).json(newBranch);
    }
    catch (error) {
        next(error);
    }
}));
// Get all branches
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, branchesRepo_1.getBranchesRepository)();
        const branches = yield repo.findAll();
        res.json(branches);
    }
    catch (error) {
        next(error);
    }
}));
// Get a branch by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, branchesRepo_1.getBranchesRepository)();
        const branch = yield repo.findById(parseInt(req.params.id));
        if (branch) {
            res.json(branch);
        }
        else {
            res.status(404).send('Branch not found');
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update a branch by ID
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, branchesRepo_1.getBranchesRepository)();
        const updatedBranch = yield repo.update(parseInt(req.params.id), req.body);
        res.json(updatedBranch);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Branch not found');
        }
        else {
            next(error);
        }
    }
}));
// Delete a branch by ID
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = yield (0, branchesRepo_1.getBranchesRepository)();
        yield repo.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            res.status(404).send('Branch not found');
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
