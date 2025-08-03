#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Server configuration
const API_URL = process.env.LIBRALM_API_URL || 'https://yjv5auah93.execute-api.us-east-1.amazonaws.com/prod';
const API_KEY = process.env.LIBRALM_API_KEY || '';

if (!API_KEY) {
  console.error('Warning: LIBRALM_API_KEY environment variable not set');
  console.error('Please set your API key: export LIBRALM_API_KEY=your-key-here');
}

// Create MCP server
const server = new Server(
  {
    name: 'Libralm Book Server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  }
);

// Helper function to make API calls
async function makeApiCall(endpoint) {
  const headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, { method: 'GET', headers });
  
  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your LibraLM API key.');
  } else if (response.status === 404) {
    throw new Error(`Resource not found: ${endpoint}`);
  } else if (response.status !== 200) {
    const text = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${text}`);
  }

  const result = await response.json();
  
  // Handle wrapped response format from Lambda
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data;
  }
  
  return result;
}

// Tool definitions
const tools = [
  {
    name: 'list_books',
    description: 'List all available books with their basic information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_book_summary',
    description: 'Get the main summary for a book',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'The book ID',
        },
      },
      required: ['book_id'],
    },
  },
  {
    name: 'get_book_details',
    description: 'Get detailed information about a specific book',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'The book ID',
        },
      },
      required: ['book_id'],
    },
  },
  {
    name: 'get_table_of_contents',
    description: 'Get the table of contents for a book with chapter descriptions',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'The book ID',
        },
      },
      required: ['book_id'],
    },
  },
  {
    name: 'get_chapter_summary',
    description: 'Get the summary for a specific chapter of a book',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'The book ID',
        },
        chapter_number: {
          type: 'integer',
          description: 'The chapter number',
        },
      },
      required: ['book_id', 'chapter_number'],
    },
  },
];

// Prompt definitions
const prompts = [
  {
    name: 'analyze_book',
    description: 'Generate a prompt to analyze a book\'s themes and content',
    arguments: [
      {
        name: 'book_id',
        description: 'The book ID to analyze',
        required: true,
      },
    ],
  },
  {
    name: 'compare_books',
    description: 'Generate a prompt to compare two books',
    arguments: [
      {
        name: 'book_id1',
        description: 'First book ID',
        required: true,
      },
      {
        name: 'book_id2',
        description: 'Second book ID',
        required: true,
      },
    ],
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle list prompts request
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts };
});

// Handle get prompt request
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'analyze_book':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please analyze the book with ID '${args.book_id}'. 

First, retrieve the book's details and summary using the available tools. Then provide:

1. A brief overview of the book's main thesis
2. The key themes and concepts covered
3. Notable insights or takeaways
4. Who would benefit most from reading this book
5. How the book relates to its category and target audience

If chapter summaries are available, use them to provide specific examples that support your analysis.`,
            },
          },
        ],
      };

    case 'compare_books':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please compare the books with IDs '${args.book_id1}' and '${args.book_id2}'.

Using the available tools, analyze both books and provide:

1. Main themes and topics of each book
2. Key similarities between the books
3. Important differences in approach or content
4. Which book might be better for different types of readers
5. How the books complement each other

Consider the books' categories, authors, and publication dates in your analysis.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Handle list resources request
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const data = await makeApiCall('/books');
    const books = data.books || [];
    
    const resources = books.map(book => ({
      uri: `book://metadata/${book.book_id}`,
      name: `${book.title} - Metadata`,
      description: `Comprehensive information about ${book.title}`,
      mimeType: 'text/markdown',
    }));
    
    return { resources };
  } catch (error) {
    console.error('Error listing resources:', error);
    return { resources: [] };
  }
});

