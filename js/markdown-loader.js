// js/markdown-loader.js
async function loadMarkdown(markdownFilePath, contentDivId, blogTitleId, blogDateId, pageTitlePrefix) {
    const contentDiv = document.getElementById(contentDivId);
    const blogTitleEl = document.getElementById(blogTitleId);
    const blogDateEl = document.getElementById(blogDateId);

    // These should be set in the specific HTML file for each blog post
    const postTitle = contentDiv.dataset.title || "Blog Post";
    const postDate = contentDiv.dataset.date || "";
    markdownFilePath = contentDiv.dataset.markdownfile || markdownFilePath;


    if (blogTitleEl) blogTitleEl.textContent = postTitle;
    if (blogDateEl) blogDateEl.textContent = postDate;
    document.title = `${pageTitlePrefix} | ${postTitle}`;

    if (!markdownFilePath) {
        if (contentDiv) contentDiv.innerHTML = '<p>Error: Markdown file path not specified.</p>';
        console.error('Error: Markdown file path not specified.');
        return;
    }

    try {
        const response = await fetch(markdownFilePath);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText} (fetching ${markdownFilePath})`);
        }
        const markdown = await response.text();
        const converter = new showdown.Converter({
            ghCompatibleHeaderId: true,
            simpleLineBreaks: true,
            strikethrough: true,
            tables: true,
            tasklists: true
        });
        converter.setFlavor('github');
        const html = converter.makeHtml(markdown);
        if (contentDiv) {
            contentDiv.innerHTML = html;
        } else {
            console.error(`Markdown content container with ID '${contentDivId}' not found.`);
        }
    } catch (error) {
        console.error('Error fetching or parsing markdown:', error);
        if (contentDiv) {
            contentDiv.innerHTML = `<p>Error loading blog post content. Please check if the file exists at: ${markdownFilePath}</p>`;
        }
    }
}