/**
 * AAS Dashboard Theme System
 * Handles theme switching for browser UI and dashboard iframes
 */

const ThemeSystem = {
    currentTheme: 'standard',
    themeSelector: null,

    /**
     * Initialize theme system
     */
    init() {
        this.themeSelector = document.getElementById('themeSelector');

        // Load saved theme or default to standard
        const savedTheme = localStorage.getItem('aas-theme') || 'standard';
        this.applyTheme(savedTheme);

        // Set dropdown to match
        if (this.themeSelector) {
            this.themeSelector.value = savedTheme;
            this.themeSelector.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    },

    /**
     * Apply theme to browser and dashboards
     */
    applyTheme(themeName) {
        this.currentTheme = themeName;

        // Apply to browser UI
        document.body.setAttribute('data-theme', themeName);

        // Save preference
        localStorage.setItem('aas-theme', themeName);

        // Apply to iframe if loaded
        this.applyThemeToIframe();
    },

    /**
     * Apply theme to dashboard iframe
     */
    applyThemeToIframe() {
        const iframe = document.getElementById('mockupFrame');
        if (!iframe || !iframe.contentDocument) return;

        try {
            const iframeDoc = iframe.contentDocument;
            const iframeBody = iframeDoc.body;

            if (iframeBody) {
                iframeBody.setAttribute('data-theme', this.currentTheme);

                // Inject theme styles if not already present
                if (!iframeDoc.getElementById('theme-styles')) {
                    this.injectThemeStyles(iframeDoc);
                }
            }
        } catch (e) {
            console.warn('Could not apply theme to iframe:', e);
        }
    },

    /**
     * Inject theme CSS into iframe
     */
    injectThemeStyles(iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.id = 'theme-styles';
        style.textContent = `
            /* Thanksgiving Theme */
            body[data-theme="thanksgiving"] {
                --primary-color: #d97706 !important;
                --primary-hover: #b45309 !important;
                --success-color: #16a34a !important;
            }

            body[data-theme="thanksgiving"] .dashboard-container {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            }

            body[data-theme="thanksgiving"] .metric-card,
            body[data-theme="thanksgiving"] .card,
            body[data-theme="thanksgiving"] .insight-card,
            body[data-theme="thanksgiving"] .region-card,
            body[data-theme="thanksgiving"] .market-card,
            body[data-theme="thanksgiving"] .split-card,
            body[data-theme="thanksgiving"] .specialty-card,
            body[data-theme="thanksgiving"] .comp-card {
                background: rgba(254, 243, 199, 0.4) !important;
                border: 1px solid rgba(217, 119, 6, 0.3) !important;
            }

            body[data-theme="thanksgiving"] .tile {
                border-left-color: #d97706 !important;
            }

            body[data-theme="thanksgiving"] .metric-value,
            body[data-theme="thanksgiving"] .status-badge.active,
            body[data-theme="thanksgiving"] .badge.primary {
                color: #d97706 !important;
            }

            body[data-theme="thanksgiving"] canvas {
                filter: hue-rotate(-30deg) saturate(1.2);
            }

            /* Christmas Theme */
            body[data-theme="christmas"] {
                --primary-color: #dc2626 !important;
                --primary-hover: #b91c1c !important;
                --success-color: #16a34a !important;
            }

            body[data-theme="christmas"] .dashboard-container {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
            }

            body[data-theme="christmas"] .metric-card,
            body[data-theme="christmas"] .card,
            body[data-theme="christmas"] .insight-card,
            body[data-theme="christmas"] .region-card,
            body[data-theme="christmas"] .market-card,
            body[data-theme="christmas"] .split-card,
            body[data-theme="christmas"] .specialty-card,
            body[data-theme="christmas"] .comp-card {
                background: rgba(240, 253, 244, 0.6) !important;
                border: 1px solid rgba(22, 163, 74, 0.3) !important;
            }

            body[data-theme="christmas"] .tile {
                border-left-color: #dc2626 !important;
            }

            body[data-theme="christmas"] .metric-card:nth-child(even) .tile {
                border-left-color: #16a34a !important;
            }

            body[data-theme="christmas"] .metric-value {
                color: #dc2626 !important;
            }

            body[data-theme="christmas"] .status-badge.active,
            body[data-theme="christmas"] .badge.primary {
                background: #dc2626 !important;
            }

            body[data-theme="christmas"] canvas {
                filter: hue-rotate(60deg) saturate(1.3);
            }
        `;

        iframeDoc.head.appendChild(style);
    },

    /**
     * Get current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeSystem.init();
});

// Export for use by other modules
window.ThemeSystem = ThemeSystem;
