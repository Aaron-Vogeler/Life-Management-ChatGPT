# Flowframe Workspace

Flowframe is a minimalist project management canvas inspired by tools like Notion and Superlist. It runs entirely in the browser using vanilla HTML, CSS, and JavaScript, making it easy to customize and extend.

## Features
- Modular workspace with Projects, Clients, Tasks, Notes, and Journals
- Bi-directional relationships across items for cross-linking context
- Drag-and-drop reordering of modules and entries
- Theme customization including palette, density, focus mode, and layout snapshots

## Run Locally
1. Install a lightweight static web server (Python, Node.js, or Bun all work).
2. From the repository root, start the server:
   - **Python 3:** `python3 -m http.server 5500`
   - **Node.js:** `npx serve .`
   - **Bun:** `bunx serve`
3. Open your browser to the reported URL (e.g., `http://localhost:5500`).
4. Press `Ctrl+C` in the terminal to stop the server when you are done.

## Run from GitHub Pages
1. Commit and push the repository to GitHub.
2. In your GitHub repository, open **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, then select the branch you want to publish (e.g., `main`) and the **root** folder. Save the configuration.
4. GitHub Pages will build and serve the site at `https://<your-username>.github.io/<repository-name>/`.
5. Because the site is static and `index.html` references assets with relative paths, no additional build step is required. Optionally add an empty `.nojekyll` file if you use filenames that begin with an underscore.

## Verifying No Merge Conflicts
If GitHub reports merge conflicts, resolve them locally before pushing:
1. Fetch the latest changes and merge the target branch:
   ```bash
   git fetch origin
   git checkout your-working-branch
   git merge origin/main
   ```
2. Open each conflicted file and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. After fixing conflicts, run `node --check app.js` to confirm the script parses correctly, then commit and push.

## License
MIT
