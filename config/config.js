/**
 * @fileoverview Main configuration orchestrator
 * @module config
 * 
 * @requires ../config/databaseConfig
 * @requires ../config/toolsConfig
 */

import { generateTools } from './toolsConfig.js';
import { getCurrentTableName, getTableSchema } from '../public/services/duckDbService.js';

let tools = [];

export async function updateTools() {
    const tableName = getCurrentTableName();
    if (!tableName) return;
    
    const schema = await getTableSchema(tableName);
    tools = generateTools(schema);
    console.log('Tools updated with new schema:', tools);
}

export { tools }; 