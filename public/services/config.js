import { generateTools } from './toolsConfig.js';
import { getSchema } from './duckDbService.js';

let tools = [];

export async function updateTools() {
    const schema = await getSchema();
    tools = generateTools(schema);
    console.log('Tools updated with new schema:', tools);
}

export { tools };
