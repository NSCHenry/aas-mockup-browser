# AAS Dashboard Mockup Browser

A professional, password-protected web application for showcasing and reviewing AAS dashboard design mockups. This browser enables team members to explore 21 different dashboard designs across 7 categories, with interactive annotations explaining key features.

## Features

- **Password Protection**: Client-side authentication with LocalStorage session management
- **Categorized Navigation**: 7 dashboard categories with 3 design options each
- **Interactive Annotations**: Clickable markers that explain mockup features and design decisions
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Keyboard Shortcuts**: Power-user features for efficient navigation
- **Professional UI**: Polished design with smooth transitions and animations

## Quick Start

### Local Development

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Enter the password (default: `aas2024`)
4. Browse mockups by selecting categories and options

No build process or dependencies required - it's pure HTML, CSS, and JavaScript!

### Live Demo

Simply open the `index.html` file directly in your browser, or serve it with any static file server.

## Deployment to GitHub Pages

### Option 1: GitHub Web Interface

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to repository **Settings** → **Pages**
4. Under "Source", select the `main` branch
5. Click **Save**
6. Your site will be live at `https://[username].github.io/[repository-name]/`

### Option 2: Command Line

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AAS Dashboard Mockup Browser"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/[username]/[repository-name].git

# Push to GitHub
git push -u origin main

# Enable GitHub Pages via repository settings (see Option 1, steps 3-5)
```

Once deployed, share the URL with your team. Users will need the password to access the mockups.

## Configuration

### Changing the Password

Edit `/assets/js/auth.js` and update the `PASSWORD` value:

```javascript
const AUTH_CONFIG = {
    PASSWORD: 'your-new-password',  // Change this
    SESSION_KEY: 'aas_mockup_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000
};
```

### Adjusting Session Duration

By default, users stay logged in for 24 hours. To change this, edit the `SESSION_DURATION` value in `/assets/js/auth.js`:

```javascript
const AUTH_CONFIG = {
    PASSWORD: 'aas2024',
    SESSION_KEY: 'aas_mockup_session',
    SESSION_DURATION: 8 * 60 * 60 * 1000  // 8 hours in milliseconds
};
```

## Adding or Editing Annotations

Annotations are defined in `/assets/data/annotations.json`. Each annotation consists of:

- **categoryId**: Matches the category identifier
- **optionId**: Matches the specific option within the category
- **markers**: Array of annotation points

### Example Annotation Structure

```json
{
  "categoryId": "executive-overview",
  "optionId": "option1-grid",
  "markers": [
    {
      "x": "15%",
      "y": "20%",
      "title": "Feature Name",
      "description": "Detailed explanation of this feature..."
    }
  ]
}
```

### Position Guidelines

- **x** and **y** are CSS position values (percentage or pixels)
- Percentages are relative to the iframe container
- Start with approximate positions and adjust visually
- Test on different screen sizes to ensure markers appear correctly

### Adding New Annotations

1. Open `/assets/data/annotations.json`
2. Find the relevant category and option (or add a new entry)
3. Add a new marker object to the `markers` array
4. Position values (x, y) can be adjusted by trial and error
5. Save the file and refresh the browser to see changes

## Adding New Mockups

To add additional mockups to the browser:

1. **Add the HTML file** to the `/mockups/` folder
2. **Update the category structure** in `/assets/js/browser.js`:

```javascript
// Find the relevant category in AppState.categories
{
    id: 'your-category-id',
    name: 'Category Display Name',
    options: [
        // Add your new option
        {
            id: 'option4-newdesign',
            name: 'New Design',
            file: 'your-new-mockup.html'
        }
    ]
}
```

3. **(Optional) Add annotations** for the new mockup in `/assets/data/annotations.json`

## Project Structure

```
.
├── index.html                  # Password gate / login page
├── browser.html                # Main mockup browser application
├── assets/
│   ├── css/
│   │   └── styles.css         # All application styles
│   ├── js/
│   │   ├── auth.js            # Authentication logic
│   │   ├── browser.js         # Navigation and mockup loading
│   │   └── annotations.js     # Annotation system
│   └── data/
│       └── annotations.json   # Annotation content
├── mockups/                    # 21 dashboard mockup HTML files
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Keyboard Shortcuts

- **F**: Toggle fullscreen mode
- **A**: Toggle annotations on/off
- **Left Arrow**: Previous option in current category
- **Right Arrow**: Next option in current category

## Browser Compatibility

Tested and supported on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Notice

**Important**: The password protection is client-side only and is not cryptographically secure. This is intended as a basic access barrier for internal team use, not as a security measure against determined users. Do not use this to protect truly sensitive information.

For a production application with real security requirements, implement server-side authentication.

## Troubleshooting

### Mockups not loading

- Ensure all mockup files are in the `/mockups/` folder
- Check that filenames in `browser.js` match actual file names exactly
- Open browser console (F12) to check for error messages

### Annotations not appearing

- Verify `annotations.json` is valid JSON (use a JSON validator)
- Check that categoryId and optionId match your browser configuration
- Ensure the annotation toggle is turned ON (button should be blue)

### Password not working

- Check that you're using the correct password from `auth.js`
- Clear browser LocalStorage: Open DevTools → Application → Local Storage → Clear
- Try in an incognito/private window to rule out caching issues

### Session expires too quickly

- Adjust `SESSION_DURATION` in `/assets/js/auth.js`
- Clear LocalStorage and log in again to reset session timer

## Customization Ideas

Want to extend the browser? Here are some ideas:

- **Dark Mode**: Add a theme toggle using CSS variables
- **Favorites**: Let users bookmark their preferred designs
- **Comments**: Add a simple comment system using LocalStorage
- **Export**: Generate PDF reports of selected mockups
- **Comparison View**: Show two mockups side-by-side
- **Search**: Filter mockups by keyword or feature

## License

Internal use only - For AAS team review and discussion.

## Support

For questions or issues with the mockup browser, contact the development team or create an issue in the repository.

---

**Last Updated**: November 2024
