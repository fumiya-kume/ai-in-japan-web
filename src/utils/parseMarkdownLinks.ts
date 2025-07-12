export function parseMarkdownLinks(text: string): string {
  // Regular expression to match markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  // Replace markdown links with HTML anchor tags
  const parsed = text.replace(markdownLinkRegex, (match, linkText, url) => {
    // Ensure the URL is properly escaped
    const safeUrl = url.replace(/"/g, '&quot;');
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline">${linkText}</a>`;
  });
  
  return parsed;
}