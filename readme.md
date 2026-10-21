# Dummy UI

Dummy UI is a remote-first Samsung TV launcher concept with a glossy glass interface, animated home screen, streaming service shortcuts, first-run welcome, and version update notice. It is a **Tizen web application**, not a replacement for Samsung's firmware or Smart Hub.

## Preview

Open `index.html` in a modern browser. Use arrow keys to move focus, Enter to select, and Escape or Backspace to close a panel. The layout is designed for a 16:9 TV screen and adapts to smaller screens.

## Samsung TV development

1. Install Samsung TV / Tizen Studio and its TV extensions.
2. Create a Samsung certificate profile for the target TV and register the TV in Device Manager.
3. Confirm the exact model and Tizen version, then set the package's required version and test the app on the TV or emulator.
4. Build and sign the WGT package with the matching certificate.

The model number was not present in the project folder when this version was prepared. The package metadata uses a broad Tizen baseline; test compatibility on the target TV before installation. Samsung requires a valid signing certificate to install and run a TV web app. Consumer TVs do not support installing a WGT directly from USB; use the developer workflow or Samsung's approved distribution process.

## Streaming services

The launcher provides YouTube, Prime Video, Disney+, Netflix, and Samsung TV Plus shortcuts. It attempts to open a service website in the TV browser. Browser support, sign-in, service availability, DRM playback, and remote controls are determined by the TV and each provider. For reliable playback, use the provider's official Samsung TV app. This project does not implement provider authentication or video playback, remove ads, or promise ad-free YouTube.

## Version behavior

The welcome card appears on first launch and shows the current version. The app stores the last-seen version locally and displays **New UI Update** with a change summary when the version changes. Update `VERSION` in `script.js` and the displayed version in `config.xml` when preparing a release.

## Files

- `index.html` — launcher structure and app tiles
- `style.css` — glass UI, motion, responsive layout, and reduced-motion support
- `script.js` — remote/keyboard navigation, welcome/update behavior, app links, and clock
- `config.xml` — Tizen TV package configuration

## Checks

Run `node --check script.js` to validate the JavaScript syntax. A browser preview is useful for checking visual behavior; TV-device testing still requires the model, Tizen Studio, a matching certificate, and the physical TV or emulator.
