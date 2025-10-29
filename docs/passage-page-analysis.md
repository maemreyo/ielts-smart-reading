# Analysis of the Passage Page (`src/app/reading/[book]/[test]/[passage]/page.tsx`)

This document provides a comprehensive functional and technical analysis of the passage rendering page in the IELTS Smart Reading application.

## Functional Overview

From a user's perspective, this page displays a single IELTS reading passage. The user navigates to this page by selecting a specific passage from the main reading index. The page presents the passage title, the full text of the passage, and provides an enhanced reading experience with interactive lexical analysis features.

## Technical Breakdown

This page is a dynamic Next.js page that fetches and renders a specific reading passage based on the route parameters.

### Data Fetching

The `getPassageData` function is responsible for fetching the data for a specific passage. It takes the `book`, `test`, and `passage` numbers as input and performs the following actions:

1.  **Constructs the path:** It constructs the path to the data files using `path.join` and `process.cwd()`.
2.  **Reads the passage text:** It reads the passage content from a Markdown file (e.g., `passage-1.md`).
3.  **Reads the lexical data:** It reads the lexical analysis data from a JSON file (e.g., `1__.json`).
4.  **Returns the data:** It returns an object containing the passage text, lexical data, and metadata.

If any of the files are not found, it returns `null`, which triggers a 404 Not Found page.

### Rendering

The `ReadingPage` component is the default export of the page. It receives the route parameters (`params`) and uses them to fetch the passage data using the `getPassageData` function.

1.  **Data Processing:** It processes the fetched data to extract the title, paragraphs, and lexical items.
2.  **Component Rendering:** It then passes this data as props to the `EnhancedReadingViewV2` component, which is responsible for rendering the final view.

### Next.js Specific Features

*   **Dynamic Rendering:** The `export const dynamic = 'force-dynamic';` line at the top of the file ensures that the page is rendered dynamically on every request. This is useful for development, but for production, it might be better to use `generateStaticParams` to pre-render the pages.
*   **Static Site Generation (SSG):** The `generateStaticParams` function is used to generate the static parameters for all the available passages. This allows Next.js to pre-render all the passage pages at build time, which results in faster page loads and better performance.
*   **Metadata Generation:** The `generateMetadata` function is used to generate the metadata (title and description) for each passage page. This is important for SEO and for providing a better user experience.

## Component Interaction

The `ReadingPage` component has a clear separation of concerns. Its primary responsibility is to fetch and prepare the data. The actual rendering of the passage is delegated to the `EnhancedReadingViewV2` component. This makes the code more modular and easier to maintain.

## Data Dependencies

The page is highly dependent on the data stored in the `data` directory. The structure of this directory is crucial for the correct functioning of the page. The data is organized as follows:

```
data/
└── [book]/
    └── reading/
        └── [test]/
            ├── passage-[passage].md
            └── [passage]__.json
```

*   `passage-[passage].md`: A Markdown file containing the text of the reading passage.
*   `[passage]__.json`: A JSON file containing the lexical analysis data for the passage.

## Nested Components

The `ReadingPage` component delegates the rendering of the reading view to a series of nested components. This promotes modularity and separation of concerns.

### `EnhancedReadingViewV2`

This is the main component that orchestrates the entire reading experience. It is responsible for:

*   **State Management:** It uses a custom hook `useReadingState` to manage a wide range of state variables, including theme, font size, focus mode, and more.
*   **Component Composition:** It brings together the `ReadingToolbar`, `ReadingContent`, and `ShortcutsModal` components to create the complete reading view.
*   **Vocabulary Learning:** It includes a feature for vocabulary learning. When a user interacts with a lexical item, it displays a `VocabularyLearningScreen` as a full-screen overlay.
*   **Custom Hooks:** It leverages several custom hooks to handle complex functionalities:
    *   `useAutoScroll`: Manages the auto-scrolling feature.
    *   `useKeyboardShortcuts`: Implements keyboard shortcuts for various actions.
    *   `useToolbarAutoHide`: Automatically hides the toolbar when the user scrolls.
*   **Text Processing:** It uses a `createTextProcessor` utility to process the paragraphs and highlight the lexical items.

### `ReadingToolbar`

The `ReadingToolbar` component renders the toolbar at the top of the page. It is a responsive component that adapts to different screen sizes, showing a `MobileToolbar` on smaller screens and a `DesktopToolbar` on larger screens. The toolbar provides controls for:

*   Theme (light/dark)
*   Auto-scrolling (play/pause)
*   Reading speed
*   Various view modes (sentiment filter, focus mode, etc.)
*   Font and layout settings
*   A button to open the keyboard shortcuts modal

### `ReadingContent`

The `ReadingContent` component is responsible for rendering the main content of the reading passage. It receives the title, paragraphs, and lexical items as props and uses a `processParagraph` function to render each paragraph with the lexical items highlighted.

It supports two main rendering modes:

*   **Normal Mode:** Displays all paragraphs in a multi-column layout, with the current paragraph and any bookmarked paragraphs highlighted.
*   **Focus Mode:** Displays only the current paragraph, with controls for navigating to the next and previous paragraphs.

The component is also responsible for applying the selected theme, font, and layout styles to the content.

## Routing and Metadata

The page uses dynamic routing based on the `book`, `test`, and `passage` parameters in the URL. The `generateStaticParams` function ensures that only valid routes are accessible, and the `generateMetadata` function provides the appropriate metadata for each page.

