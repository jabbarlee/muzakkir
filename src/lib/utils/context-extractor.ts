/**
 * Extract context window (next N words) from a text selection
 * Used for phrase detection in dictionary lookup
 */

/**
 * Extract context window from a selection/range
 * @param selection - The window Selection object
 * @param wordsAfter - Number of words to extract after the selection (default: 2)
 * @returns Object with the clicked word and optional context string
 */
export function extractContextWindow(
  selection: Selection,
  wordsAfter: number = 2
): { word: string; context?: string } {
  if (!selection || selection.rangeCount === 0) {
    return { word: "" };
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (!selectedText) {
    return { word: "" };
  }

  // Extract the first word from selection (the clicked word)
  const words = selectedText.split(/\s+/).filter((w) => w.length > 0);
  const clickedWord = words[0] || "";

  if (!clickedWord) {
    return { word: "" };
  }

  // If selection contains multiple words, use them as context
  if (words.length > 1) {
    const contextWords = words.slice(1, words.length);
    return {
      word: clickedWord,
      context: contextWords.join(" "),
    };
  }

  // Try to extract context from the DOM after the selection
  try {
    // Get the container element (could be a paragraph, div, etc.)
    const container = range.commonAncestorContainer;
    const containerElement =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    if (!containerElement) {
      return { word: clickedWord };
    }

    // Get the full text content of the container
    const containerText = containerElement.textContent || "";
    
    // Find the position of the selected text in the container
    const selectedTextIndex = containerText.indexOf(selectedText);
    
    if (selectedTextIndex === -1) {
      return { word: clickedWord };
    }

    // Get text after the selection
    const textAfterSelection = containerText.slice(
      selectedTextIndex + selectedText.length
    );

    // Extract the next N words
    const contextWords = textAfterSelection
      .split(/\s+/)
      .filter((w) => w.trim().length > 0)
      .slice(0, wordsAfter);

    const contextText = contextWords.join(" ").trim();

    return {
      word: clickedWord,
      context: contextText || undefined,
    };
  } catch (error) {
    // If extraction fails, return just the clicked word
    console.warn("Failed to extract context window:", error);
    return { word: clickedWord };
  }
}

/**
 * Extract context window from a double-click event
 * Simpler version that gets text from the clicked position
 */
export function extractContextFromDoubleClick(
  event: MouseEvent,
  wordsAfter: number = 2
): { word: string; context?: string } {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { word: "" };
  }

  return extractContextWindow(selection, wordsAfter);
}

