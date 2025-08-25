# Contributing to Document Q&A Chatbot

We love your input! We want to make contributing to Document Q&A Chatbot as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the documentation with details of any changes, if applicable.
3. The PR should work for Node.js 18.x or higher.
4. Ensure all tests pass before submitting the PR.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your API keys (see README.md)
4. Start the development server: `npm run dev`

## Testing

Run the test scripts to ensure your changes don't break existing functionality:

```bash
node check-api-key.js
node test-embedding.js
# Add other relevant tests
```

## Code Style

- Use TypeScript when possible
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

### Bug Report Guidelines

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Provide specific examples to demonstrate the steps
4. Describe the behavior you observed after following the steps
5. Explain which behavior you expected to see instead
6. Include screenshots if applicable
7. Include your environment details (OS, browser, Node.js version, etc.)

## Feature Requests

We also use GitHub issues to track feature requests. Open an issue and provide the following information:

1. Use a clear and descriptive title
2. Describe the feature in detail
3. Explain why this feature would be useful
4. Provide examples of how this feature would be used

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
