# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript web application that visualizes AI tool adoption status in Japanese companies. The app fetches data from https://github.com/fumiya-kume/ai-in-japan and displays it in an interactive table with search, filtering, and sorting capabilities.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Technology Stack
- **React 18** with TypeScript for UI components
- **Vite** as the build tool and dev server
- **Tailwind CSS** for styling with dark mode support
- **ESLint** for code linting

### Data Flow
1. App fetches company data from GitHub (raw.githubusercontent.com)
2. Data is stored in component state and filtered/sorted based on user input
3. Company data includes adoption status for 5 AI tools: Cursor, Devin, GitHub Copilot, ChatGPT, and Claude Code
4. Each adoption status can be: "全社導入" (company-wide), "一部導入" (partial), or "導入してない" (not adopted)

### Key Components
- **App.tsx**: Main component managing state, data fetching, and filtering logic
- **CompanyTable**: Displays companies in a sortable table with expandable rows
- **FilterControls**: Handles tool and status filtering with AND/OR operators
- **SearchBar**: Standard text search for company names
- **AISearchBar**: AI-powered search using Gemini Nano (experimental)
- **AdoptionBadge**: Visual status indicators with color coding

### TypeScript Types
All types are defined in `src/types/index.ts`:
- `Company`: Core data model with company_name, tools, and source
- `AdoptionStatus`: Union type for adoption levels
- `ToolName`: Union type of supported AI tools
- Filter and sort related types

### Special Features
- **Dark Mode**: Toggle in header, persisted via CSS class on document root
- **AI Search**: Experimental Gemini Nano integration for natural language queries
- **Expandable Rows**: Click any table row to view source information
- **Multi-tool Filtering**: Filter by multiple tools with AND/OR logic