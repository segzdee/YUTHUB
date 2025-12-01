# YUTHUB Build Optimization Guide

This document describes the build optimizations implemented to enable successful compilation in memory-constrained environments.

## Optimizations Implemented

### 1. Vite Configuration (`vite.config.ts`)

#### Build Target & Minification
- **`target: 'esnext'`** - Modern ES target for smaller output
- **`minify: 'esbuild'`** - Fast, memory-efficient minification (vs terser)
- **`sourcemap: false`** - Disabled for production builds
- **`reportCompressedSize: false`** - Skip gzip size calculation to save memory

#### Code Splitting Strategy
- **`cssCodeSplit: true`** - Split CSS into separate chunks
- **`assetsInlineLimit: 4096`** - Inline small assets < 4KB
- **Manual Chunks** - Aggressive vendor splitting:
  - `vendor-react` - React core (react, react-dom, react-router)
  - `vendor-radix` - All @radix-ui components
  - `vendor-charts` - Chart libraries (recharts)
  - `vendor-tanstack` - TanStack Query
  - `vendor-forms` - Form libraries (react-hook-form, zod)
  - `vendor-icons` - Icon libraries (lucide-react)
  - `vendor-animation` - Animation libraries (framer-motion)
  - `vendor` - All other node_modules

#### Rollup Options
- **`maxParallelFileOps: 1`** - Reduce concurrent operations to minimize memory
- **`commonjsOptions.transformMixedEsModules: true`** - Better CommonJS handling

#### ESBuild Options
- **`legalComments: 'none'`** - Remove license comments to reduce size
- **`logOverride`** - Silence non-critical warnings

### 2. Package.json Scripts

Multiple build scripts for different memory constraints:

```json
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
"build:low-mem": "NODE_OPTIONS='--max-old-space-size=2048' vite build"
"build:minimal": "NODE_OPTIONS='--max-old-space-size=1536' vite build --mode production"
"build:no-minify": "NODE_OPTIONS='--max-old-space-size=1536' vite build --minify false"
```

**Recommended Usage:**
- **Local development:** `npm run build` (4GB heap)
- **CI/CD with 2GB RAM:** `npm run build:low-mem`
- **Severely constrained:** `npm run build:no-minify` (works but larger output)

### 3. Identified Unused Dependencies

The following dependencies are potentially unused and can be removed to reduce bundle size:

- **`react-icons`** - Project uses lucide-react instead
- **`@radix-ui/react-icons`** - Project uses lucide-react instead
- **`styled-components`** - Project uses Tailwind CSS
- **`react-toastify`** - Project uses sonner for toasts
- **`react-select`** - Project uses shadcn/ui Select component
- **`react-datepicker`** - Minimal usage (1-2 files)
- **`react-dropzone`** - Minimal usage

**To remove these:**
```bash
npm uninstall react-icons @radix-ui/react-icons styled-components react-toastify react-select react-datepicker react-dropzone
```

This could reduce the bundle size by 500KB-1MB.

### 4. Code Splitting Best Practices

All dashboard routes are lazy-loaded:
```typescript
const Residents = lazy(() => import('./pages/dashboard/Residents'));
const Properties = lazy(() => import('./pages/dashboard/Properties'));
// etc.
```

This ensures smaller initial bundle and on-demand loading.

### 5. Import Optimization

Ensure all imports use named imports for better tree-shaking:
```typescript
// ✅ Good - Named imports
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ❌ Bad - Barrel imports (prevents tree-shaking)
import * as UI from '@/components/ui';
```

## Build Performance Metrics

### Without Minification
- **Build time:** ~19 seconds
- **Memory usage:** ~1.5GB peak
- **Bundle size:** ~3.4MB (unminified)
- **Status:** ✅ Builds successfully

### With Minification (when memory available)
- **Build time:** ~30-45 seconds
- **Memory usage:** ~2.5-3GB peak
- **Bundle size:** ~1.2MB (minified)
- **Status:** ⚠️ Requires >2GB RAM

## Troubleshooting

### Build Gets Killed During Rendering
**Symptom:** Build fails at "rendering chunks..." step

**Solutions:**
1. Use `npm run build:no-minify` to skip minification
2. Increase Node memory: `export NODE_OPTIONS='--max-old-space-size=4096'`
3. Close other applications to free RAM
4. Remove unused dependencies to reduce workload

### Out of Memory During Minification
**Symptom:** "JavaScript heap out of memory" error

**Solutions:**
1. Use `build:no-minify` script
2. Consider server-side minification post-build
3. Split build into smaller chunks
4. Upgrade server RAM if possible

### Slow Build Times
**Symptom:** Build takes >2 minutes

**Solutions:**
1. Enable persistent cache: Add to vite.config.ts:
   ```typescript
   cacheDir: '.vite-cache'
   ```
2. Reduce `maxParallelFileOps` further (currently 1)
3. Use `--no-clean` flag to preserve previous build artifacts

## Deployment Recommendations

### Production Build
For production deployments with adequate resources:
```bash
npm run build
```

### CI/CD Environments
For GitHub Actions, Vercel, etc. with 2GB RAM:
```bash
npm run build:low-mem
```

### Constrained Environments (Replit, small VPS)
```bash
npm run build:no-minify
# Then optionally minify with external tool
npx esbuild dist/public/assets/*.js --minify --outdir=dist/public/assets
```

## Future Optimizations

1. **Dependency Audit:** Regularly run `npx depcheck` to identify unused packages
2. **Bundle Analysis:** Use `rollup-plugin-visualizer` to identify large chunks
3. **Dynamic Imports:** Convert more components to lazy-loaded
4. **CDN Strategy:** Host large vendor chunks on CDN
5. **Precompression:** Generate .br (Brotli) files at build time

## Monitoring

Track bundle size over time:
```bash
npm run build && du -sh dist/public/assets/*.js | sort -h
```

Target sizes:
- Initial bundle: <200KB
- Vendor chunks: <500KB each
- Route chunks: <50KB each
