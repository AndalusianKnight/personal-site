# jessethe.com

Jesse Thé's personal site. Retro-futurist, plain HTML, CSS and JavaScript: no framework, no build step.

## Run it locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Add `?boot` to the homepage URL to see the boot intro again (it plays once per browser session).

## Layout

```
index.html              Home: boot intro overlay, headshot, programs list
about/ work/ education/ travel/ rescue/ hobbies/ contact/
                        One folder per page (placeholders until each page ships)
404.html                "Chevron seven will not lock" (uses root-absolute paths)
assets/css/site.css     All styles. Colour tokens on :root; each page sets its own --c neon
assets/js/sfx.js        WebAudio sound kit (synthesised, no audio files)
assets/js/site.js       Shared shell: cursor, status bar, achievements, page wipes, F1–F7, CV printer, Konami
assets/js/terminal.js   Drop-down terminal (~ on any page)
assets/js/boot.js       Welcome screen, BIOS, countdown, arrival (home only)
assets/img/             Headshot, flags, favicon
```

Pages use relative paths (`data-root` on `<html>` tells the scripts how deep they are), so the site works from any host or subfolder.

## Deploy

Any static host works with no configuration. Netlify, Vercel and GitHub Pages all serve `about/` from `about/index.html` and `404.html` for missing pages. The design sandbox (the style board) stays separate from this repo.
