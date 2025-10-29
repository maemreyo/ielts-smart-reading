# Word Highlighting Libraries and Techniques

This document outlines the best approaches for implementing word highlighting functionality in the IELTS Smart Reading application, specifically for the "Learn by Myself" feature.

## Requirement

The "Learn by Myself" feature requires the ability for users to select single words or phrases from a reading passage and have them highlighted. The list of highlighted words is dynamic and based on user interaction.

## Analysis of `react-highlight-words`

The `react-highlight-words` library is excellent for highlighting a **pre-defined** set of words within a text. You provide it with an array of `searchWords`, and it highlights all occurrences of those words.

**Conclusion:** This library is **not a complete solution** for the "Learn by Myself" feature because it does not provide a mechanism for the *user to select the words* directly from the text. It is only responsible for the rendering of the highlights after the words have been identified. Furthermore, if the advanced features below (like non-contiguous selection) are implemented by rendering each word in its own `<span>`, this library becomes redundant and is no longer necessary.

## Recommended Approach: Native Selection API

For dynamically selecting and highlighting text, the best and most flexible approach is to use the native browser **`Selection API`**.

This API provides the `window.getSelection()` method, which returns a `Selection` object. This object contains the text selected by the user and its location (range) within the DOM.

### Implementation Strategy

1.  **Capture User Selection:** Listen for a `mouseup` event on the text container.
2.  **Get Selection Object:** When the event fires, call `window.getSelection()` to get the user's selection.
3.  **Store Highlight Data:** Extract the selected text and its start/end positions. Store this information in the component's state (e.g., an array of highlight objects).
4.  **Render Highlights:** Re-render the text. In the render function, iterate through the stored highlight data. Split the original text into segments and wrap the highlighted portions in a `<span>` with a specific style (e.g., a background color).

This approach gives full control over the selection and highlighting process, which is necessary for the "Learn by Myself" feature. The project's own specification (`self-learning-feature-spec.md`) correctly identifies this as the required method.

### Handling Single vs. Multiple Occurrences

A key requirement is to highlight only the specific word or phrase instance that the user selects, not all other identical instances in the text. The `Selection API` approach handles this naturally.

The method works by identifying the selection's **exact position** within the text, not just its content.

1.  When a user selects text, we store its `start` and `end` character indices (e.g., characters 50 through 58).
2.  The state holds an array of these positional ranges: `[{ start: 50, end: 58, text: '...' }]`.
3.  During rendering, we apply the highlight style *only* to the characters between those specific indices.

This is fundamentally different from a text-search approach. We are not telling the component to "find and highlight all instances of the word 'threatened'". Instead, we are telling it to "highlight the characters from position 50 to 58". This is why other occurrences of the same word are ignored.

### Handling Non-Contiguous Collocations (e.g., 'take ... to ... A')

> **Note:** The granular approach described here gives you full control over each word. Because you are manually rendering and styling each word via `<span>` elements, you no longer need the `react-highlight-words` library. This method effectively replaces it.

The `Selection API` is ideal for continuous text selection (click and drag). However, to create collocations from words that are not next to each other, a more granular approach is needed, as outlined in the `self-learning-feature-spec.md`.

The `window.getSelection()` method is not suitable for this. Instead, the implementation strategy must be enhanced:

1.  **Word-level Granularity:** The passage text must be rendered by breaking it down into individual, addressable `<span>` elements, each containing a single word and having a unique identifier (e.g., `data-word-index="12"`).

    ```html
    <p>
      <span data-word-index="0">Polar</span> 
      <span data-word-index="1">bears</span> 
      <span data-word-index="2">are</span>...
    </p>
    ```

2.  **Click Event Handling with Modifier Key:** An `onClick` handler is attached to each word `<span>`.
    - Inside the handler, check for a modifier key: `event.ctrlKey` (for Windows/Linux) or `event.metaKey` (for macOS).
    - If a modifier key is pressed, add the word's information (its text and unique index) to a temporary array in your component's state (e.g., `pendingCollocation`).
    - The UI should provide feedback for these pending words, such as a temporary border or different background color.

