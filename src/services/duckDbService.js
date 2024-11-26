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

// Convert Excel file to CSV data
async function excelToCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first worksheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convert to CSV
                const csvContent = XLSX.utils.sheet_to_csv(firstSheet);
                
                // Create a new File object with CSV content
                const csvFile = new File(
                    [csvContent],
                    file.name.replace(/\.[^/.]+$/, '.csv'),
                    { type: 'text/csv' }
                );
                
                resolve(csvFile);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// This function handles both CSV and Excel file uploads
export async function handleFileUpload(file) {
    try {
        if (!conn) {
            throw new Error("Database connection not initialized");
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Convert Excel to CSV if needed
        const processFile = ['xlsx', 'xls'].includes(fileExtension) 
            ? await excelToCSV(file)
            : file;

        const tableName = processFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        console.log(`Processing table: ${tableName}`);
        
        // Register the file content with DuckDB
        await db.registerFileBuffer(processFile.name, new Uint8Array(await processFile.arrayBuffer()));
        
        // Check if the file has headers
        const hasHeaders = await checkCsvHeaders(processFile.name);
        if (hasHeaders === false) {
            alert('1 or more headers are not present in file: ' + file.name);
            return false;
        }
        
        // Create table from file
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} AS 
            SELECT * 
            FROM read_csv_auto('${processFile.name}', header=${hasHeaders}, AUTO_DETECT=true)
        `);
        
        // Add table to our tracked tables
        loadedTables.add(tableName);
        
        // Set current table name only if it's not already set
        if (!currentTableName) {
            currentTableName = tableName;
        }
        
        console.log('Current loaded tables:', Array.from(loadedTables));
        
        // Get schema information
        const schemaInfo = await getSchema();
        isLoaded = true;
        return schemaInfo;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

export async function getSchema() {
    try {
        if (!conn) {
            throw new Error("Database not initialized");
        }

        // Get list of loaded table names
        const tableNames = Array.from(loadedTables);
        console.log('Table names:', tableNames);
        
        // Build a query to get schema for all loaded tables
        const result = await conn.query(`
            SELECT name, sql 
            FROM sqlite_master 
            WHERE type='table' 
            AND name IN (${tableNames.map(name => `'${name}'`).join(',')})
            ORDER BY name
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
        const hasHeaders = potentialHeaders.length === dataColumns.length || potentialHeaders.length > dataColumns.length;
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