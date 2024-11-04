/**
 * @fileoverview Main configuration orchestrator
 * @module config
 * 
 * @requires ../config/databaseConfig
 * @requires ../config/toolsConfig
 */

import { initializeTableSchema, tableSchema } from './databaseConfig.js';
import { generateTools } from './toolsConfig.js';

let tools = [];

async function initialize() {
    const schema = await initializeTableSchema();
    tools = generateTools(schema);
    console.log('Tools initialized:', tools);
}

export { tools, tableSchema, initialize as initializeTableSchema }; 