# SprintWork Static Repo

This is a runnable local repository for the Hostinger Horizons static export in the attached `SprintWork` folder.

## Run locally

1. Install dependencies:
```powershell
npm install
```
2. Start the static server:
```powershell
npm start
```
3. Open `http://localhost:3000/` in your browser.

## Notes

- The site entry page is `index.html`.
- The exported pages are under the root folder and assets are served from the matching `_files` directories.
- Some pages rely on remote Hostinger assets, so an internet connection may be required for full rendering.
