"use strict";
/**
 * Repository for headquarters data access
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadquartersRepository = void 0;
exports.createHeadquartersRepository = createHeadquartersRepository;
exports.getHeadquartersRepository = getHeadquartersRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class HeadquartersRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all headquarters
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM headquarters ORDER BY headquarters_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get headquarters by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM headquarters WHERE headquarters_id = ?', [
                    id,
                ]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new headquarters
     */
    create(headquarters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('headquarters', headquarters);
                const result = yield this.db.run(sql, values);
                const createdHeadquarters = yield this.findById(result.lastID || 0);
                if (!createdHeadquarters) {
                    throw new Error('Failed to retrieve created headquarters');
                }
                return createdHeadquarters;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update headquarters by ID
     */
    update(id, headquarters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('headquarters', headquarters, 'headquarters_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Headquarters', id);
                }
                const updatedHeadquarters = yield this.findById(id);
                if (!updatedHeadquarters) {
                    throw new Error('Failed to retrieve updated headquarters');
                }
                return updatedHeadquarters;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Headquarters', id);
            }
        });
    }
    /**
     * Delete headquarters by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM headquarters WHERE headquarters_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Headquarters', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Headquarters', id);
            }
        });
    }
    /**
     * Check if headquarters exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM headquarters WHERE headquarters_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find headquarters by name (partial match)
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name', [`%${name}%`]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.HeadquartersRepository = HeadquartersRepository;
// Factory function to create repository instance
function createHeadquartersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new HeadquartersRepository(db);
    });
}
// Singleton instance for default usage
let headquartersRepo = null;
function getHeadquartersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        if (!headquartersRepo) {
            headquartersRepo = yield createHeadquartersRepository(isTest);
        }
        return headquartersRepo;
    });
}
