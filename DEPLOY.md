This repository contains the backend for GurTron. It also documents how to build and run the full project locally.

Quick deploy & run steps

1. From the workspace root, install dependencies:

```powershell
pnpm install
```

2. Build the frontend and backend:

```powershell
pnpm -C frontend build
pnpm -C backend build
```

3. Start the backend (it serves the built frontend at `/`):

```powershell
pnpm -C backend start
```

Dev (local):

```powershell
pnpm -C frontend dev
pnpm -C backend dev
```
