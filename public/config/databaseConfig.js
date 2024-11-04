/**
 * @fileoverview Database configuration and schema management
 */

import { getTableSchema } from '../services/sqlQuery.js';

let tableSchema = '';

export async function initializeTableSchema() {
    try {
        tableSchema = await getTableSchema();
        console.log('Table schema loaded:', tableSchema);
    } catch (error) {
        console.error('Error loading table schema:', error);
        tableSchema = 'Error loading schema';
    }
    return tableSchema;
}

export { tableSchema }; 