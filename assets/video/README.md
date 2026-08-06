# App demo videos

Drop your screen-recording clips here to fill the iPhone mockups on the site.
Until a file exists, the matching poster image in `assets/img/posters/` shows in
its place — so the site looks finished either way.

## Files the site looks for

| File | Fills the iPhone in… | Suggested clip |
|---|---|---|
| `quiz.mp4`  | Hero            | A screen recording of the quiz funnel (the hero previews the quiz) |
| `home.mp4`  | (unused now)    | Home tab — tasks, ELO, the lock button (kept for reuse) |
| `photo.mp4` | Verified tasks  | Capturing a task photo → "Verified" |
| `lock.mp4`  | Lock Mode       | Opening a blocked app → the block screen |
| `coach.mp4` | The exit gate   | The Emergency Coach chat + verdict |
| `games.mp4` | Earn time back  | Playing/winning a Mind game |
| `crate.mp4` | Daily rewards   | Earning and opening a daily crate |
| `ugc-1.mp4` … `ugc-8.mp4` | Creators section | Vertical creator clips (tap to play). Optional posters: `assets/img/ugc/ugc-1.jpg`… |

## How to record & export

1. On iPhone: **Settings → Control Center → add Screen Recording**, then record
   the app. Or use QuickTime with the device connected to a Mac.
2. Trim to a tight 5–12s loop of just the moment that sells the feature.
3. Export as **.mp4 (H.264), muted**, portrait, ideally ~600–800px wide to keep
   the page light. The frame is portrait (~9:19.5) and the video is centre-cropped
   with `object-fit: cover`, so exact dimensions don't need to match.
4. Name it per the table above and drop it in this folder. No code changes needed.

The videos autoplay muted, loop, and only play while on screen. They're skipped
entirely for visitors who have Reduce Motion enabled — the poster shows instead.

Want a different clip in a slot? Edit the `<source src="assets/video/…">` and the
`poster="assets/img/posters/…"` for that section in `index.html`.
