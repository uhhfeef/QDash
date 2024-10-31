async function executeSqlQuery(query) {
    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        // result.data.forEach(row => {
        //     console.log(row);
        // });


        return result.data;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

async function getTableSchema() {
    try {
        const query = `SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'`;
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        return result.data[0].sql;
    } catch (error) {
        console.error('Error getting schema:', error);
        throw error;
    }
}
