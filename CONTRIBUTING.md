# Contributing to LibraLM DXT

Thank you for your interest in contributing to LibraLM Desktop Extension!

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/libralm_dxt.git
   cd libralm_dxt
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your API key**
   ```bash
   export LIBRALM_API_KEY="your-api-key"
   ```

## Making Changes

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally
   ```bash
   python server.py  # Test the MCP server
   python build.py   # Build the DXT package
   ```

3. Commit your changes
   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   ```

4. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

## Code Style

- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to functions
- Keep functions focused and small

## Testing

Before submitting a PR:

1. Test the MCP server locally
2. Build the DXT package successfully
3. Install and test in Claude Desktop
4. Verify all tools work as expected

## Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide error messages and logs
- Mention your OS and Python version

## Questions?

Feel free to open an issue for any questions about contributing!