// js/blog-listing-loader.js
async function loadBlogListing() {
    const container = document.getElementById('blogPostsContainer');
    if (!container) {
        console.error("Blog posts container not found!");
        return;
    }
    try {
        const response = await fetch('blog-manifest.json'); // Assumes manifest is in root
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching blog-manifest.json`);
        }
        const posts = await response.json();
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="info-message">No blog posts available at the moment.</p>';
            return;
        }

        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let htmlContent = '';
        posts.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            htmlContent += `
                <article class="blog-post-item animate-on-scroll">
                    <h3 class="blog-item-title"><a href="blog-viewer.html?post=${post.slug}">${post.title}</a></h3>
                    <p class="blog-item-date">Published: ${postDate}</p>
                    <p class="blog-item-excerpt">${post.excerpt}</p>
                    <a href="blog-viewer.html?post=${post.slug}" class="retro-btn-small">Read Article <span class="btn-arrow small">→</span></a>
                </article>
            `;
        });
        container.innerHTML = htmlContent;

        // Apply IntersectionObserver to newly added blog items
        if (typeof observeNewAnimatedElements === 'function') {
            observeNewAnimatedElements(container);
        }

    } catch (error) {
        console.error('Error loading blog posts list:', error);
        container.innerHTML = '<p class="error-message">Could not load blog posts. Please check the console and ensure blog-manifest.json is accessible and correctly formatted.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the blog listing page
    if (document.getElementById('blogPostsContainer')) {
        loadBlogListing();
    }
});