# Specification: "Learn by Myself" Feature

This document outlines the functional and technical specifications for the "Learn by Myself" feature.

## 1. Feature Overview

The "Learn by Myself" feature will provide users with a new mode to interact with reading passages. In this mode, users can select individual words or create multi-word phrases (collocations) from the text and highlight them. Once highlighted, users can copy the selected items to their clipboard or export them in various formats (text, CSV, JSON) for further study.

This feature empowers users to create their own personalized vocabulary lists directly from the reading passages, providing a more active and engaged learning experience.

## 2. User Interface and User Experience (UI/UX)

### 2.1. Initiating "Learn by Myself" Mode

*   On the main reading index page (`/reading`), each passage card will have a new button: "Learn by Myself".
*   Clicking this button will navigate the user to the reading passage in a new, dedicated "self-learning" mode.

### 2.2. Text Selection and Highlighting

*   **Selection Mechanism:**
    *   **Single Word Selection:** A simple click on a word will select it.
    *   **Multi-Word Phrase Selection (Collocation):** To create a phrase from non-contiguous words, the user will hold down a modifier key (e.g., `Ctrl` or `Cmd`) while clicking on the desired words. The selected words will be visually marked (e.g., with a temporary border) until the user finalizes the phrase.
    *   **Finalizing a Phrase:** After selecting the desired words for a phrase, the user will click a "Highlight" button that appears in a floating toolbar.
*   **Highlighting:**
    *   Once a word or phrase is highlighted, it will be visually distinct from the rest of the text (e.g., with a persistent background color).
    *   The application will maintain a list of all highlighted items.

### 2.3. Highlight Options

*   A floating toolbar will appear whenever a word or phrase is selected or highlighted. This toolbar will provide the following options:
    *   **Highlight:** To add the selected word/phrase to the list of highlighted items.
    *   **Copy:** This will be a dropdown with two options:
        *   **Copy All (Simple):** Copies all highlighted words/phrases to the clipboard, separated by commas.
        *   **Copy All (JSON):** Copies a JSON array of all highlighted items to the clipboard.
    *   **Export:** This will be a dropdown with three options:
        *   **Export as Text:** Downloads a `.txt` file with all highlighted words/phrases, one per line.
        *   **Export as CSV:** Downloads a `.csv` file with the highlighted words/phrases and their source context.
        *   **Export as JSON:** Downloads a `.json` file containing an array of objects, where each object represents a highlighted item in the specified format.

## 3. Technical Implementation Plan

### 3.1. Text Selection and Phrase Creation

*   We will need to implement a custom text selection logic to handle both single-word and multi-word phrase selection.
*   We can achieve this by adding event listeners to the paragraph elements. When a user clicks on a word, we can identify the word and its position in the text.
*   For multi-word phrase selection, we will track the selected words in the component's state. When the user clicks the "Highlight" button, we will combine the selected words into a single phrase.

### 3.2. State Management

*   We will need to manage the state of the highlighted items, including the `targetLexeme`, `sourceContext`, and other fields as specified in the JSON structure.
*   This state will be managed within a new component, likely a new version of the reading view (e.g., `SelfLearningView`).

### 3.3. New Components

*   **`SelfLearningView`:** A new component that will house the entire self-learning experience. It will be similar to `EnhancedReadingViewV2` but with the added functionality for text selection and highlighting.
*   **`FloatingToolbar`:** A new component for the floating toolbar that appears during text selection.
*   **`ExportMenu`:** A new component for the export dropdown menu.

## 4. External Libraries Research

Based on initial research, the following libraries and APIs will be useful:

*   **`react-highlight-words`:** This library is a good candidate for highlighting the selected words and phrases within the text. It is simple to use and provides the necessary functionality for our use case.
*   **Native Selection API:** For the complex requirement of selecting non-contiguous words to form a phrase, we will need to use the native browser [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection). This API provides the necessary methods to interact with the user's text selection.

## 5. Detailed Technical Implementation Plan

### 5.1. Text Selection and Phrase Creation

1.  **Word Segmentation:** The passage text will be rendered as a series of `<span>` elements, with each `<span>` containing a single word. This will make it easier to identify and handle clicks on individual words.
2.  **Event Handling:** An `onClick` event handler will be added to each word `<span>`. This handler will be responsible for:
    *   **Single Word Selection:** If the `Ctrl` or `Cmd` key is not pressed, a click will select a single word. The word and its context will be added to a temporary state.
    *   **Multi-Word Phrase Selection:** If the `Ctrl` or `Cmd` key is pressed, the clicked word will be added to an array of selected words in the component's state. The UI will be updated to indicate that the word has been selected (e.g., by adding a border).
3.  **Phrase Finalization:** When the user clicks the "Highlight" button in the floating toolbar, the words in the temporary state will be combined to form a phrase. The phrase and its context will then be added to the list of highlighted items.

### 5.2. State Management

*   A new `useSelfLearningState` custom hook will be created to manage the state of the self-learning mode. This hook will encapsulate the logic for managing the list of highlighted items, the temporary state for phrase creation, and any other state related to this feature.

### 5.3. Data Structure

The JSON data structure for exported items will be as follows:

```json
{
  "id": 1, // Can be a timestamp to ensure uniqueness
  "targetLexeme": "increasingly threatened", // The highlighted word or phrase
  "sourceContext": "Polar bears are being increasingly threatened by the effects of climate change...", // The sentence containing the highlighted item (truncated to < 18 words)
  "phase1Inference": {
    "contextualGuessVI": "" // Empty for now
  },
  "phase2Annotation": {
    "phonetic": "", // Empty for now
    "sentiment": "", // Empty for now
    "definitionEN": "", // Empty for now
    "translationVI": "", // Empty for now
    "relatedCollocates": [], // Empty for now
    "wordForms": {}
  },
  "phase3Production": {
    "taskType": "", // Empty for now
    "content": "" // Empty for now
  }
}
```
