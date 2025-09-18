# Fluorite PWA Video Player

Fluorite is an elegant Progressive Web App (PWA) video player built with React, Jotai, TypeScript, Vite, and Tailwind CSS. The application allows users to drag and drop video files or select them via file dialog for playback.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository

**CRITICAL SETUP REQUIREMENT:**

- This project REQUIRES pnpm as the package manager. Do NOT use npm or yarn.

**Development Workflow:**

1. Install dependencies: `pnpm install`
2. Run linting: `pnpm run lint` (run ESLint to ensure code quality)
3. Build the project: `pnpm run build` (typecheck and build application, NEVER CANCEL, set timeout to 30+ seconds)
4. Run development server: `pnpm run dev` (starts development server with hot reload)
5. Run preview server: `pnpm run preview` (for serving built application)

### Running the Application

**Development Mode:**

- Start dev server: `pnpm run dev`
- Access at: `http://localhost:5173/`
- Includes hot module replacement and React DevTools support

**Production Preview:**

- Build first: `pnpm run build`
- Start preview server: `pnpm run preview`
- Access at: `http://localhost:4173/`

## Code Quality and Formatting

**Linting:**

- Run ESLint: `pnpm run lint`
- Configuration: `eslint.config.js` with TypeScript strict rules
- ALWAYS run linting before committing changes

**Formatting:**

- Use Prettier: `npx prettier --write .` (no format script in package.json)
- Configuration: `prettier.config.js` with Tailwind CSS plugin
- Prettier will warn about `.vscode/settings.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` - this is expected

## Validation

**MANDATORY VALIDATION SCENARIOS:**
After making any changes, ALWAYS test these scenarios:

1. **Application Startup:**
   - Run `pnpm run dev`
   - Navigate to `http://localhost:5173/`
   - Verify the Fluorite logo, title, and "Drop a video file anywhere or click here to open one" message appear

2. **File Handling:**
   - Click on the main drop area to trigger file dialog
   - Verify file dialog opens correctly
   - Test drag-and-drop functionality if possible
   - Verify video controls appear disabled until video is loaded

3. **Build Validation:**
   - Run `pnpm run build` successfully
   - Run `pnpm run preview` and verify application loads at `http://localhost:4173/`
   - Take screenshots of the running application to verify UI integrity

4. **PWA Features:**
   - Verify service worker registration in browser dev tools
   - Check manifest.json is generated correctly in dist/
   - Verify PWA assets are generated properly

**Build Artifacts:**

- Output directory: `dist/`
- Key files: `index.html`, CSS bundle, JS bundle, `manifest.webmanifest`, `sw.js`
- PWA icons and assets are auto-generated

## Codebase Structure

**Key Directories:**

- `src/`: Main application code
  - `App.tsx`: Main application component
  - `main.tsx`: React application entry point
  - `components/`: UI components (ControlBar.tsx)
  - `hooks/`: Custom React hooks (useFileHandler.ts, etc.)
  - `utils.ts`: Utility functions and constants
- `public/`: Static assets (fluorite.svg)
- `dist/`: Build output (generated)

**Configuration Files:**

- `package.json`: Project dependencies and scripts
- `vite.config.ts`: Vite build configuration with PWA plugin
- `tsconfig.json`: TypeScript configuration (references other configs)
- `tsconfig.app.json`: Application TypeScript settings
- `eslint.config.js`: ESLint configuration
- `prettier.config.js`: Prettier formatting configuration

**Important Implementation Details:**

- Uses custom hooks pattern for state management
- File handling supports video formats: .mp4, .mkv, .webm, .mov, .avi, .flv, .wmv
- PWA features include service worker, manifest, and file handling
- Tailwind CSS for styling
- React 19 with TypeScript strict mode

## Common Commands Reference

**Installation and Setup:**

```bash
corepack enable pnpm   # Enable corepack for pnpm
pnpm install

# Development
pnpm run dev          # Start dev server (http://localhost:5173/)
pnpm run build        # Build for production (~4.5s)
pnpm run preview      # Preview built app (http://localhost:4173/)
pnpm run lint         # Run ESLint

# Formatting
pnpx prettier --write .  # Format all files
pnpx prettier --check .  # Check formatting
```

**Troubleshooting:**

- If build fails: Ensure pnpm is installed globally
- If TypeScript errors: Check `tsconfig.app.json` and `tsconfig.node.json`
- If PWA features don't work: Check `vite.config.ts` PWA configuration
- If linting fails: Review `eslint.config.js` and fix reported issues

## Repository Information

**Package Manager:** pnpm (required - do not use npm/yarn)
**Node.js Framework:** Vite with React
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS v4 with Vite plugin
**PWA:** vite-plugin-pwa with Workbox

**Deploy Target:** Vercel (based on README badges)
**Browser Support:** Modern browsers with PWA support

**ALWAYS run the complete validation scenarios after making changes to ensure the video player functionality remains intact.**