3.  **Finalizing the Collocation:**
    - A dedicated UI element, such as a "Highlight Phrase" button in a floating toolbar, is required.
    - When the user clicks this button, you take the words stored in the `pendingCollocation` state, combine them into a single logical highlight, add this new highlight to your main list of saved highlights, and clear the temporary `pendingCollocation` array.

4.  **Complex Rendering Logic:** The rendering function must be updated to handle both types of highlights:
    - **Contiguous ranges:** Handled by the start/end index method.
    - **Non-contiguous collocations:** The renderer will iterate through all words and check if a word's unique index is part of any saved collocation highlight. If it is, it applies the highlight style.

This approach provides the necessary power and flexibility to build the advanced collocation selection feature.

### Other Use Cases and Edge Cases

Beyond the primary selection mechanisms, a robust implementation should consider the following scenarios:

#### Unhighlighting Selections

A user will inevitably want to remove a highlight. The most intuitive user experience for this is to click on an already-highlighted word or phrase to unhighlight it.

- **Implementation:** The main `onClick` handler (on the word-level `<span>`s) should include logic to check if the clicked word is part of an existing highlight. If it is, the handler should remove that highlight object from the state array and trigger a re-render. The logic needs to correctly identify which highlight entry the clicked word belongs to.

#### Handling Overlapping Highlights

This is a significant edge case. What should happen if a user tries to create a highlight that overlaps with an existing one? For example, highlighting "the effects of climate change" and then trying to highlight "climate change".

- **Complexity:** Allowing highlights to be merged, split, or nested introduces a great deal of state management complexity.
- **Recommended Strategy (Simplicity):** The most straightforward and recommended approach is to **disallow overlapping highlights**. Before adding a new highlight to the state, you should check if its range (or its constituent words, for a collocation) intersects with any existing highlights. If an intersection is detected, you can simply ignore the new selection, preventing the overlap from occurring. This keeps the rendering logic and state management clean and predictable.

### Example Conceptual Component

The following code demonstrates how to use the `Selection API` in a React component to allow user-driven highlighting.

```jsx
import React, { useRef, useState, useEffect } from 'react';

const HighlightableText = ({ passageText }) => {
  const textContainerRef = useRef(null);
  const [highlightedRanges, setHighlightedRanges] = useState([]);

  const handleMouseUp = () => {
    const selection = window.getSelection();

    if (selection.rangeCount > 0 && textContainerRef.current && textContainerRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();

      if (selectedText.trim().length > 0) {
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(textContainerRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selectedText.length;

        setHighlightedRanges(prevRanges => {
          const newHighlight = { start, end, text: selectedText };
          if (prevRanges.some(hr => hr.start === newHighlight.start && hr.end === newHighlight.end)) {
            return prevRanges;
          }
          return [...prevRanges, newHighlight];
        });
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const renderTextWithHighlights = () => {
    let lastIndex = 0;
    const elements = [];
    const sortedRanges = [...highlightedRanges].sort((a, b) => a.start - b.start);

    sortedRanges.forEach((highlight, index) => {
      if (highlight.start > lastIndex) {
        elements.push(<span key={`pre-${index}`}>{passageText.substring(lastIndex, highlight.start)}</span>);
      }
      elements.push(
        <span key={`highlight-${index}`} style={{ backgroundColor: 'yellow' }}>
          {passageText.substring(highlight.start, highlight.end)}
        </span>
      );
      lastIndex = highlight.end;
    });

    if (lastIndex < passageText.length) {
      elements.push(<span key="post-last">{passageText.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div ref={textContainerRef}>
      {renderTextWithHighlights()}
    </div>
  );
};

export default HighlightableText;
```
