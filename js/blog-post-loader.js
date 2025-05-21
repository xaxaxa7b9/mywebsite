// js/blog-post-loader.js

// Keep your existing parseFrontMatter function if it works for your .md files
// Or simplify/remove if your .md files don't use front matter or if the manifest provides all metadata.
function parseFrontMatter(markdownContent) {
    const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/;
    const match = markdownContent.match(frontMatterRegex);

    if (!match) {
        // console.log("No front matter found in markdown content.");
        return { metadata: {}, content: markdownContent };
    }

    const frontMatterBlock = match[1];
    const content = markdownContent.substring(match[0].length);
    const metadata = {};

    frontMatterBlock.split(/[\r\n]+/).forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            metadata[key] = value;
        }
    });
    return { metadata, content };
}

async function loadBlogPost() {
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');

    const titleEl = document.getElementById('blogPageTitle');
    const dateEl = document.getElementById('blogPageDate');
    const contentEl = document.getElementById('blogMarkdownContent');
    const pageTitleTag = document.querySelector('title');
    const metaDescriptionTag = document.querySelector('meta[name="description"]');

    if (!postSlug) {
        if (contentEl) contentEl.innerHTML = '<p class="error-message">Error: No blog post specified in the URL.</p>';
        if (titleEl) titleEl.textContent = "Error";
        if (pageTitleTag) pageTitleTag.textContent = "Error | Konrad Pikul"; // Updated site name
        console.error('Error: No blog post slug provided in URL query parameter "post".');
        return;
    }

    try {
        // 1. Fetch the manifest to find the post's metadata and markdown file path
        const manifestResponse = await fetch('blog-manifest.json'); // Assumes manifest is in root
        if (!manifestResponse.ok) {
            throw new Error(`Failed to load blog-manifest.json (Status: ${manifestResponse.status})`);
        }
        const posts = await manifestResponse.json();
        const postMeta = posts.find(p => p.slug === postSlug);

        if (!postMeta) {
            throw new Error(`Post with slug "${postSlug}" not found in blog-manifest.json.`);
        }

        const postTitle = postMeta.title || "Untitled Post";
        const formattedPostDate = postMeta.date ? new Date(postMeta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "";
        const postExcerpt = postMeta.excerpt || `Read the blog post: ${postTitle}.`;
        const markdownFilePath = postMeta.markdownFile; // Get path from manifest

        if (!markdownFilePath) {
            throw new Error(`No markdownFile path specified for slug "${postSlug}" in blog-manifest.json.`);
        }

        // Update page metadata early
        if (titleEl) titleEl.textContent = postTitle;
        if (dateEl && formattedPostDate) dateEl.textContent = `Published: ${formattedPostDate}`;
        else if (dateEl) dateEl.textContent = ''; // Clear if no date
        if (pageTitleTag) pageTitleTag.textContent = `${postTitle} | Konrad Pikul`;
        if (metaDescriptionTag) metaDescriptionTag.setAttribute('content', postExcerpt);

        // 2. Fetch the actual markdown content
        const mdResponse = await fetch(markdownFilePath);
        if (!mdResponse.ok) {
            throw new Error(`Could not fetch blog post: ${markdownFilePath} (Status: ${mdResponse.status})`);
        }
        const rawMarkdown = await mdResponse.text();

        // Note: If your manifest already has *all* metadata, and your .md files are *just* content,
        // you might not need parseFrontMatter here. 
        // But if .md files can override/add to manifest metadata via front matter, keep it.
        // For this example, we'll assume the manifest is the primary source for title/date displayed
        // on the page, and the .md file is primarily content.
        const { content } = parseFrontMatter(rawMarkdown); // We mainly want the content part

        if (contentEl) {
            if (typeof showdown === 'undefined') {
                console.error("Showdown.js is not loaded!");
                contentEl.innerHTML = "<p class='error-message'>Error: Markdown converter not available.</p>";
                return;
            }
            const converter = new showdown.Converter({
                ghCompatibleHeaderId: true,
                simpleLineBreaks: true,
                strikethrough: true,
                tables: true,
                tasklists: true, // Optional
                openLinksInNewWindow: true // Optional
            });
            converter.setFlavor('github'); // Recommended
            const html = converter.makeHtml(content);
            contentEl.innerHTML = html;
        } else {
            console.error('Markdown content container (blogMarkdownContent) not found.');
        }

    } catch (error) {
        console.error('Error loading or parsing blog post:', error);
        if (contentEl) contentEl.innerHTML = `<p class="error-message">Could not load the post: "${postSlug}". ${error.message}</p>`;
        if (titleEl) titleEl.textContent = "Error Loading Post";
        if (pageTitleTag) pageTitleTag.textContent = "Error | Konrad Pikul";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a blog viewer page (e.g., by looking for #blogMarkdownContent)
    if (document.getElementById('blogMarkdownContent') && window.location.pathname.includes('blog-viewer.html')) {
        loadBlogPost();
    }
});