// Handle read resource request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri.startsWith('book://metadata/')) {
    const bookId = uri.replace('book://metadata/', '');
    
    try {
      // Get book details
      const bookInfo = await makeApiCall(`/books/${bookId}`);
      
      // Try to get summary
      let bookSummary = null;
      try {
        const summaryData = await makeApiCall(`/books/${bookId}/summary`);
        bookSummary = summaryData.summary;
      } catch (e) {
        // Summary might not be available
      }
      
      // Format as readable text
      let info = `# ${bookInfo.title}\n\n`;
      if (bookInfo.subtitle) {
        info += `*${bookInfo.subtitle}*\n\n`;
      }
      info += `**Author:** ${bookInfo.author || 'Unknown'}\n`;
      info += `**Book ID:** ${bookInfo.book_id}\n`;
      info += `**Category:** ${bookInfo.category || 'Unknown'}\n`;
      info += `**Length:** ${bookInfo.length || 'Unknown'}\n`;
      info += `**Release Date:** ${bookInfo.release_date || 'Unknown'}\n`;
      info += `**Tier:** ${bookInfo.tier || 'Unknown'}\n\n`;
      
      if (bookSummary) {
        info += '## Book Summary\n\n';
        info += bookSummary + '\n\n';
      } else if (bookInfo.summary) {
        info += '## Book Description\n\n';
        info += bookInfo.summary + '\n\n';
      }
      
      if (bookInfo.has_summary || bookInfo.has_chapter_summaries || bookInfo.has_table_of_contents) {
        info += '## Available Resources\n\n';
        if (bookInfo.has_table_of_contents) {
          info += '- Table of contents with chapter descriptions\n';
        }
        if (bookInfo.has_summary) {
          info += '- Full book summary\n';
        }
        if (bookInfo.has_chapter_summaries) {
          info += '- Individual chapter summaries\n';
        }
      }
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: info,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: `Error retrieving book information: ${error.message}`,
          },
        ],
      };
    }
  }
  
  throw new Error(`Unknown resource URI: ${uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_books': {
        const data = await makeApiCall('/books');
        const books = data.books || [];
        
        // Sort by title
        books.sort((a, b) => a.title.localeCompare(b.title));
        
        if (books.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No books available.',
              },
            ],
          };
        }
        
        const bookList = books.map(book => {
          let info = `📚 ${book.title}`;
          if (book.author) info += ` by ${book.author}`;
          info += `\n   ID: ${book.book_id}`;
          if (book.category) info += ` | Category: ${book.category}`;
          if (book.tier) info += ` | Tier: ${book.tier}`;
          return info;
        }).join('\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `Found ${books.length} books:\n\n${bookList}`,
            },
          ],
        };
      }

      case 'get_book_summary': {
        const data = await makeApiCall(`/books/${args.book_id}/summary`);
        const summary = data.summary || '';
        
        // Return full summary text without truncation
        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        };
      }

      case 'get_book_details': {
        const book = await makeApiCall(`/books/${args.book_id}`);
        
        let details = `📚 ${book.title}\n`;
        if (book.subtitle) details += `   ${book.subtitle}\n`;
        details += `\nAuthor: ${book.author || 'Unknown'}`;
        details += `\nBook ID: ${book.book_id}`;
        details += `\nCategory: ${book.category || 'Unknown'}`;
        details += `\nLength: ${book.length || 'Unknown'}`;
        details += `\nRelease Date: ${book.release_date || 'Unknown'}`;
        details += `\nTier: ${book.tier || 'Unknown'}`;
        
        if (book.summary) {
          details += `\n\nDescription:\n${book.summary}`;
          // Add note if description appears truncated
          if (book.summary.endsWith('...') || book.summary.endsWith('...</p>')) {
            details += '\n\n*Note: This is the complete description available. For the full book summary, use the get_book_summary tool.*';
          }
        }
        
        details += '\n\nAvailable Content:';
        if (book.has_summary) details += '\n- Full book summary (use get_book_summary tool)';
        if (book.has_table_of_contents) details += '\n- Table of contents (use get_table_of_contents tool)';
        if (book.has_chapter_summaries) details += '\n- Chapter summaries (use get_chapter_summary tool)';
        
        return {
          content: [
            {
              type: 'text',
              text: details,
            },
          ],
        };
      }

      case 'get_table_of_contents': {
        const data = await makeApiCall(`/books/${args.book_id}/table_of_contents`);
        const toc = data.table_of_contents || '';
        
        // Return full table of contents without truncation
        return {
          content: [
            {
              type: 'text',
              text: toc,
            },
          ],
        };
      }

      case 'get_chapter_summary': {
        const data = await makeApiCall(`/books/${args.book_id}/chapters/${args.chapter_number}`);
        const summary = data.summary || '';
        
        // Return full chapter summary without truncation
        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LibraLM MCP server running...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});