"use strict";
/**
 * SQL helper utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectQueryBuilder = void 0;
exports.toSnakeCase = toSnakeCase;
exports.toCamelCase = toCamelCase;
exports.objectToSnakeCase = objectToSnakeCase;
exports.objectToCamelCase = objectToCamelCase;
exports.mapDatabaseRows = mapDatabaseRows;
exports.generatePlaceholders = generatePlaceholders;
exports.buildInsertSQL = buildInsertSQL;
exports.buildUpdateSQL = buildUpdateSQL;
exports.validateRequiredFields = validateRequiredFields;
/**
 * Simple query builder for SELECT statements
 */
class SelectQueryBuilder {
    constructor(table) {
        this.query = {
            select: ['*'],
            from: table,
            joins: [],
            where: [],
            orderBy: [],
        };
    }
    /**
     * Specify columns to select
     */
    select(columns) {
        this.query.select = columns;
        return this;
    }
    /**
     * Add JOIN clause
     */
    join(table, condition, type = 'INNER') {
        this.query.joins.push(`${type} JOIN ${table} ON ${condition}`);
        return this;
    }
    /**
     * Add WHERE condition
     */
    where(condition) {
        this.query.where.push(condition);
        return this;
    }
    /**
     * Add ORDER BY clause
     */
    orderBy(column, direction = 'ASC') {
        this.query.orderBy.push(`${column} ${direction}`);
        return this;
    }
    /**
     * Set LIMIT
     */
    limit(count) {
        this.query.limit = count;
        return this;
    }
    /**
     * Set OFFSET
     */
    offset(count) {
        this.query.offset = count;
        return this;
    }
    /**
     * Build the final SQL query
     */
    build() {
        let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.query.from}`;
        if (this.query.joins.length > 0) {
            sql += ` ${this.query.joins.join(' ')}`;
        }
        if (this.query.where.length > 0) {
            sql += ` WHERE ${this.query.where.join(' AND ')}`;
        }
        if (this.query.orderBy.length > 0) {
            sql += ` ORDER BY ${this.query.orderBy.join(', ')}`;
        }
        if (this.query.limit !== undefined) {
            sql += ` LIMIT ${this.query.limit}`;
        }
        if (this.query.offset !== undefined) {
            sql += ` OFFSET ${this.query.offset}`;
        }
        return sql;
    }
}
exports.SelectQueryBuilder = SelectQueryBuilder;
/**
 * Convert camelCase to snake_case for database columns
 */
function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}
/**
 * Convert snake_case to camelCase for JavaScript objects
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Convert object keys from camelCase to snake_case
 */
function objectToSnakeCase(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[toSnakeCase(key)] = value;
    }
    return result;
}
/**
 * Convert object keys from snake_case to camelCase with typed output
 */
function objectToCamelCase(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[toCamelCase(key)] = value;
    }
    return result;
}
/**
 * Convert multiple database rows to typed models
 */
function mapDatabaseRows(rows) {
    return rows.map((row) => objectToCamelCase(row));
}
/**
 * Generate placeholders for parameterized queries
 * @param count Number of placeholders needed
 * @returns String of comma-separated placeholders like "?, ?, ?"
 */
function generatePlaceholders(count) {
    return Array(count).fill('?').join(', ');
}
/**
 * Build INSERT SQL with placeholders
 */
function buildInsertSQL(table, data) {
    const snakeCaseData = objectToSnakeCase(data);
    const columns = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const placeholders = generatePlaceholders(columns.length);
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    return { sql, values };
}
/**
 * Build UPDATE SQL with placeholders
 */
function buildUpdateSQL(table, data, whereClause) {
    const snakeCaseData = objectToSnakeCase(data);
    const columns = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const setClause = columns.map((col) => `${col} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    return { sql, values };
}
/**
 * Validate required fields in an object
 */
function validateRequiredFields(obj, requiredFields) {
    for (const field of requiredFields) {
        if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
            throw new Error(`Required field '${field}' is missing or empty`);
        }
    }
}
