# LibraLM Desktop Extension (DXT)

One-click installation of LibraLM book knowledge for Claude Desktop. Access 50+ book summaries and chapter breakdowns without manual configuration.

## What is a DXT?

Desktop Extensions (DXT) are packaged MCP servers that can be installed directly in Claude Desktop with a single click. No need to edit configuration files or set up Python environments.

## Features

- 📚 **50+ Book Summaries** - Curated library of business, self-help, and educational books
- 🔍 **Smart Book Search** - Find books by title, author, or ISBN
- 📖 **Chapter Summaries** - Deep dive into individual chapters
- 🎯 **Instant Setup** - One-click installation in Claude Desktop
- 🔐 **Secure API** - Your API key is stored securely in Claude Desktop

## Installation

### Option 1: Download Pre-built Extension

1. Download the latest `libralm.dxt` from the [Releases page](https://github.com/libralm-ai/libralm_dxt/releases)
2. Open Claude Desktop
3. Go to **Settings** → **Extensions**
4. Click **Install from file...**
5. Select the downloaded `libralm.dxt` file
6. Enter your LibraLM API key when prompted
7. Click **Install**

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/libralm-ai/libralm_dxt.git
cd libralm_dxt

# Build the extension
python build.py

# The libralm.dxt file is now ready to install
```

## Getting an API Key

1. Visit [libralm.com](https://libralm.com)
2. Sign in with Google or GitHub
3. Copy your API key from the dashboard
4. Enter it during DXT installation

## Usage

Once installed, you can use these commands in Claude:

- "List all available books"
- "Get me a summary of Atomic Habits"
- "Show me chapter 3 of The 7 Habits of Highly Effective People"
- "What are the details for book ID 9780123456789?"
- "Give me the table of contents for Deep Work"

## Available Tools

The extension provides these MCP tools:

- `list_books` - List all available books with their basic information
- `get_book_details` - Get detailed information about a specific book
- `get_book_summary` - Get the main summary for a book
- `get_table_of_contents` - Get the table of contents with chapter descriptions
- `get_chapter_summary` - Get the summary for a specific chapter

## Resources and Prompts

The extension also provides:

- **Resources**: Access book metadata through URIs like `book://metadata/{book_id}`
- **Prompts**: Pre-configured prompts for book analysis and comparison

## Development

### Project Structure

```
libralm_dxt/
├── manifest.json           # Extension metadata and configuration
├── libralm_mcp_server.js   # MCP server implementation
├── package.json            # Node.js dependencies
├── build.py                # Build script
├── icon.png                # Extension icon (256x256)
└── README.md               # This file
```

### Building the Extension

The build script (`build.py`) performs these steps:

1. Validates the manifest.json
2. Creates a bundle directory
3. Copies source files
4. Installs Node.js dependencies
5. Creates the .dxt package

Once built, install the `libralm.dxt` file in Claude Desktop to use the extension.

## Troubleshooting

### "Invalid API key" error
- Verify your API key in the extension settings
- Ensure you've copied the complete key including the prefix

### No books showing up
- Check your internet connection
- Verify your API key hasn't exceeded its monthly limit
- Try reinstalling the extension

### Extension not loading
- Ensure Claude Desktop is up to date
- Check the extension logs in Claude Desktop
- Try removing and reinstalling the extension

## API Limits

- **Free tier**: 50 API calls per month
- **Pro tier**: Unlimited API calls
- Rate limiting: 10 requests per minute

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension locally
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@libralm.com
- 🐛 Issues: [GitHub Issues](https://github.com/libralm-ai/libralm_dxt/issues)
- 📚 Docs: [LibraLM Documentation](https://docs.libralm.com)

## Related Projects

- [LibraLM Web](https://libralm.com) - Web dashboard and API management
- [LibraLM MCP Server](https://github.com/libralm-ai/libralm_mcp_server) - Standalone MCP server
- [DXT Specification](https://github.com/anthropics/dxt) - Desktop Extension format

---

Built with ❤️ by the LibraLM team