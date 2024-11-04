/**
 * @fileoverview Tool definitions for AI interactions
 */

export function generateTools(tableSchema) {
    return [
        {
            type: "function",
            function: {
                name: "executeSqlQuery",
                strict: true,
                description: `Execute a SQL query on the database based on user request. The data will be used to create charts. For chart requests, you must always output 2 values, x and y. Schema is: ${tableSchema}`,
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