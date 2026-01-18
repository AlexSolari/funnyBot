import type OpenAI from 'openai';
import { mcpClient } from './mcpClientService';

export const scryfallTools: OpenAI.Responses.Tool[] = [
    {
        type: 'function',
        name: 'search_cards',
        strict: null,
        description:
            'Search for Magic: The Gathering cards using Scryfall syntax. Returns matching cards with details.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description:
                        'Scryfall search query (e.g., "lightning bolt", "c:red cmc:1", "t:creature pow>=5")'
                }
            },
            required: ['query']
        }
    },
    {
        type: 'function',
        name: 'get_card_by_name',
        strict: null,
        description:
            'Get a specific Magic: The Gathering card by its exact name. Returns full card details including oracle text, mana cost, and prices.',
        parameters: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Exact card name (e.g., "Black Lotus", "Counterspell")'
                },
                set_code: {
                    type: 'string',
                    description: 'Optional 3-letter set code (e.g., "lea", "2ed")'
                }
            },
            required: ['name']
        }
    },
    {
        type: 'function',
        name: 'get_rulings',
        strict: null,
        description:
            'Get official rulings for a Magic: The Gathering card. Returns Oracle rulings and errata.',
        parameters: {
            type: 'object',
            properties: {
                card_name: {
                    type: 'string',
                    description: 'Name of the card to get rulings for'
                }
            },
            required: ['card_name']
        }
    },
    {
        type: 'function',
        name: 'get_prices_by_name',
        strict: null,
        description:
            'Get current market prices for a Magic: The Gathering card from multiple marketplaces.',
        parameters: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Card name to look up prices for'
                },
                set_code: {
                    type: 'string',
                    description: 'Optional set code to get prices for specific printing'
                }
            },
            required: ['name']
        }
    },
    {
        type: 'function',
        name: 'random_card',
        strict: null,
        description:
            'Get a random Magic: The Gathering card, optionally filtered by a query.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description:
                        'Optional Scryfall query to filter random selection (e.g., "c:blue t:instant")'
                }
            }
        }
    }
];

export async function executeToolCall(
    name: string,
    args: Record<string, unknown>
): Promise<string> {
    try {
        return await mcpClient.callTool(name, args);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return JSON.stringify({ error: message });
    }
}
