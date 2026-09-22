# Project Guidelines & Verification Rules

## ⚠️ MANDATORY: TypeScript & Build Verification
Before committing or pushing ANY changes:
1. **Always run the build check**:
   ```bash
   (cd client && npm run build)
   ```
   This executes `tsc && vite build` and validates all TypeScript types and imports.
2. **Never push broken code**:
   - If `tsc` reports any type errors, missing imports (e.g. missing types from `../types`), or syntax errors, fix them immediately before pushing.
   - The repository has an active `.git/hooks/pre-commit` hook that will also block any commit if `npm run build` fails.
3. **Backend verification**:
   - Run `node -c server/src/routes/api.js` to ensure server routes have no syntax errors.
