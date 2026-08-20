# Mind Substances — GitHub Pages rebuild

This branch contains the clean static rebuild of Mind Substances for GitHub Pages.

## Product scope

Included: Home, Essays, Notes, Quotes, Books, About, Contact.

Removed completely: contests, voting, contest submissions, contest administration, and all contest navigation.

## Technical approach

- Static HTML, CSS and JavaScript
- No framework runtime
- No database dependency
- No server-side rendering
- `.nojekyll` included for direct static serving
- GitHub Pages deployment workflow in `.github/workflows/pages.yml`
- Existing Cloudinary assets are referenced directly for current editorial imagery

## Publishing

The workflow deploys on pushes to `github-pages-rebuild`. In repository Settings → Pages, set the build source to **GitHub Actions** if it is not already enabled.

## Static-site limitation

Newsletter signup and contact are intentionally implemented as email links in this first release because GitHub Pages does not provide a server runtime. A third-party form/newsletter service can be connected later without changing the core site architecture.
