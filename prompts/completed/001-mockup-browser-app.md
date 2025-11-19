<objective>
Build a professional, password-protected mockup browser application for showcasing AAS dashboard design options to coworkers. The app will be deployed on GitHub Pages and needs client-side password protection (understanding it's not cryptographically secure, but provides a basic access barrier). The browser should feature categorized navigation, interactive annotations, and a polished UI.

This tool will help the team review and discuss the 21 dashboard mockups across 7 categories, with each category having 3 design options. The professional presentation will facilitate decision-making on which design approaches to pursue.
</objective>

<context>
Project: AAS Dashboard POC with 21 HTML mockups organized in 7 categories:
- Executive Overview (3 options)
- Financial Deep Dive (3 options)
- Growth Pipeline (3 options)
- Operations (3 options)
- Revenue Cycle (3 options)
- Provider Management (3 options)
- Client Satisfaction (3 options)

Tech stack: Pure HTML/CSS/JavaScript (no build process needed for GitHub Pages)
Deployment target: GitHub Pages (static hosting)
Current state: Mockups exist in ./mockups/ folder
Git status: Not yet initialized as a repository
</context>

<requirements>
**Core Functionality:**
1. Client-side password protection on landing page (LocalStorage-based session)
2. Categorized navigation menu to browse mockups by category
3. Interactive annotation system for explaining mockup features
4. Responsive design that works on desktop and tablet
5. Professional UI with smooth transitions and polished styling

**Password Protection:**
- Simple password gate on index.html (user enters password to access)
- Store session in LocalStorage (remains logged in until they clear storage)
- Password should be configurable in code (not hardcoded in multiple places)
- Clear visual indication of "protected" content

**Navigation & Browsing:**
- Category-based menu (7 categories)
- Within each category, show all 3 options
- Easy switching between options within a category
- Clear labeling of which option is currently being viewed
- Breadcrumb or indicator showing current location

**Interactive Annotations:**
- Ability to toggle annotations on/off for each mockup
- Clickable hotspots or markers that explain specific features
- Annotation content should be easily editable (JSON or inline data structure)
- Professional tooltip/popover styling for annotation display
- At minimum, include 2-3 sample annotations per mockup category to demonstrate the system

**Professional Polish:**
- Clean, modern design system (consistent colors, typography, spacing)
- Smooth transitions and animations (not distracting, but polished)
- Loading states for iframe content
- Responsive layout (works on screens 1024px and wider)
- Accessible keyboard navigation
- Professional error states if mockup fails to load

**Git & Deployment:**
- Initialize Git repository
- Create .gitignore for node_modules, OS files
- Initial commit with all code
- Include README.md with setup and deployment instructions for GitHub Pages
</requirements>

<implementation>
**Application Structure:**
Create a clean, organized file structure:
```
./index.html           (password gate)
./browser.html         (main mockup browser app)
./assets/
  ./css/
    ./styles.css       (main styles)
  ./js/
    ./auth.js          (password handling)
    ./browser.js       (browser functionality)
    ./annotations.js   (annotation system)
  ./data/
    ./annotations.json (annotation content)
./mockups/             (existing - contains 21 HTML files)
./README.md
./.gitignore
```

**Why this structure:**
- Separate password gate from main app for clean separation of concerns
- Assets folder keeps code organized and maintainable
- JSON for annotations makes content easy to update without touching code
- README ensures anyone can deploy this to GitHub Pages easily

**Password Protection Approach:**
Use a simple client-side check with LocalStorage persistence. While not secure against determined users, it provides the "looks protected" requirement and is trivial to deploy on GitHub Pages (no server-side logic needed).

**Mockup Display:**
Use iframes to display the existing HTML mockups. This preserves their current functionality (Chart.js, etc.) without modification and provides isolation.

**Annotation System Design:**
Use a data-driven approach where annotations are defined in JSON with coordinates and content. The JS reads this and renders interactive markers overlaid on the iframe container. This makes it easy for non-developers to add/edit annotations later.

**What to Avoid:**
- Don't use any build tools or frameworks - keep it pure HTML/CSS/JS for simplest GitHub Pages deployment
- Don't modify existing mockup files - treat them as read-only
- Don't implement real authentication - the client-side password is explicitly meant to be simple
- Don't over-engineer - this is for internal team use, not public production
- Don't use heavy animation libraries - keep dependencies minimal
</implementation>

<mockup_organization>
The 21 mockups are organized as follows (parse filenames to extract structure):

**Categories and Options:**
1. Executive Overview: option1-grid, option2-dashboard, option3-executive
2. Financial Deep Dive: option1-charts-left, option2-full-width, option3-tabbed
3. Growth Pipeline: option1-funnel, option2-timeline, option3-crm
4. Operations: option1-map, option2-status, option3-calendar
5. Revenue Cycle: option1-process, option2-metrics, option3-comparison
6. Provider Management: option1-cards, option2-analytics, option3-recruitment
7. Client Satisfaction: option1-scorecard, option2-risk, option3-timeline

Build the navigation and structure dynamically by scanning the mockups folder or defining this structure in your JS code.
</mockup_organization>

<design_guidelines>
**Visual Design:**
- Use a professional color scheme (suggest: dark sidebar navigation, light content area)
- Typography: Clean sans-serif, clear hierarchy
- Spacing: Generous whitespace, not cramped
- Interactive states: Hover effects, active states, focus indicators

**User Experience:**
- First-time users should immediately understand how to navigate
- Current location should always be clear (active category, active option)
- Annotations should be discoverable (toggle button, maybe a quick intro tooltip)
- Keyboard shortcuts for power users (optional, but nice touch)

**Performance:**
- Lazy-load iframe content (don't load all 21 mockups at once)
- Preload styles and critical JS
- Smooth 60fps transitions
</design_guidelines>

<output>
Create the following files:

**Core Application:**
- `./index.html` - Password gate landing page with professional styling
- `./browser.html` - Main mockup browser application
- `./assets/css/styles.css` - Complete styles for both pages
- `./assets/js/auth.js` - Password authentication logic
- `./assets/js/browser.js` - Main browser functionality (navigation, mockup loading)
- `./assets/js/annotations.js` - Annotation system (markers, tooltips, toggle)
- `./assets/data/annotations.json` - Sample annotation content (2-3 per category)

**Documentation & Setup:**
- `./README.md` - Setup instructions, deployment guide, password configuration, how to add annotations
- `./.gitignore` - node_modules, .DS_Store, other OS files

**Git Operations:**
After creating all files:
1. Initialize git repository: `git init`
2. Add all files: `git add .`
3. Create initial commit with descriptive message
4. Include in README how to:
   - Deploy to GitHub Pages
   - Change the password
   - Add new annotations
   - Add new mockups
</output>

<verification>
Before declaring complete, verify:

1. **Password Protection Works:**
   - Can access index.html without password
   - Cannot access browser.html directly (redirects to index if no session)
   - After entering password, can access browser.html
   - Session persists on page refresh

2. **Navigation Works:**
   - All 7 categories are visible in navigation
   - Can select each category and see its 3 options
   - Current selection is visually indicated
   - Mockups load correctly in viewing area

3. **Annotations Work:**
   - Can toggle annotations on/off
   - Sample annotations appear with interactive markers
   - Clicking markers shows annotation content
   - Annotations are positioned correctly

4. **Professional Polish:**
   - Design is cohesive and professional
   - Transitions are smooth
   - Responsive layout works
   - No console errors

5. **Git Setup:**
   - Repository initialized
   - All files committed
   - README is complete and accurate
   - .gitignore is present

6. **Documentation:**
   - README explains deployment clearly
   - Instructions for changing password are provided
   - How to add annotations is documented
</verification>

<success_criteria>
- Functional password-protected browser accessible via index.html
- All 21 mockups browsable through categorized navigation
- Working annotation system with sample annotations demonstrating the feature
- Professional, polished UI that looks production-ready
- Git repository initialized with clean initial commit
- Complete README with deployment and customization instructions
- Zero external dependencies (pure HTML/CSS/JS)
- Works in modern browsers (Chrome, Firefox, Safari, Edge)
</success_criteria>

<special_instructions>
**For Maximum Efficiency:**
When implementing this, use parallel tool calls whenever possible. For example, when creating multiple independent files (like separate JS modules or CSS files), create them simultaneously rather than sequentially.

**Go Beyond the Basics:**
While the core requirements are clear, feel free to add thoughtful touches that enhance the professional feel:
- Smooth loading animations
- Keyboard shortcuts
- Quick search/filter
- Favorites/bookmarking
- Fullscreen mode
- Print-friendly version
- Dark mode toggle

Only add features that genuinely improve the experience without bloating the codebase. Quality over quantity.

**Reflection:**
After implementing the core functionality, take a moment to review your work. Ask yourself:
- Is the password mechanism clear to users?
- Would a coworker immediately understand how to navigate?
- Are the annotations discoverable and useful?
- Does the design feel cohesive and professional?
- Is the README clear enough for someone else to deploy this?

If any answer is "not quite," refine before declaring complete.
</special_instructions>