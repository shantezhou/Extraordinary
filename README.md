# Extraordinary 🦉

Record a lecture and get an instant study set: a plain-language overview,
simplified notes, flip-style flashcards, and a Kahoot-style quiz. Built for
kids and neurodivergent learners (ADHD, autism, dyslexia, intellectual
disabilities).

## What it does

1. Tap the giant record button on the home page and capture a lecture.
2. The audio is sent to **OpenAI Whisper** for transcription.
3. The transcript is sent to **OpenAI GPT-4o** with **Structured Outputs**,
   which returns a validated JSON study set: lecture overview, notes,
   flashcards, and a 4-color quiz.
4. The study set is rendered into three tabs (Notes / Cards / Quiz) and
   automatically saved to a local **Saved Lectures** library.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict) + **Tailwind CSS** +
  **shadcn/ui**
- **Framer Motion** for transitions, flip animations, and celebrations
- **canvas-confetti** for the quiz win bursts
- **OpenAI Whisper** (`whisper-1`) for transcription
- **OpenAI GPT-4o** (`gpt-4o-2024-08-06`) with Structured Outputs for the
  study-set generation
- **Zod** to validate every model response (and every saved lecture)

## Storage

- React state holds the active session.
- Saved lectures live in **browser localStorage** under
  `extraordinary.savedLectures.v1`. They persist across refreshes on the
  same device but are not synced across devices and are not in any
  database. There is no auth.

## Run it on your own computer

You'll need:

1. **Node.js 18.18 or newer** — install from <https://nodejs.org> (the LTS
   download is fine). Verify by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```
2. **Git** — install from <https://git-scm.com/downloads> if you don't
   already have it.
3. **An OpenAI API key** — sign in at <https://platform.openai.com/api-keys>
   and click "Create new secret key". Copy the key somewhere safe; you'll
   only see it once. New accounts get a small amount of free credit, after
   which usage is pay-per-call (transcribing a few minutes of audio and
   generating a study set typically costs a few cents).

Then in a terminal:

```bash
# 1. Clone the project (or download the ZIP from GitHub and unzip it)
git clone <this-repo-url> Extraordinary
cd Extraordinary

# 2. Install dependencies (one-time)
npm install

# 3. Add your OpenAI key
cp .env.example .env.local
# Open .env.local in any text editor and paste your key after OPENAI_API_KEY=

# 4. Start the app
npm run dev
```

Open <http://localhost:3000> in **Chrome, Edge, or Safari** (Firefox is
fine too, but speech-to-read varies more by voice).

Allow the browser to use your microphone when it asks. Tap the big mic
button, talk for at least ~20 seconds, hit stop, then **Make my study set →**.

To stop the app, press `Ctrl+C` in the terminal.

### Required environment variables

| Name             | Where it's used                                                 |
| ---------------- | --------------------------------------------------------------- |
| `OPENAI_API_KEY` | `POST /api/transcribe` (Whisper) and `POST /api/generate` (GPT-4o) |

Server-side only — never prefix with `NEXT_PUBLIC_`. The `.env.local` file
is gitignored, so your key won't accidentally end up on GitHub.

Model IDs are centralized in `src/lib/models.ts` — swap a model there if
you want to test a different snapshot or move to a different provider.

### Common issues

- **"OPENAI_API_KEY is not set"** — double-check `.env.local` exists at the
  project root, has no quotes around the value, and that you restarted
  `npm run dev` after editing it.
- **"Mic access was blocked"** — your browser's address bar has a small
  camera/mic icon; click it and allow microphone access for `localhost`.
- **"That recording is bigger than the 25 MB limit"** — Whisper caps
  uploads at 25 MB. WebM Opus is roughly 0.5 MB per minute, so try a
  shorter clip (or split a long lecture into chunks).
- **Audio playback is silent on iPhone Safari** — iOS sometimes blocks
  autoplay; tapping the play control on the audio element will start it.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

## Key UX details

- **Home page** is intentionally minimal: a Record / Saved lectures pill nav
  and one large mic button.
- **Loading screen** shows a friendly bobbing owl with rotating stage
  messages so a 30-second-to-2-minute pipeline never feels stuck.
- **Notes tab** opens with a "Lecture overview" card and a responsive grid
  of note cards. **Tap any card (or the overview)** to have it read aloud
  via the browser's `SpeechSynthesis`. Tapping again stops it; tapping a
  different card cancels the previous one automatically.
- **Cards tab** shows a single 3D-flipping flashcard at a time with prev /
  next buttons and ← / → keyboard navigation. Each side has a Read button.
- **Quiz tab** is a Kahoot-style game: 4 colored answer buttons (red
  triangle, blue diamond, yellow circle, green square), wrong-answer shake,
  confetti on correct, progress stars, and a results screen with a
  first-try score.
- **Saved Lectures tab** lists previously saved sessions on this device.
  Open one to revisit the same study set, or delete it.
- **Accessibility**: all interactive elements are keyboard-focusable with
  visible focus rings, animations respect `prefers-reduced-motion`, and the
  app uses Nunito for normal text plus a dyslexia-friendly Lexend variable
  for swap-in.

## Project layout

```
src/
  app/
    api/
      transcribe/route.ts     # POST audio → Whisper → transcript
      generate/route.ts       # POST transcript → GPT-4o Structured Outputs
    layout.tsx                # Fonts (Nunito + Lexend) and global shell
    page.tsx                  # Home — renders <Session>
    globals.css               # Tailwind layers + CSS variables
  components/
    session.tsx               # Top-level phase machine
    recorder.tsx              # Mic capture preview UI
    record-button.tsx         # Big animated mic button
    waveform.tsx              # Live mic-level bars
    loading-screen.tsx        # Bobbing owl + rotating stage messages
    note-card.tsx             # Tap-to-read note tile
    notes-view.tsx            # Notes grid + overview wrapper
    overview-card.tsx         # Tap-to-read lecture overview
    flashcard.tsx             # 3D flip card with read-aloud both sides
    flashcards-view.tsx       # Single-card carousel + nav
    quiz-question.tsx         # Kahoot question + 4 answer buttons
    quiz-view.tsx             # Quiz state machine + results screen
    speech-provider.tsx       # SpeechSynthesis context bus
    transcript-view.tsx       # Collapsible raw transcript
    study-set.tsx             # Tabbed Notes / Cards / Quiz layout
    saved-lectures-view.tsx   # Local library list
  hooks/
    use-recorder.ts           # MediaRecorder + Web Audio level meter
  lib/
    models.ts                 # Whisper + generation model IDs
    openai.ts                 # Server-only lazy OpenAI client
    pipeline.ts               # /api/transcribe + /api/generate orchestration
    schemas.ts                # Shared Zod schema for study artifacts
    saved-lectures.ts         # localStorage hook for saved sessions
    utils.ts                  # cn() class merge helper
```

## Known limits

- 25 MB Whisper upload cap; on Vercel hobby, request bodies are also capped
  at 4.5 MB, which is roughly 9 minutes of WebM Opus. Longer recordings
  would need streaming or chunking.
- Saved lectures are device-local; clearing browser storage wipes them.
- No teacher/parent dashboard, no auth, no usage controls.
