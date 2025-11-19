# AAS Dashboard Mockup Browser - Deployment Guide

## Quick Deployment Checklist

### Pre-Deployment
- [ ] Test locally by opening `index.html` in a browser
- [ ] Verify password works (default: `aas2024`)
- [ ] Check all 7 categories load correctly
- [ ] Test annotations toggle functionality
- [ ] Verify all 21 mockups display properly

### GitHub Pages Deployment

#### Step 1: Create GitHub Repository
```bash
# If you haven't already, create a new repository on GitHub.com
# Then connect your local repository:

git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

#### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub.com
2. Click **Settings** → **Pages**
3. Under "Source", select `main` branch
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

#### Step 3: Share with Team
- Share the URL with your team members
- Provide them with the password: `aas2024`
- Users will remain logged in for 24 hours (configurable)

### Custom Domain (Optional)

If you want to use a custom domain like `mockups.yourcompany.com`:

1. Add a `CNAME` file to the repository root with your domain:
   ```
   mockups.yourcompany.com
   ```

2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to: `YOUR-USERNAME.github.io`

3. In GitHub Pages settings, add your custom domain

### Testing the Deployment

After deployment, verify:

1. **Login Page Works**
   - Visit the URL
   - You should see a professional login page
   - Enter password: `aas2024`

2. **Navigation Works**
   - All 7 categories appear in sidebar
   - Clicking a category shows 3 options
   - Mockups load in iframe

3. **Annotations Work**
   - Click "Annotations" button (should turn blue)
   - Numbered markers appear on mockups
   - Clicking markers shows tooltips

4. **Keyboard Shortcuts Work**
   - Press `F` for fullscreen
   - Press `A` to toggle annotations
   - Use arrow keys to navigate options

## Troubleshooting

### Issue: Mockups Don't Load

**Problem**: Blank iframe or 404 errors

**Solution**:
- Check that all mockup files are in the `/mockups/` folder
- Verify file paths in `assets/js/browser.js` match actual filenames
- Ensure GitHub Pages is serving from the correct branch

### Issue: Annotations Don't Appear

**Problem**: No markers visible when annotations are toggled on

**Solution**:
- Open browser DevTools console (F12)
- Check for errors loading `annotations.json`
- Verify JSON file is valid: `python3 -m json.tool assets/data/annotations.json`
- Ensure GitHub Pages is serving JSON files correctly

### Issue: Password Doesn't Work

**Problem**: Correct password is rejected

**Solution**:
- Clear browser cache and LocalStorage
- Try in an incognito/private window
- Verify `assets/js/auth.js` is loaded (check Network tab in DevTools)

### Issue: Styles Look Broken

**Problem**: Unstyled or incorrectly styled page

**Solution**:
- Check that `assets/css/styles.css` exists
- Verify the CSS file path is correct in HTML
- Clear browser cache
- Check browser console for 404 errors on CSS file

## Security Considerations

**Important**: This is a client-side password protection system. It provides basic access control but is NOT cryptographically secure.

### What This Protects Against
- Casual visitors stumbling upon the URL
- Search engine indexing
- Basic "shareability" control

### What This Does NOT Protect Against
- Determined users who inspect the JavaScript
- Anyone with DevTools knowledge
- Serious security threats

### For Production Use
If you need real security:
- Implement server-side authentication
- Use a proper identity provider (Auth0, AWS Cognito, etc.)
- Add HTTPS (GitHub Pages provides this automatically)
- Consider using a private repository with access controls

## Customization After Deployment

### Change the Password
1. Edit `assets/js/auth.js`
2. Update the `PASSWORD` value
3. Commit and push:
   ```bash
   git add assets/js/auth.js
   git commit -m "Update access password"
   git push
   ```
4. Wait 1-2 minutes for GitHub Pages to rebuild

### Add New Mockups
1. Add HTML file to `/mockups/` folder
2. Update `assets/js/browser.js` to include new mockup
3. (Optional) Add annotations in `assets/data/annotations.json`
4. Commit and push changes

### Update Annotations
1. Edit `assets/data/annotations.json`
2. Add/modify marker objects
3. Commit and push:
   ```bash
   git add assets/data/annotations.json
   git commit -m "Update annotations"
   git push
   ```

## Monitoring and Analytics

### GitHub Pages Traffic
- Go to repository **Insights** → **Traffic**
- See page views and visitor counts
- Limited to past 14 days

### Google Analytics (Optional)
To add Google Analytics:

1. Create a GA4 property
2. Add tracking code to `index.html` and `browser.html` before `</head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```
3. Commit and push

## Performance Optimization

The application is already optimized for GitHub Pages, but for very large deployments:

### Lazy Loading
- Mockups load on-demand (already implemented)
- Only active mockup is loaded in iframe

### Caching
- GitHub Pages automatically caches static assets
- Users get fast load times on repeat visits

### Image Optimization
- If mockups contain large images, consider compressing them
- Use tools like ImageOptim or TinyPNG

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Monthly: Test all mockups still load correctly
- [ ] Quarterly: Update annotations based on team feedback
- [ ] As needed: Add new mockups when designs are created
- [ ] As needed: Update password if it's been shared too widely

### Getting Help
- Check browser console for errors (F12 → Console)
- Review this guide and main README.md
- Test in different browsers to isolate issues
- Use GitHub Issues to track problems and requests

## Backup and Recovery

### Backup Strategy
GitHub already backs up your repository, but for local backup:

```bash
# Clone to another location
cd ~/backups
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Or create a tarball
cd /Users/hbalanon/dev/nsc-aas-dashboard-poc
tar -czf ../aas-mockup-browser-backup-$(date +%Y%m%d).tar.gz .
```

### Recovery
If you need to restore:

```bash
# From GitHub (easiest)
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# From local backup
tar -xzf aas-mockup-browser-backup-YYYYMMDD.tar.gz
```

## Success Metrics

Track these to measure success:

- **Usage**: Number of team members accessing the browser
- **Engagement**: Time spent viewing mockups
- **Feedback**: Comments and annotations requested
- **Decisions**: Which mockups were selected for development

## Next Steps

After successful deployment:

1. **Share with team**: Send URL and password to stakeholders
2. **Gather feedback**: Ask team to review mockups and provide input
3. **Iterate**: Update mockups based on feedback
4. **Document decisions**: Keep track of which designs were chosen
5. **Archive**: Once decisions are made, consider archiving the browser

---

**Deployment Date**: November 2024
**Maintainer**: Development Team
**Support**: [Your contact information]
