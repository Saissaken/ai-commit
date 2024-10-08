# Project Overview

Create a Node.js-based CLI tool that uses AI to automatically implement code changes, run necessary commands, and create git commits based on natural language prompts.

## Core Functionality

- Accept a natural language prompt describing desired changes or new features.
- Analyze the existing project files.
- Generate necessary code changes based on the prompt and project context (we can index the relevant files and use that context to generate the code changes).
- Implement the generated code changes in the appropriate files.
- Run any required console commands (e.g., npm installations, build commands).
- Create a git commit with the implemented changes.

## Technologies Used

- Node.js
- TypeScript
- OpenAI API
- Bun
