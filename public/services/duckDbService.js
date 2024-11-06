import { initDuckDB } from '../../config/duckDbConfig';

let db;
let conn;

// Modify initialize to accept the connection
async function initialize(connection) {
    db = connection.db;
    conn = connection.conn;
}

export { initialize };

// Initialize DuckDB on page load
document.addEventListener("DOMContentLoaded", () => {
    // Add event listener for CSV file upload
    const csvUpload = document.getElementById('csv-upload');
    if (csvUpload) {
        csvUpload.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    await handleCsvUpload(file);
                } catch (error) {
                    console.error("Failed to upload CSV:", error);
                }
            }
        });
    }
});

export async function handleCsvUpload(file) {
  try {
    if (!conn) {
      throw new Error("Database connection not initialized");
    }

    const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9]/g, '_');
    
    // Register the file content with DuckDB
    await db.registerFileBuffer(file.name, new Uint8Array(await file.arrayBuffer()));
    
    // Create table from CSV
    await conn.query(`
      DROP TABLE IF EXISTS ${tableName}
    `);

    await conn.query(`
      CREATE TABLE ${tableName} AS 
      SELECT * 
      FROM read_csv_auto('${file.name}', header=true, AUTO_DETECT=true)
    `);
    
    // Update UI to show uploaded filename
    const fileInfoContainer = document.querySelector('.uploaded-file-info');
    const filenameElement = document.getElementById('uploaded-filename');
    if (fileInfoContainer && filenameElement) {
        filenameElement.textContent = file.name;
        fileInfoContainer.classList.remove('hidden');
    }
    
    // Get the data in Arrow format
    const arrowResult = await conn.query(`
      SELECT * 
      FROM ${tableName} 
      LIMIT 5
    `, { returnResultType: "arrow" });
    
    // Get table info using Arrow format
    const tableInfo = await conn.query(`
      SELECT COUNT(*) as row_count 
      FROM ${tableName}
    `, { returnResultType: "arrow" });

    // Extract total rows from Arrow result
    const totalRows = Number(tableInfo.batches[0].getChildAt(0).get(0));

    // Convert Arrow result to JavaScript objects
    const columns = arrowResult.schema.fields.map(field => field.name);
    const rows = [];
    
    // Process each record batch in the Arrow result
    for (const batch of arrowResult.batches) {
        const numRows = batch.numRows;
        const columnData = {};
        
        // Initialize column data arrays
        columns.forEach((col, i) => {
            columnData[col] = batch.getChildAt(i).toArray();
        });
        
        // Create row objects
        for (let i = 0; i < numRows; i++) {
            const row = {};
            columns.forEach(col => {
                let value = columnData[col][i];
                // Convert BigInt to Number if needed
                if (typeof value === 'bigint') {
                    value = Number(value);
                }
                row[col] = value;
            });
            rows.push(row);
        }
    }

    console.log('Table columns:', columns);
    console.log('First 5 rows:', rows);
    console.log('Total rows in table:', totalRows);
    
    return {
        columns,
        rows,
        totalRows
    };
  } catch (error) {
    console.error("Error uploading CSV:", error);
    throw error;
  }
}

export async function executeDuckDbQuery(query) {
    try {
        if (!conn) {
            throw new Error("Database connection not initialized");
        }

        // Execute the query and get results in Arrow format
        const result = await conn.query(query, { returnResultType: "arrow" });
        
        // Convert Arrow result to JavaScript objects
        const columns = result.schema.fields.map(field => field.name);
        const rows = [];
        
        // Process each record batch in the Arrow result
        for (const batch of result.batches) {
            const numRows = batch.numRows;
            const columnData = {};
            
            // Initialize column data arrays
            columns.forEach((col, i) => {
                columnData[col] = batch.getChildAt(i).toArray();
            });
            
            // Create row objects
            for (let i = 0; i < numRows; i++) {
                const row = {};
                columns.forEach(col => {
                    let value = columnData[col][i];
                    // Convert BigInt to Number if needed
                    if (typeof value === 'bigint') {
                        value = Number(value);
                    }
                    row[col] = value;
                });
                rows.push(row);
            }
        }

        return rows;
    } catch (error) {
        console.error("Error executing DuckDB query:", error);
        throw error;
    }
}