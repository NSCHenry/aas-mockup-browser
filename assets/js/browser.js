/**
 * AAS Dashboard Mockup Browser - Main Application Logic
 * Handles navigation, mockup loading, and UI interactions
 */

// Application State
const AppState = {
    currentCategory: null,
    currentOption: null,
    categories: [
        {
            id: 'executive-overview',
            name: 'Executive Overview',
            options: [
                { id: 'option1-grid', name: 'Grid Layout', file: 'executive-overview-option1-grid.html' },
                { id: 'option2-dashboard', name: 'Dashboard View', file: 'executive-overview-option2-dashboard.html' },
                { id: 'option3-executive', name: 'Executive Summary', file: 'executive-overview-option3-executive.html' }
            ]
        },
        {
            id: 'financial-deepdive',
            name: 'Financial Deep Dive',
            options: [
                { id: 'option1-charts-left', name: 'Charts Left', file: 'financial-deepdive-option1-charts-left.html' },
                { id: 'option2-full-width', name: 'Full Width', file: 'financial-deepdive-option2-full-width.html' },
                { id: 'option3-tabbed', name: 'Tabbed View', file: 'financial-deepdive-option3-tabbed.html' }
            ]
        },
        {
            id: 'growth-pipeline',
            name: 'Growth Pipeline',
            options: [
                { id: 'option1-funnel', name: 'Funnel View', file: 'growth-pipeline-option1-funnel.html' },
                { id: 'option2-timeline', name: 'Timeline View', file: 'growth-pipeline-option2-timeline.html' },
                { id: 'option3-crm', name: 'CRM Style', file: 'growth-pipeline-option3-crm.html' },
                { id: 'option4-geographic', name: 'Geographic Expansion', file: 'geographic-expansion.html' },
                { id: 'option5-supply-demand-geo', name: 'Supply & Demand - Geographic', file: 'growth-pipeline-option5-supply-demand-geo.html' },
                { id: 'option6-supply-demand-providers', name: 'Supply & Demand - Providers', file: 'growth-pipeline-option6-supply-demand-providers.html' },
                { id: 'option7-supply-demand-competition', name: 'Supply & Demand - Competition', file: 'growth-pipeline-option7-supply-demand-competition.html' }
            ]
        },
        {
            id: 'operations',
            name: 'Operations',
            options: [
                { id: 'option1-map', name: 'Map View', file: 'operations-option1-map.html' },
                { id: 'option2-status', name: 'Status Board', file: 'operations-option2-status.html' },
                { id: 'option3-calendar', name: 'Calendar View', file: 'operations-option3-calendar.html' }
            ]
        },
        {
            id: 'revenue-cycle',
            name: 'Revenue Cycle',
            options: [
                { id: 'option1-process', name: 'Process Flow', file: 'revenue-cycle-option1-process.html' },
                { id: 'option2-metrics', name: 'Metrics Dashboard', file: 'revenue-cycle-option2-metrics.html' },
                { id: 'option3-comparison', name: 'Comparison View', file: 'revenue-cycle-option3-comparison.html' }
            ]
        },
        {
            id: 'provider-management',
            name: 'Provider Management',
            options: [
                { id: 'option1-cards', name: 'Card Layout', file: 'provider-management-option1-cards.html' },
                { id: 'option2-analytics', name: 'Analytics View', file: 'provider-management-option2-analytics.html' },
                { id: 'option3-recruitment', name: 'Recruitment Focus', file: 'provider-management-option3-recruitment.html' }
            ]
        },
        {
            id: 'client-satisfaction',
            name: 'Client Satisfaction',
            options: [
                { id: 'option1-scorecard', name: 'Scorecard', file: 'client-satisfaction-option1-scorecard.html' },
                { id: 'option2-risk', name: 'Risk Analysis', file: 'client-satisfaction-option2-risk.html' },
                { id: 'option3-timeline', name: 'Timeline View', file: 'client-satisfaction-option3-timeline.html' }
            ]
        },
        {
            id: 'patient-satisfaction',
            name: 'Patient Satisfaction',
            options: [
                { id: 'option1-scorecard', name: 'Scorecard', file: 'patient-satisfaction-option1-scorecard.html' },
                { id: 'option2-by-location', name: 'By Location', file: 'patient-satisfaction-option2-by-location.html' },
                { id: 'option3-quality', name: 'Quality Metrics', file: 'patient-satisfaction-option3-quality.html' }
            ]
        },
        {
            id: 'compliance',
            name: 'Compliance',
            options: [
                { id: 'credentialing', name: 'Provider Credentialing', file: 'compliance-credentialing.html' },
                { id: 'billing-coding', name: 'Billing & Coding', file: 'compliance-billing-coding.html' },
                { id: 'contract-risk', name: 'Contract & Regulatory Risk', file: 'compliance-contract-risk.html' },
                { id: 'phi-security', name: 'PHI Security & Access', file: 'compliance-phi-security.html' },
                { id: 'vendor-baa', name: 'Vendor BAA Management', file: 'compliance-vendor-baa.html' },
                { id: 'phi-training', name: 'PHI Incident & Training', file: 'compliance-phi-training.html' }
            ]
        },
        {
            id: 'scenario-planning',
            name: 'Scenario Planning',
            options: [
                { id: 'what-if-analysis', name: 'Interactive What-If Analysis', file: 'scenario-planning.html' }
            ]
        }
    ]
};

// DOM Elements
let elements = {};

/**
 * Initialize the application
 */
