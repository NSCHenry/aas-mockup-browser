/**
 * AAS Dashboard Mockup Browser - Annotation System
 * Interactive annotation markers and tooltips for explaining mockup features
 */

const AnnotationSystem = {
    active: false,
    annotations: [],
    activeMarker: null,

    /**
     * Initialize annotation system
     */
    init() {
        this.loadAnnotationData();
        this.setupEventListeners();
    },

    /**
     * Load annotation data from JSON
     */
    async loadAnnotationData() {
        try {
            const response = await fetch('./assets/data/annotations.json');
            this.annotations = await response.json();
        } catch (error) {
            console.error('Failed to load annotations:', error);
            this.annotations = [];
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const toggleBtn = document.getElementById('toggleAnnotations');
        const closeTooltip = document.getElementById('closeTooltip');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (closeTooltip) {
            closeTooltip.addEventListener('click', () => this.hideTooltip());
        }

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            const tooltip = document.getElementById('annotationTooltip');
            const overlay = document.getElementById('annotationOverlay');

            if (this.active &&
                !tooltip.contains(e.target) &&
                !overlay.contains(e.target) &&
                !e.target.closest('#toggleAnnotations')) {
                this.hideTooltip();
            }
        });
    },

    /**
     * Toggle annotations on/off
     */
    toggle() {
        this.active = !this.active;
        this.updateUI();

        if (this.active) {
            this.loadAnnotations();
        } else {
            this.clearAnnotations();
            this.hideTooltip();
        }
    },

    /**
     * Update UI state
     */
    updateUI() {
        const toggleBtn = document.getElementById('toggleAnnotations');
        const indicator = toggleBtn.querySelector('.toggle-indicator');
        const overlay = document.getElementById('annotationOverlay');

        if (this.active) {
            toggleBtn.classList.add('active');
            indicator.textContent = 'ON';
            overlay.classList.add('active');
        } else {
            toggleBtn.classList.remove('active');
            indicator.textContent = 'OFF';
            overlay.classList.remove('active');
        }
    },

    /**
     * Load annotations for current mockup
     */
    loadAnnotations() {
        this.clearAnnotations();

        if (!this.active) return;

        const currentMockup = window.AppBrowser?.getCurrentMockup();
        if (!currentMockup) return;

        const mockupAnnotations = this.annotations.find(
            a => a.categoryId === currentMockup.categoryId &&
                 a.optionId === currentMockup.optionId
        );

        if (!mockupAnnotations || !mockupAnnotations.markers) return;

        const overlay = document.getElementById('annotationOverlay');

        mockupAnnotations.markers.forEach((marker, index) => {
            const markerEl = this.createMarker(marker, index + 1);
            overlay.appendChild(markerEl);
        });
    },

    /**
     * Create annotation marker element
     */
    createMarker(marker, number) {
        const markerEl = document.createElement('div');
        markerEl.className = 'annotation-marker';
        markerEl.textContent = number;
        markerEl.style.left = marker.x;
        markerEl.style.top = marker.y;

        markerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTooltip(marker, markerEl);
        });

        return markerEl;
    },

    /**
     * Show annotation tooltip
     */
    showTooltip(marker, markerEl) {
        const tooltip = document.getElementById('annotationTooltip');
        const title = document.getElementById('tooltipTitle');
        const content = document.getElementById('tooltipContent');

        // Update content
        title.textContent = marker.title;
        content.innerHTML = marker.description;

        // Position tooltip
        const markerRect = markerEl.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = tooltip.offsetHeight || 200;

        let left = markerRect.right + 16;
        let top = markerRect.top;

        // Keep tooltip in viewport
        if (left + tooltipWidth > window.innerWidth) {
            left = markerRect.left - tooltipWidth - 16;
        }

        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - 16;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';

        // Update marker state
        if (this.activeMarker) {
            this.activeMarker.classList.remove('active');
        }
        markerEl.classList.add('active');
        this.activeMarker = markerEl;
    },

    /**
     * Hide annotation tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('annotationTooltip');
        tooltip.style.display = 'none';

        if (this.activeMarker) {
            this.activeMarker.classList.remove('active');
            this.activeMarker = null;
        }
    },

    /**
     * Clear all annotation markers
     */
    clearAnnotations() {
        const overlay = document.getElementById('annotationOverlay');
        overlay.innerHTML = '';
        this.hideTooltip();
    },

    /**
     * Check if annotations are active
     */
    isActive() {
        return this.active;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AnnotationSystem.init();
});

// Export for use by other modules
window.AnnotationSystem = AnnotationSystem;
