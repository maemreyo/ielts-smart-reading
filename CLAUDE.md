# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IELTS Smart Reading** is a Next.js 16 application for IELTS reading practice with lexical analysis and vocabulary learning features. The app provides interactive reading passages with multi-phase vocabulary drilling, auto-scroll functionality, and advanced reading tools.

## Development Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build       # TypeScript check + build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, TypeScript 5, Tailwind CSS 4
- **Components**: Extensive Radix UI primitives, Framer Motion animations
- **Forms**: React Hook Form with Zod validation
- **State**: React hooks (likely Zustand for global state)
- **Icons**: Lucide React
- **Build**: TypeScript compilation disabled (`strict: false`)

## Project Structure

```
src/
├── app/
│   ├── reading/
│   │   ├── [book]/[test]/[passage]/page.tsx  # Individual passage pages
│   │   └── page.tsx                          # Reading index with passage list
│   ├── layout.tsx
│   └── page.tsx                              # Root page (redirects to /reading)
├── components/
│   ├── ui/                                   # Radix UI base components
│   ├── reading/
│   │   ├── components/                       # Reading feature components
│   │   ├── hooks/                           # Custom reading hooks
│   │   └── utils/                           # Text processing utilities
│   └── vocabulary-learning/                 # Multi-phase vocabulary system
│       ├── components/, phases/, patterns/
│       └── audio/                           # Audio management
└── lib/, hooks/, styles/
```

## Data Structure

Reading passages and lexical data are stored in `/data/` organized by book number:

```
data/
├── 18/reading/test-1/
│   ├── passage-1.md          # Markdown passage content
│   ├── passage-2.md
│   ├── passage-3.md
│   ├── 1__.json             # Lexical items for passage 1
│   ├── 2__.json
│   └── 3__.json
```

### Lexical Items JSON Structure
Each lexical item contains:
- `targetLexeme`: Vocabulary word/phrase
- `sourceContext`: Original sentence
- `phase1Inference`: Contextual guessing (Vietnamese)
- `phase2Annotation`: Phonetic, definition, translation, collocations
- `phase3Production`: Example usage and sentence creation tasks

## Key Architecture Patterns

### Component Organization
- **Feature-based grouping**: Reading and vocabulary learning have dedicated component directories
- **Composition over inheritance**: Heavy use of component composition
- **Client/Server components**: Mixed strategy with `"use client"` directives

### State Management
- **Custom hooks**: Feature-specific hooks (`useReadingState`, `useAutoScroll`, `useKeyboardShortcuts`)
- **Local state**: React hooks for component state
- **Form handling**: React Hook Form with Zod schemas

### Routing
- Root path (`/`) redirects to `/reading`
- Dynamic routing: `/reading/[book]/[test]/[passage]`
- Static generation for reading pages

## Key Components and Files

### Core Reading Components
- `src/components/enhanced-reading-view-v2.tsx` - Main reading interface
- `src/components/reading/components/ReadingContent.tsx` - Passage rendering
- `src/components/reading/components/ReadingToolbar.tsx` - Reading controls
- `src/components/reading/utils/textProcessing.ts` - Lexical item processing

### Custom Hooks
- `src/components/reading/hooks/useReadingState.ts` - Reading state management
- `src/components/reading/hooks/useAutoScroll.ts` - Auto-scroll functionality
- `src/components/reading/hooks/useKeyboardShortcuts.ts` - Keyboard navigation
- `src/components/reading/hooks/useToolbarAutoHide.ts` - UI behavior

### Vocabulary Learning System
- `src/components/vocabulary-learning/VocabularyLearningScreen.tsx` - Main learning interface
- Multi-phase drilling system with card-based UI
- Audio integration for pronunciation

## Configuration

### Next.js (`next.config.ts`)
- Root redirect from `/` to `/reading`
- Dynamic rendering forced for reading pages

### TypeScript (`tsconfig.json`)
- Path alias: `@/*` → `./src/*`
- Strict mode disabled
- Target: ES2017

### Tailwind CSS
- Uses Tailwind CSS 4 with PostCSS
- Content sources: app, components, pages directories

## Adding New Content

1. **New Reading Passages**:
   - Create passage file: `data/{book}/reading/{test}/passage-{n}.md`
   - Create lexical data: `data/{book}/reading/{test}/{n}__.json`
   - Follow existing JSON structure for lexical items

2. **Vocabulary Features**:
   - Extend vocabulary learning components in `src/components/vocabulary-learning/`
   - Use existing phase-based learning pattern

## Development Notes

- **Mobile-responsive**: Mobile-first design with desktop adaptations
- **Accessibility**: Built on Radix UI for accessibility compliance
- **Performance**: Client-side rendering for interactive features
- **Data loading**: Static file system reading for passage data
- **Internationalization**: Supports Vietnamese translations in vocabulary system

## Existing Documentation

- `GEMINI.md` - Basic project overview and conventions
- `docs/self-learning-feature-spec.md` - Self-learning feature specifications
- `docs/passage-page-analysis.md` - Passage page technical analysis