// js/video-loader.js
async function loadVideoStream(manifestPath, pageType) {
    const container = document.getElementById('videoStreamContainer');
    if (!container) {
        console.error("Video stream container not found!");
        return;
    }

    try {
        const response = await fetch(manifestPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${manifestPath}`);
        }
        const videos = await response.json();

        if (!videos || videos.length === 0) {
            container.innerHTML = `<p class="info-message">No ${pageType} videos available at the moment.</p>`;
            return;
        }
        
        let htmlContent = '';
        videos.forEach(video => {
            // Construct YouTube embed URL from video ID or full URL
            let embedUrl = '';
            if (video.youtubeId) {
                embedUrl = `https://www.youtube.com/embed/${video.youtubeId}`;
            } else if (video.youtubeUrl) {
                // Attempt to extract ID from various YouTube URL formats
                const urlParams = new URLSearchParams(new URL(video.youtubeUrl).search);
                const videoIdFromUrl = urlParams.get('v') || video.youtubeUrl.split('/').pop().split('?')[0];
                if (videoIdFromUrl) {
                    embedUrl = `https://www.youtube.com/embed/${videoIdFromUrl}`;
                }
            }

            if (!embedUrl) {
                console.warn(`Could not determine embed URL for video: ${video.title}`);
                return; // Skip this video if no valid URL
            }

            const videoTitle = video.title || "Untitled Video";
            const videoDescription = video.description || "";

            htmlContent += `
                <div class="video-item animate-on-scroll">
                    <div class="video-player-wrapper">
                        <iframe 
                            src="${embedUrl}" 
                            title="${videoTitle}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-item-info">
                        <h3 class="video-item-title">${videoTitle}</h3>
                        ${videoDescription ? `<p class="video-item-description">${videoDescription}</p>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;

        // Apply IntersectionObserver to newly added video items
        if (typeof observeNewAnimatedElements === 'function') {
            observeNewAnimatedElements(container);
        }

    } catch (error) {
        console.error(`Error loading ${pageType} videos:`, error);
        container.innerHTML = `<p class="error-message">Could not load ${pageType} videos. Please check the console and ensure ${manifestPath} is accessible and correctly formatted.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we're on to load the correct manifest
    if (document.body.classList.contains('sport-page')) {
        loadVideoStream('sport-videos-manifest.json', 'sport');
    } else if (document.body.classList.contains('music-page')) {
        loadVideoStream('music-videos-manifest.json', 'music');
    }
});