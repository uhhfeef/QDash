import { initDuckDB } from './duckDbConfig.js';

let db;
let conn;
let isLoaded = false;
let currentTableName = null;
let loadedTables = new Set();

export async function initialize(connection) {
    if (!connection) {
        const instance = await initDuckDB();
        db = instance.db;
        conn = instance.conn;
    } else {
        db = connection.db;
        conn = connection.conn;
    }
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
        
        // Check if the file has headers
        const hasHeaders = await checkCsvHeaders(file.name);
        // console.log('hasHeaders value:', hasHeaders);
        // console.log('Type of hasHeaders:', typeof hasHeaders);
        // console.log('!hasHeaders evaluates to:', !hasHeaders);

        if (hasHeaders == false) {
            alert('1 or more headers are not present. Please check your CSV file and try again.');
            return false;
        }
        
        // Create table from CSV without dropping existing ones
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} AS 
            SELECT * 
            FROM read_csv_auto('${file.name}', header=${hasHeaders}, AUTO_DETECT=true)
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
        // console.error("Error executing DuckDB query:", error);
        throw error;
    }
}

export async function checkCsvHeaders(fileName) {
    try {
        console.log('Checking CSV headers...');
        // Read first row as raw text to preserve commas
        const rawResult = await conn.query(`
            SELECT *
            FROM read_csv_auto('${fileName}', header=false, AUTO_DETECT=true)
            LIMIT 2
        `);

        const rows = await rawResult.toArray();
        if (rows.length < 2) {
            return false; // Not enough rows to determine headers
        }

        // Get the first two rows
        const firstRow = Object.values(rows[0]).join(',');  // Convert to CSV string
        const secondRow = Object.values(rows[1]).join(','); // Convert to CSV string

        // Split by comma and filter out empty values
        const potentialHeaders = firstRow.split(',').filter(val => val.trim() !== '');
        const dataColumns = secondRow.split(',').filter(val => val.trim() !== '');

        // console.log('Potential headers:', potentialHeaders);
        // console.log('Data columns:', dataColumns);
        // console.log('Header count:', potentialHeaders.length);
        // console.log('Data column count:', dataColumns.length);

        // Return true if both rows have the same number of columns (indicating headers)
        const hasHeaders = potentialHeaders.length === dataColumns.length;
        // console.log('Has headers:', hasHeaders);
        return hasHeaders;
    } catch (error) {
        console.error('Error checking CSV headers:', error);
        return false; // Default to assuming no headers in case of error
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