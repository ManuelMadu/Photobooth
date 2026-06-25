# Photobooth

A web photobooth you run in the browser. Pick a look, let it use your camera, count down, and it snaps a photo framed in the style you chose. Built for a screen at an event, but it works just as well on a laptop.

**[Try it live](https://photobooth-git-main-manuelmadu.vercel.app)** — give it camera permission and pick a vibe.

I wanted the thing to feel like a real booth, not a webcam with a filter slapped on top. So the look you pick changes everything: the colors, the type, the flash, and the frame that gets baked into the saved image. The photo you download already looks finished.

## The three looks

You choose one on the way in. Each one is its own little world.

- **Vintage** — a warm analog photo strip. Sepia ink, curtain red, a typewriter caption. The classic mall-booth print.
- **Polaroid** — a white instant-film border with a handwritten caption and that just-developed look. Give it a shake.
- **Purikura** — candy pastels, bubbly type, hearts and sparkles. Tokyo arcade energy.

You can switch between them whenever you want and shoot again.

## How a session goes

1. Land on the picker and choose a vibe.
2. The booth asks for camera permission. If you say no, or there's no camera, it tells you what went wrong instead of showing a dead grey box.
3. A countdown runs. You can cancel it if you flinch.
4. It captures the frame, flashes in the vibe's color, and drops you into review.
5. Edit the caption (Polaroid and Vintage), then save. The frame is rendered into the file, so what you download is the finished print.

## How it's built

Next.js 15 with the App Router, React 18, and TypeScript. Tailwind v4 for styling, [Motion](https://motion.dev) for the animation, and Phosphor for icons. No backend and no database. Photos are captured and composited on the client with a canvas and never leave the browser.

The interesting part is how the vibes work. Each vibe is a set of design tokens (color, type, frame shape) defined once in `lib/vibes.ts` and bound at runtime through a `data-vibe` attribute in `globals.css`. A small context provider holds the current choice and remembers it in `localStorage`. Adding a new look is three edits in one place: a new id, a `VIBES` entry, and a token block. Nothing else in the booth has to know it exists.

```
app/
  page.tsx              # the vibe picker (landing)
  booth/page.tsx        # the booth screen
  globals.css           # per-vibe design tokens via [data-vibe]
components/
  vibe-provider.tsx     # current vibe + localStorage persistence
  booth/
    camera-booth.tsx    # main capture flow
    countdown.tsx       # cancelable countdown
    permission-state.tsx# camera permission / error UI
    review.tsx          # review, caption, save
hooks/
  use-camera.ts         # getUserMedia with real error handling
lib/
  vibes.ts              # the source of truth for every look
  capture.ts            # grab a frame and export it
  frames.ts             # draw the vibe-matched frame onto the photo
```

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

One catch: browsers only hand over the camera on a secure origin. `localhost` counts, so plain `npm run dev` is fine on your own machine. If you want to open the booth from another device on your network (a phone, a tablet at an actual event), that device needs HTTPS. Drop a local cert and key in a `certificates/` folder and serve over `https://`. The folder is gitignored, so nothing private gets committed.

## Accessibility

The booth respects `prefers-reduced-motion` and drops the entrance animations when it's set. Controls are keyboard reachable with visible focus rings, and the camera errors are spelled out in text rather than left for you to guess.

## Status

Working: the picker, all three looks, the camera flow, the countdown, capture, caption editing, and saving with the frame baked in. It's a front-end project deployed on Vercel, and every push to `main` redeploys it.
