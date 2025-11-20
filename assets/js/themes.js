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
                --chart-color-1: #d97706 !important;
                --chart-color-2: #f59e0b !important;
                --chart-color-3: #dc2626 !important;
                --chart-color-4: #92400e !important;
                --chart-color-5: #ea580c !important;
            }

            body[data-theme="thanksgiving"] .dashboard-container {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            }

            body[data-theme="thanksgiving"] .metric-card,
            body[data-theme="thanksgiving"] .card {
                background: rgba(254, 243, 199, 0.3) !important;
                border: 1px solid rgba(217, 119, 6, 0.2) !important;
            }

            body[data-theme="thanksgiving"] .tile {
                border-left-color: #d97706 !important;
            }

            /* Christmas Theme */
            body[data-theme="christmas"] {
                --primary-color: #dc2626 !important;
                --primary-hover: #b91c1c !important;
                --success-color: #16a34a !important;
                --chart-color-1: #dc2626 !important;
                --chart-color-2: #16a34a !important;
                --chart-color-3: #eab308 !important;
                --chart-color-4: #b91c1c !important;
                --chart-color-5: #15803d !important;
            }

            body[data-theme="christmas"] .dashboard-container {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
            }

            body[data-theme="christmas"] .metric-card,
            body[data-theme="christmas"] .card {
                background: rgba(240, 253, 244, 0.5) !important;
                border: 1px solid rgba(22, 163, 74, 0.2) !important;
            }

            body[data-theme="christmas"] .tile {
                border-left-color: #dc2626 !important;
            }

            body[data-theme="christmas"] .metric-card:nth-child(even) .tile {
                border-left-color: #16a34a !important;
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
