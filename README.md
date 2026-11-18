# Chase Barclay — Portfolio Website

Personal site for Chase Barclay, controls engineer at FORTNA and Georgia Tech Computer Engineering grad (2026). It shows the work; the resume PDF has the full history.

Live at `https://chasebarclay1.github.io/`

## Layout

Hero (with resume download) → tagline → Work (Argos and the chess robot arms, with photo, video and poster) → Now (FORTNA) → Earlier work → About (with photo strip) → Contact.

## Files

- `files/Chase_Barclay_Resume.pdf` is the public one page resume (no phone number). Replace it to update the download.
- `files/Argos_Poster.pdf` is the senior design poster.
- `assets/` holds the web sized photos (location data stripped), the Argos expo photo, and the chess robot loop (`chess-loop.mp4`, 11 s at 2x speed, muted).

## Stack

Plain HTML, CSS and JavaScript. No frameworks, no build step.

- Font: Geist (Google Fonts), one typeface throughout
- Icons: Phosphor, inlined as SVG
- `404.html` is served by GitHub Pages for missing URLs

## Design system

**Color, 60-30-10**

| Share | Color | Hex | Used for |
| --- | --- | --- | --- |
| 60% | Paper | `#F2F5F8` | Page background |
| 30% | Steel + Ink | `#DCE4EC` / `#172235` | Cards, Skills band, footer; all type |
| 10% | Signal orange | `#F06A1D` | Scroll rail, section nodes, buttons, focus rings |

**Type.** Every size sits on the Tailwind scale and uses a named style (`heading-1` to `heading-6`, `title-1` to `title-4`, `body-3`, `body-6`, `button-md`, `button-sm`, `caption-2`, `caption-3`). Headings use `text-wrap: balance`, body copy uses `text-wrap: pretty`.

**Spacing.** Only 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80 and 96 px (`--s-*` tokens in `style.css`).

**Motion.** One curve, `cubic-bezier(0.22, 1, 0.36, 1)`. Only `transform` and `opacity` animate.

- Hero elements rise in on load
- A tagline lights up word by word as it scrolls past
- The chess robot video plays only while on screen, with a pause button (paused by default with reduce motion on)
- The photo strip scrolls sideways, with previous and next buttons on desktop
- Sections rise and fade in once as they enter the viewport
- The rail on the left fills with orange as you scroll, and each section's node lights up when reached
- The mobile menu opens as a full height panel with links stepping in
- With "reduce motion" turned on, movement is replaced by plain fades

## Hosting on GitHub Pages

1. Push to the `main` branch of `chasebarclay1.github.io`
2. Settings → Pages → source: `main`, root `/`
3. Changes go live within a minute or two
