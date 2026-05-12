import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import jsforce from "jsforce";
import dotenv from "dotenv";

dotenv.config();

const conn = new jsforce.Connection({
    instanceUrl: process.env.SF_INSTANCE_URL,
    accessToken: process.env.SF_ACCESS_TOKEN
});

const server = new Server(
    {
        name: "salesforce-mcp",
        version: "1.0.0"
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

/* LIST TOOLS */

server.setRequestHandler(
    ListToolsRequestSchema,
    async () => {
        return {
            tools: [
                {
                    name: "query_accounts",
                    description: "Query Salesforce accounts",
                    inputSchema: {
                        type: "object",
                        properties: {},
                        required: []
                    }
                }
            ]
        };
    }
);

/* CALL TOOL */

server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {

        if (request.params.name === "query_accounts") {

            const result = await conn.query(
                "SELECT Id, Name FROM Account LIMIT 10"
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result.records, null, 2)
                    }
                ]
            };
        }

        throw new Error("Unknown tool");
    }
);

/* START SERVER */

const transport = new StdioServerTransport();

await server.connect(transport);

console.log("Salesforce MCP Server Running...");