function init() {
    // Cache DOM elements
    elements = {
        categoryNav: document.getElementById('categoryNav'),
        optionTabs: document.getElementById('optionTabs'),
        mockupFrame: document.getElementById('mockupFrame'),
        iframeWrapper: document.getElementById('iframeWrapper'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        currentCategory: document.getElementById('currentCategory'),
        currentOption: document.getElementById('currentOption'),
        fullscreenBtn: document.getElementById('fullscreenBtn'),
        toggleAnnotations: document.getElementById('toggleAnnotations')
    };

    // Render navigation
    renderCategoryNav();

    // Setup event listeners
    setupEventListeners();

    // Load first category by default
    if (AppState.categories.length > 0) {
        selectCategory(AppState.categories[0].id);
    }
}

/**
 * Render category navigation in sidebar
 */
function renderCategoryNav() {
    const nav = elements.categoryNav;
    nav.innerHTML = '';

    AppState.categories.forEach(category => {
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'category-group';

        const button = document.createElement('button');
        button.className = 'category-button';
        button.dataset.categoryId = category.id;
        button.innerHTML = `
            <span>
                <span class="category-icon">📊</span>
                ${category.name}
            </span>
            <span class="category-count">${category.options.length}</span>
        `;

        button.addEventListener('click', () => selectCategory(category.id));

        categoryGroup.appendChild(button);
        nav.appendChild(categoryGroup);
    });
}

/**
 * Render option tabs for selected category
 */
function renderOptionTabs(categoryId) {
    const category = AppState.categories.find(c => c.id === categoryId);
    if (!category) return;

    const tabs = elements.optionTabs;
    tabs.innerHTML = '';

    category.options.forEach(option => {
        const tab = document.createElement('button');
        tab.className = 'option-tab';
        tab.dataset.optionId = option.id;
        tab.textContent = option.name;

        tab.addEventListener('click', () => selectOption(categoryId, option.id));

        tabs.appendChild(tab);
    });
}

/**
 * Select a category
 */
function selectCategory(categoryId) {
    const category = AppState.categories.find(c => c.id === categoryId);
    if (!category) return;

    AppState.currentCategory = categoryId;

    // Update UI
    updateCategoryUI(categoryId);
    renderOptionTabs(categoryId);

    // Select first option by default
    if (category.options.length > 0) {
        selectOption(categoryId, category.options[0].id);
    }
}

/**
 * Select an option within a category
 */
function selectOption(categoryId, optionId) {
    const category = AppState.categories.find(c => c.id === categoryId);
    if (!category) return;

    const option = category.options.find(o => o.id === optionId);
    if (!option) return;

    AppState.currentCategory = categoryId;
    AppState.currentOption = optionId;

    // Update UI
    updateOptionUI(optionId);
    updateBreadcrumb(category.name, option.name);

    // Load mockup
    loadMockup(option.file);
}

/**
 * Update category button active state
 */
function updateCategoryUI(categoryId) {
    const buttons = elements.categoryNav.querySelectorAll('.category-button');
    buttons.forEach(btn => {
        if (btn.dataset.categoryId === categoryId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Update option tab active state
 */
function updateOptionUI(optionId) {
    const tabs = elements.optionTabs.querySelectorAll('.option-tab');
    tabs.forEach(tab => {
        if (tab.dataset.optionId === optionId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb(categoryName, optionName) {
    elements.currentCategory.textContent = categoryName;
    elements.currentOption.textContent = optionName;
}

/**
 * Load mockup into iframe
 */
function loadMockup(filename) {
    // Show loading state
    elements.loadingState.classList.add('visible');
    elements.emptyState.style.display = 'none';
    elements.iframeWrapper.classList.remove('visible');

    // Load mockup
    const mockupPath = `./mockups/${filename}`;
    elements.mockupFrame.src = mockupPath;

    // Handle load event
    elements.mockupFrame.onload = () => {
        setTimeout(() => {
            elements.loadingState.classList.remove('visible');
            elements.iframeWrapper.classList.add('visible');

            // Trigger annotation reload for new mockup
            if (window.AnnotationSystem && window.AnnotationSystem.isActive()) {
                window.AnnotationSystem.loadAnnotations();
            }
        }, 300);
    };

    // Handle error
    elements.mockupFrame.onerror = () => {
        elements.loadingState.classList.remove('visible');
        alert('Failed to load mockup. Please try again.');
    };
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Fullscreen toggle
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // F key - Fullscreen
    if (e.key === 'f' || e.key === 'F') {
        if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleFullscreen();
        }
    }

    // A key - Toggle annotations
    if (e.key === 'a' || e.key === 'A') {
        if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            if (window.AnnotationSystem) {
                window.AnnotationSystem.toggle();
            }
        }
    }

    // Arrow keys - Navigate options
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            navigateOptions(e.key === 'ArrowRight' ? 1 : -1);
        }
    }
}

/**
 * Navigate to next/previous option
 */
function navigateOptions(direction) {
    if (!AppState.currentCategory || !AppState.currentOption) return;

    const category = AppState.categories.find(c => c.id === AppState.currentCategory);
    if (!category) return;

    const currentIndex = category.options.findIndex(o => o.id === AppState.currentOption);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < category.options.length) {
        selectOption(category.id, category.options[nextIndex].id);
    }
}

/**
 * Get current mockup info for annotations
 */
function getCurrentMockup() {
    if (!AppState.currentCategory || !AppState.currentOption) return null;

    const category = AppState.categories.find(c => c.id === AppState.currentCategory);
    if (!category) return null;

    const option = category.options.find(o => o.id === AppState.currentOption);
    if (!option) return null;

    return {
        categoryId: category.id,
        optionId: option.id,
        filename: option.file
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for use by other modules
window.AppBrowser = {
    getCurrentMockup,
    AppState
};
