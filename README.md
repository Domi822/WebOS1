# StarDance OS

StarDance OS is a small browser-based desktop project made with plain HTML, CSS, and JavaScript. It has a no-password welcome screen, a desktop, a top bar with a live clock, app icons, and multiple draggable windows.

![StarDance OS project banner](https://placehold.co/1200x520/101820/f8efdc/svg?text=StarDance%20OS%20-%20WebOS%20Desktop)

## Features

- No login or password, so anyone can test it right away.
- Dismissible welcome screen.
- Desktop top bar with a live clock.
- Openable, closable, draggable app windows.
- Multiple windows can stay open at the same time.
- Dock and desktop app icons for Notes, Gallery, Calculator, and System Info.
- Gallery app with real HTTPS image links so it works after Vercel deploy.
- Notes app saves text in `localStorage`.
- Calculator supports mouse input and keyboard input.
- Theme toggle for light and dark modes.
- Window snap hints when dragging near the screen edges.

## Apps

- **Notes:** Type notes and keep them after refreshing.
- **Gallery:** Browse three local SVG pictures with thumbnails and next/previous controls.
- **Calculator:** Do basic math with a styled calculator UI.
- **System Info:** Shows project status and how many windows are open.

## How To Run

Open `index.html` in a web browser. No install step, build step, or server is required.

## Project Files

- `index.html` contains the desktop layout and app windows.
- `style.css` contains the custom visual style and responsive layout.
- `script.js` controls the clock, windows, apps, theme, calculator, and gallery.
- `assets/` contains local fallback art, while the deployed page uses absolute HTTPS image/icon links.

## Testing Checklist

- Click **Start** and confirm there is no password screen.
- Open each app from the desktop icons and dock.
- Drag windows and confirm they come to the front.
- Close and reopen windows.
- Use the Gallery thumbnails and Previous/Next buttons.
- Try the Calculator with buttons and keyboard keys.
- Type in Notes, refresh, and confirm the text stays.
- Toggle the theme.
