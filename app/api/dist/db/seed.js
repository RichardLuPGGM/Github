"use strict";
/**
 * Database seeder for populating initial data
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
exports.DatabaseSeeder = void 0;
exports.seedDatabase = seedDatabase;
exports.reseedDatabase = reseedDatabase;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite_1 = require("./sqlite");
class DatabaseSeeder {
    constructor(db, seedsDir = './database/seed') {
        this.db = db;
        this.seedsDir = path_1.default.resolve(seedsDir);
    }
    /**
     * Check if database has been seeded
     */
    isSeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if any suppliers exist (assuming suppliers are seeded first)
                const result = yield this.db.get('SELECT COUNT(*) as count FROM suppliers');
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (_a) {
                // If table doesn't exist, database is not seeded
                return false;
            }
        });
    }
    /**
     * Get all seed files from the seeds directory
     */
    getSeedFiles() {
        if (!fs_1.default.existsSync(this.seedsDir)) {
            console.log(`Seeds directory not found: ${this.seedsDir}. Skipping seeding.`);
            return [];
        }
        return fs_1.default
            .readdirSync(this.seedsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort(); // Ensure predictable order
    }
    /**
     * Execute a seed file
     */
    executeSeedFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.default.join(this.seedsDir, filename);
            const sql = fs_1.default.readFileSync(filePath, 'utf-8');
            console.log(`🌱 Seeding from: ${filename}`);
            try {
                // Split SQL into individual statements and execute each
                const statements = sql
                    .split(';')
                    .map((stmt) => stmt.trim())
                    .filter((stmt) => stmt.length > 0);
                for (const statement of statements) {
                    if (statement.trim()) {
                        yield this.db.run(statement);
                    }
                }
                console.log(`✅ Seeded successfully: ${filename}`);
            }
            catch (error) {
                console.error(`❌ Failed to seed ${filename}:`, error);
                throw error;
            }
        });
    }
    /**
     * Seed the database with initial data
     */
    seedDatabase() {
        return __awaiter(this, arguments, void 0, function* (force = false) {
            console.log('🌱 Starting database seeding...');
            try {
                // Check if already seeded
                if (!force && (yield this.isSeeded())) {
                    console.log('✅ Database already seeded. Use force=true to re-seed.');
                    return;
                }
                // Get all seed files
                const seedFiles = this.getSeedFiles();
                if (seedFiles.length === 0) {
                    console.log('📝 No seed files found. Skipping seeding.');
                    return;
                }
                console.log(`📋 Found ${seedFiles.length} seed file(s)`);
                // Execute each seed file
                for (const filename of seedFiles) {
                    yield this.executeSeedFile(filename);
                }
                console.log('🎉 Database seeding completed successfully!');
            }
            catch (error) {
                console.error('💥 Seeding failed:', error);
                throw error;
            }
        });
    }
    /**
     * Clear all data from the database (useful for re-seeding)
     */
    clearDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧹 Clearing database...');
            try {
                // Get all table names
                const tables = yield this.db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'");
                // Disable foreign key constraints temporarily
                yield this.db.run('PRAGMA foreign_keys = OFF');
                // Clear all tables
                for (const table of tables) {
                    yield this.db.run(`DELETE FROM ${table.name}`);
                    console.log(`🗑️ Cleared table: ${table.name}`);
                }
                // Re-enable foreign key constraints
                yield this.db.run('PRAGMA foreign_keys = ON');
                console.log('✅ Database cleared successfully');
            }
            catch (error) {
                console.error('❌ Failed to clear database:', error);
                throw error;
            }
        });
    }
}
exports.DatabaseSeeder = DatabaseSeeder;
/**
 * Seed the database using the global database connection
 */
function seedDatabase() {
    return __awaiter(this, arguments, void 0, function* (force = false, isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        const seedsDir = path_1.default.join(__dirname, '../../database/seed');
        const seeder = new DatabaseSeeder(db, seedsDir);
        yield seeder.seedDatabase(force);
    });
}
/**
 * Clear and re-seed the database
 */
function reseedDatabase() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        const seedsDir = path_1.default.join(__dirname, '../../database/seed');
        const seeder = new DatabaseSeeder(db, seedsDir);
        yield seeder.clearDatabase();
        yield seeder.seedDatabase(true);
    });
}
