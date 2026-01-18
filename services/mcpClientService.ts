import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class McpClientService {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
    private connecting: Promise<void> | null = null;

    async connect(): Promise<void> {
        if (this.client) return;

        if (this.connecting) {
            await this.connecting;
            return;
        }

        this.connecting = this.doConnect();
        await this.connecting;
        this.connecting = null;
    }

    private async doConnect(): Promise<void> {
        this.transport = new StdioClientTransport({
            command: 'npx',
            args: ['scryfall-mcp-server']
        });

        this.client = new Client(
            { name: 'funnyBot', version: '1.0.0' },
            { capabilities: {} }
        );

        await this.client.connect(this.transport);
    }

    async callTool(
        name: string,
        args: Record<string, unknown>
    ): Promise<string> {
        await this.connect();

        if (!this.client) {
            throw new Error('MCP client not connected');
        }

        const result = await this.client.callTool({ name, arguments: args });

        const content = result.content;
        if (Array.isArray(content) && content.length > 0) {
            const first = content[0];
            if (first.type === 'text') {
                return first.text;
            }
        }

        return JSON.stringify(content);
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
        this.transport = null;
    }
}

export const mcpClient = new McpClientService();
