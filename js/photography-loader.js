// js/photography-loader.js
async function loadPhotographyStream() {
    const container = document.getElementById('photoStreamContainer');
    if (!container) {
        console.error("Photo stream container not found!");
        return;
    }
    try {
        const response = await fetch('photos-manifest.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching photos-manifest.json`);
        }
        const photos = await response.json();

        if (!photos || photos.length === 0) {
            container.innerHTML = '<p class="info-message">No photos available in the gallery at the moment.</p>';
            return;
        }
        
        let htmlContent = '';
        photos.forEach(photo => {
            const imgSrc = photo.src_local || photo.src_placeholder || 'images/placeholder.jpg';
            const photoTitle = photo.title || "Untitled";
            const photoDescription = photo.description || "";

            htmlContent += `
                <div class="photo-item-wide animate-on-scroll"> 
                    <div class="photo-mat-wide">
                        <img src="${imgSrc}" alt="${photoTitle}" class="photo-image-wide">
                        <div class="photo-overlay-info">
                            <h3 class="photo-overlay-title">${photoTitle}</h3>
                            ${photoDescription ? `<p class="photo-overlay-description">${photoDescription}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;

        if (typeof observeNewAnimatedElements === 'function') {
            observeNewAnimatedElements(container);
        }

    } catch (error) {
        console.error('Error loading photography stream:', error);
        container.innerHTML = '<p class="error-message">Could not load photos. Please check the console and ensure photos-manifest.json is accessible and correctly formatted.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('photoStreamContainer')) {
        loadPhotographyStream();
    }
});