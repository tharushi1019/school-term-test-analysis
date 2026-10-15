# School Term-Test Marks Analysis PWA

A free, installable Progressive Web App for Sinhala school term-test marks analysis.

## Features
- Sinhala results report with navy/red/green styling, grouped bar chart, legend, results table, totals and overall pass percentage.
- Grades 06–11.
- Local browser storage (no account or server database).
- JSON backup export/import and CSV export.
- Print to A4 landscape or save as PDF.
- Download chart as PNG.
- Service worker caches app files for offline use after the first successful visit.

## Deploy free with GitHub Pages
1. Create a **public** GitHub repository, e.g. `school-term-test-analysis`.
2. Upload all files in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/(root)`, then Save.
5. Wait for the published URL, usually `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
6. Open the URL in Chrome on the phone/computer. Use the browser's **Install app** / **Add to Home Screen** option. HTTPS is required for service-worker/offline support.

## Important data note
Data is stored per browser and device. It is not shared or synchronised between teachers. Export JSON backups regularly and keep them in a safe school-approved location. Do not include sensitive personal information in exported files unless the school has approved the storage method.

## Local preview
Because service workers require HTTPS or localhost, run a local server instead of opening `index.html` as a file:
- Python: `python -m http.server 8000`
- Open `http://localhost:8000`

## Calculation rule
Pass percentage = students scoring 40 or above ÷ students present for the exam × 100.
Students present = total students − absent students.
The app validates that total = below 40 + 40 or above + absent for every grade.
