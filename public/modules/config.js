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
                name: "createChart",
                description: "Create a chart with the provided x and y values",
                parameters: {
                    type: "object",
                    properties: {
                        x: { 
                            type: "array", 
                            description: "The fetched database x values for the chart", 
                            items: { type: "number" } 
                        },
                        y: { 
                            type: "array", 
                            description: "The fetched database y values for the chart", 
                            items: { type: "number" } 
                        },
                        chartType: { 
                            type: "string", 
                            description: "The type of chart to create", 
                            enum: ["line", "bar"] 
                        },
                        title: { 
                            type: "string", 
                            description: "The title of the chart"
                        },
                        xAxisTitle: { 
                            type: "string", 
                            description: "The title of the x axis"
                        },
                        yAxisTitle: { 
                            type: "string", 
                            description: "The title of the y axis"
                        }   
                    },
                    required: ["x", "y", "chartType", "title", "xAxisTitle", "yAxisTitle"],
                    additionalProperties: false
                }
            }
        },
        {
            type: "function",
            function: {
                name: "createCard",
                description: "Create a card with the provided title and content",
                parameters: {
                    type: "object",
                    properties: {
                        title: { 
                            type: "string",
                            description: "The title of the card"
                        },
                        value: { 
                            type: "number",
                            description: "The value of the card"
                        }
                    },
                    required: ["title", "value"],
                    additionalProperties: false
                }
            }
        }
    ];
}

export { tools, tableSchema, initializeTableSchema }; 