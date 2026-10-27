# jessethe.com

Jesse Thé's personal site. Retro-futurist, plain HTML, CSS and JavaScript: no framework, no build step.

## Run it locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Add `?boot` to the homepage URL to see the full boot intro again. It plays once per browser session; returning visitors get a short boot instead.

The contact form needs the `api/contact` function, so locally it falls back to opening an email draft. Everything else works from the static server.

## Layout

```
index.html              Home: boot intro overlay, headshot, programs list
about/                  Story, system specs, slide projector
work/                   Career, the disk box, side projects
work/<product>/         Project Rebu, Zebu, Tauria Connect, Lockbox, Cal and Calls (each with its own tabs and demo)
education/              Schools, awards, clubs, the course list and the paper reader
travel/                 Dot-matrix globe with a postcard per home, party, departures board
rescue/                 Pidan and Doufu, the playground (DOUFU.EXE, CHASE.EXE, TREATS.EXE), rescue work
hobbies/                The shelf (with a Stargate to dial), D&D table and Ajax's sheet, dive gauge, boulder, retro consoles
contact/                Contact form, other ways to reach Jesse, Shanghai clock
adventure/              The Encrypted CV, a text adventure (open it from the terminal: adventure)
404.html                "Chevron seven will not lock" (uses root-absolute paths)
api/contact.js          Vercel function that emails contact-form messages to Jesse (see below)
assets/css/site.css     All styles. Colour tokens on :root; each page sets its own --c neon
assets/js/sfx.js        WebAudio sound kit (synthesised, no audio files)
assets/js/site.js       Shared shell: cursor, status bar, achievements, page wipes, F1–F7, CV printer,
                        Konami, director's commentary notes, message sending
assets/js/pixel.js      Pixel Pidan and Doufu, canvas helpers, the screensaver, Doufu on the loose
assets/js/terminal.js   Drop-down terminal (~ on any page)
assets/js/boot.js       Welcome screen, BIOS, countdown, short boot for returning visitors (home only)
assets/js/<page>.js     One script per page for its widgets
assets/img/             Headshot, dog photos, flags, favicon
```

Pages use relative paths (`data-root` on `<html>` tells the scripts how deep they are), so the site works from any host or subfolder.

Everything a visitor does (achievements, the adventure save, sound and commentary switches) is kept in their own browser's localStorage. Nothing is tracked or sent anywhere, except a message they choose to send.

## Contact form

`api/contact.js` sends form and terminal messages through [Resend](https://resend.com). Until it's set up, the form still works: it opens the visitor's email app with the message ready to send.

To turn on direct delivery, add these in Vercel (Project → Settings → Environment Variables), then redeploy:

| Variable | Needed | What it does |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Your Resend API key |
| `CONTACT_TO` | No | Where messages go. Defaults to jessethe@alumni.harvard.edu |
| `CONTACT_FROM` | No | The sender, on a domain verified in Resend. Defaults to Resend's test sender, which can only deliver to the address on your Resend account |

## Deploy

Vercel serves the site with no configuration: `about/` from `about/index.html`, `404.html` for missing pages, and `api/` as serverless functions. Other static hosts work too, without the contact function. The design sandbox (the style board) stays separate from this repo.
