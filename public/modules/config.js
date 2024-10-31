/**
 * @fileoverview Configuration and tool definitions module
 * @module config
 * 
 * @requires ../sqlQuery
 * 
 * @description
 * Manages system configuration and tool definitions:
 * - Database schema initialization
 * - Tool configurations for AI
 * - Function definitions for SQL and chart tools
 * 
 * @property {string} tableSchema - The database table schema
 * @property {Array<Object>} tools - Array of tool definitions for AI
 * 
 * @example
 * import { tools, initializeTableSchema } from './modules/config.js';
 * await initializeTableSchema();
 */

import { getTableSchema } from '../sqlQuery.js';

let tableSchema = '';
let tools = [];

async function initializeTableSchema() {
    try {
        tableSchema = await getTableSchema();
        initializeTools();
    } catch (error) {
        console.error('Error loading table schema:', error);
        tableSchema = 'Error loading schema';
    }
}

function initializeTools() {
    tools = [
        {
            type: "function",
            function: {
                name: "executeSqlQuery",
                strict: true,
                description: "Execute a SQL query on the database based on user request. The data will be used to create charts. You must always output 2 values, x and y. Schema is: " + tableSchema,
                parameters: {
                    type: "object",
                    properties: {
                        "query": {
                            type: "string",
                            description: "The SQL query to execute"
                        }
                    },
                    required: ["query"],
                    additionalProperties: false
                }
            },
        },
        {
            type: "function",
            function: {
                name: "createLineChart",
                description: "Create a line chart with the provided x and y values",
                parameters: {
                    type: "object",
                    properties: {
                        x: { 
                            type: "array", 
                            description: "The fetched database x values for the line chart", 
                            items: { type: "number" } 
                        },
                        y: { 
                            type: "array", 
                            description: "The fetched database y values for the line chart", 
                            items: { type: "number" } 
                        }
                    },
                    required: ["x", "y"],
                    additionalProperties: false
                }
            }
        }
    ];
}

export { tools, tableSchema, initializeTableSchema }; 