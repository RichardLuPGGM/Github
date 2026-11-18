"use strict";
/**
 * Database migration runner
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
exports.MigrationRunner = void 0;
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite_1 = require("./sqlite");
class MigrationRunner {
    constructor(db, migrationsDir = './database/migrations') {
        this.db = db;
        this.migrationsDir = path_1.default.resolve(migrationsDir);
    }
    /**
     * Initialize the migrations table
     */
    initializeMigrationsTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
                version INTEGER PRIMARY KEY,
                filename TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;
            yield this.db.run(sql);
        });
    }
    /**
     * Get all migration files from the migrations directory
     */
    getMigrationFiles() {
        if (!fs_1.default.existsSync(this.migrationsDir)) {
            throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
        }
        const files = fs_1.default
            .readdirSync(this.migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();
        return files.map((filename) => {
            const version = this.extractVersionFromFilename(filename);
            const filePath = path_1.default.join(this.migrationsDir, filename);
            const sql = fs_1.default.readFileSync(filePath, 'utf-8');
            return {
                version,
                filename,
                sql,
            };
        });
    }
    /**
     * Extract version number from migration filename
     * Expected format: 001_description.sql
     */
    extractVersionFromFilename(filename) {
        const match = filename.match(/^(\d+)_/);
        if (!match) {
            throw new Error(`Invalid migration filename format: ${filename}. Expected format: 001_description.sql`);
        }
        return parseInt(match[1], 10);
    }
    /**
     * Get applied migrations from the database
     */
    getAppliedMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.db.all('SELECT version FROM migrations ORDER BY version');
            return rows.map((row) => row.version);
        });
    }
    /**
     * Apply a single migration
     */
    applyMigration(migration) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Applying migration ${migration.version}: ${migration.filename}`);
            try {
                // Split SQL into individual statements and execute each
                const statements = migration.sql
                    .split(';')
                    .map((stmt) => stmt.trim())
                    .filter((stmt) => stmt.length > 0);
                for (const statement of statements) {
                    if (statement.trim()) {
                        yield this.db.run(statement);
                    }
                }
                // Record the migration as applied
                yield this.db.run('INSERT INTO migrations (version, filename) VALUES (?, ?)', [
                    migration.version,
                    migration.filename,
                ]);
                console.log(`✅ Migration ${migration.version} applied successfully`);
            }
            catch (error) {
                console.error(`❌ Failed to apply migration ${migration.version}: ${error}`);
                throw error;
            }
        });
    }
    /**
     * Run all pending migrations
     */
    runMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚀 Starting database migration...');
            try {
                // Initialize migrations table
                yield this.initializeMigrationsTable();
                // Get all migrations and applied migrations
                const availableMigrations = this.getMigrationFiles();
                const appliedMigrations = yield this.getAppliedMigrations();
                // Find pending migrations
                const pendingMigrations = availableMigrations.filter((migration) => !appliedMigrations.includes(migration.version));
                if (pendingMigrations.length === 0) {
                    console.log('✅ No pending migrations. Database is up to date.');
                    return;
                }
                console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);
                // Apply each pending migration
                for (const migration of pendingMigrations) {
                    yield this.applyMigration(migration);
                }
                console.log('🎉 All migrations completed successfully!');
            }
            catch (error) {
                console.error('💥 Migration failed:', error);
                throw error;
            }
        });
    }
    /**
     * Get the current database version
     */
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeMigrationsTable();
            const result = yield this.db.get('SELECT MAX(version) as version FROM migrations');
            return (result === null || result === void 0 ? void 0 : result.version) || 0;
        });
    }
}
exports.MigrationRunner = MigrationRunner;
/**
 * Run migrations using the global database connection
 */
function runMigrations() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        const migrationsDir = path_1.default.join(__dirname, '../../database/migrations');
        const runner = new MigrationRunner(db, migrationsDir);
        yield runner.runMigrations();
    });
}
