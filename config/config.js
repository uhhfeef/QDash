import { generateTools } from './toolsConfig.js';
import { getCurrentTableName, getSchema } from '../public/services/duckDbService.js';

let tools = [];

export async function updateTools() {
    // const tableName = getCurrentTableName();
    // if (!tableName) return;
    
    const schema = await getSchema();
    tools = generateTools(schema);
    console.log('Tools updated with new schema:', tools);
}

export { tools }; 