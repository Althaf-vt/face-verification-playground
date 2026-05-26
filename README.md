# Biometric QA Lab

Internal full-stack testing suite for evaluating **face-api.js** suitability for LGBTQIA+ matrimony platform onboarding flows (selfie verification, liveness, catfish prevention).

> **Security notice:** This is **NOT** enterprise biometric security. Suitable for MVP/prototype QA only. Not banking-grade KYC. False positives/negatives are possible. Manual review remains essential.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TailwindCSS, react-webcam, face-api.js |
| Backend | Node.js, Express.js |
| Storage | Local temp folder only (`backend/temp/`) |

## Prerequisites

- Node.js 18+
- npm 9+
- Webcam (HTTPS or localhost for camera access)
- Modern browser (Chrome recommended; Android Chrome supported)

## Quick start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Download face-api.js model weights (~6 MB)
node scripts/download-models.js

# 3. Start frontend + backend concurrently
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Manual model download

If the script fails, download weights from the [face-api.js weights folder](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) into:

```
frontend/public/models/
├── tiny_face_detector/
├── face_landmark_68/
├── face_recognition/
└── face_expression/
```

Each subfolder needs its `-weights_manifest.json` and shard files.

## NPM packages

```bash
# Frontend (included in install:all)
cd frontend
npm install face-api.js react-webcam

# Backend
cd backend
npm install express cors multer uuid
```

## Project structure

```
face-api-test-cursor/
├── frontend/
│   ├── public/models/          # face-api.js weights
│   └── src/
│       ├── biometric-engine/   # detection, matching, liveness, lighting
│       ├── components/
│       ├── hooks/
│       ├── overlays/
│       ├── pages/
│       ├── services/
│       └── utils/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── temp/                   # local image + log storage
└── scripts/
    └── download-models.js
```

## Test pages

1. **Dashboard** — overview and module navigation
2. **Face Detection** — realtime boxes, landmarks, FPS, lighting
3. **Face Matching** — reference upload vs live capture, threshold tuning
4. **Liveness** — blink, head turn, smile, nod; anti-static heuristics
5. **Full Verification** — simulated onboarding (Auto Approved / Manual Review / Rejected)
6. **Diagnostics** — FPS, latency, liveness rate, temp file inventory

## Environment variables

Optional backend port (default `3001`):

```bash
PORT=3001 npm run dev:backend
```

No `.env` required for local development.

## Mobile testing

- Open http://\<your-local-ip\>:5173 on Android Chrome
- Grant camera permission when prompted
- Use portrait orientation for face framing
- Switch camera via Detection page button

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/storage/upload` | Save image to temp |
| GET | `/api/storage/list` | List temp files |
| DELETE | `/api/storage/clear` | Clear temp storage |
| POST | `/api/logs` | Append verification log |
| GET | `/api/logs` | Recent logs |

## Verification logic (simulation)

| Outcome | Criteria |
|---------|----------|
| Auto Approved | Distance ≤ 0.4 + liveness passed |
| Manual Review | Medium similarity (≤ 0.55) or low light |
| Rejected | Failed liveness, multi-face, or very low similarity |

## Limitations (documented in code)

- Client-side liveness is heuristic — photos/videos may fool basic checks
- Descriptor matching thresholds vary by lighting, angle, and demographics
- Not a substitute for vendor liveness SDKs or human review queues
- Temp storage has no encryption — internal QA use only

## Scripts

```bash
npm run dev              # Frontend + backend
npm run dev:frontend     # Vite only
npm run dev:backend      # Express only
npm run build            # Production frontend build
npm start                # Production backend
```

## License

Internal QA tool — use at your own discretion for evaluation purposes.
