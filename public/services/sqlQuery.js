/**
 * @fileoverview SQL query execution module
 * @module sqlQuery
 * 
 * @description
 * Handles all database-related operations:
 * - Executing SQL queries
 * - Retrieving table schema
 * - Error handling for database operations
 * 
 * @example
 * import { executeSqlQuery, getTableSchema } from './sqlQuery.js';
 * const results = await executeSqlQuery('SELECT * FROM orders');
 * const schema = await getTableSchema();
 */

export async function executeSqlQuery(query) {
    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        return result.data;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

export async function getTableSchema() {
    try {
        const query = `SELECT sql FROM sqlite_master WHERE type='table'`;
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        console.log(result.data);
        return result.data.map(table => table.sql).join('\n');
    } catch (error) {
        console.error('Error getting schema:', error);
        throw error;
    }
}
