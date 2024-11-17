import { initDuckDB } from '../../config/duckDbConfig.js';

let db;
let conn;
let isLoaded = false;
let currentTableName = null;
let loadedTables = new Set();

export async function initialize(connection) {
    db = connection.db;
    conn = connection.conn;
}

export function isDataLoaded() {
    return isLoaded;
}

export function getCurrentTableName() {
    return currentTableName;
}

export function getLoadedTables() {
    return Array.from(loadedTables); 
}

// This function is being called from the index.js file
export async function handleCsvUpload(file) {
    try {
        if (!conn) {
            throw new Error("Database connection not initialized");
        }

        const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9]/g, '_');
        currentTableName = tableName;
        
        // Register the file content with DuckDB
        await db.registerFileBuffer(file.name, new Uint8Array(await file.arrayBuffer()));
        
        // Create table from CSV without dropping existing ones
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} AS 
            SELECT * 
            FROM read_csv_auto('${file.name}', header=true, AUTO_DETECT=true)
        `);
        
        // Add table to our tracked tables
        loadedTables.add(tableName);
        console.log(loadedTables);
        
        // Update UI to show uploaded filename
        const fileInfoContainer = document.querySelector('.uploaded-file-info');
        const filenameElement = document.getElementById('uploaded-filename');
        if (fileInfoContainer && filenameElement) {
            const existingText = filenameElement.textContent;
            const newText = existingText ? `${existingText}, ${file.name}` : file.name;
            filenameElement.textContent = newText;
            fileInfoContainer.classList.remove('hidden');
        }

        // Get schema information
        const schemaInfo = await getSchema();
        isLoaded = true;

        return schemaInfo;
    } catch (error) {
        console.error("Error uploading CSV:", error);
        throw error;
    }
}

export async function getSchema() {
    try {
        if (!conn) {
            throw new Error("Database not initialized");
        }

        const result = await conn.query(`
            SELECT sql 
            FROM sqlite_master 
            WHERE type='table'
        `);

        return result;
    } catch (error) {
        console.error("Error getting schema:", error);
        throw error;
    }
}

export async function executeDuckDbQuery(query) {
    try {
        if (!conn) {
            throw new Error("Database connection not initialized");
        }

        const result = await conn.query(query, { returnResultType: "arrow" });
        return convertArrowToRows(result);
    } catch (error) {
        console.error("Error executing DuckDB query:", error);
        throw error;
    }
}

// converts arrows result from the executeDuckDbQuery function to rows
function convertArrowToRows(arrowResult) {
    const columns = arrowResult.schema.fields.map(field => field.name);
    const rows = [];
    
    for (const batch of arrowResult.batches) {
        const numRows = batch.numRows;
        const columnData = {};
        
        columns.forEach((col, i) => {
            columnData[col] = batch.getChildAt(i).toArray();
        });
        
        for (let i = 0; i < numRows; i++) {
            const row = {};
            columns.forEach(col => {
                let value = columnData[col][i];
                if (typeof value === 'bigint') {
                    value = Number(value);
                }
                row[col] = value;
            });
            rows.push(row);
        }
    }
    
    return rows;
}