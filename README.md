# FADI CARS — mobile-first multi-page website

## Pages

- `index.html` — mobile-first homepage
- `cars.html` — complete catalogue with mobile filter drawer
- `car.html` — internal vehicle page and full gallery
- `leasing.html` — financing information
- `services.html` — service categories, ready for real packages
- `about.html` — dealership page
- `contact.html` — phone, address and map

`catalogue.html` redirects to the new `cars.html` page for compatibility.

## Mobile-first features

- fixed bottom navigation
- central call button
- sticky mobile search/filter bar
- filter drawer designed for thumbs
- full-width cards on small phones
- horizontally swipeable latest-cars section
- sticky price/call action on vehicle pages
- safe-area support for modern phones
- installable web-app manifest

## Live inventory and galleries

The Vercel functions remain in `api/`:

- `/api/catalogue`
- `/api/listing`
- `/api/image`

Use:

```bash
npm install
npm install -g vercel
vercel dev
```

Opening HTML files directly shows the fallback catalogue, but full live galleries require Vercel.

## Next Codex task

Read `CODEX_START_HERE.md`.
