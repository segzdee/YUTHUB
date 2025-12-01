# YUTHUB Build Quick Reference

## Build Commands

### Standard Build (4GB RAM)
```bash
npm run build
```
Use this for local development with adequate resources.

### Low Memory Build (2GB RAM)
```bash
npm run build:low-mem
```
Use this for CI/CD environments like GitHub Actions, Vercel, or Netlify.

### Minimal Build (1.5GB RAM)
```bash
npm run build:minimal
```
Use this for constrained environments. May still fail during minification.

### No Minification Build (1.5GB RAM) - RECOMMENDED FOR CONSTRAINED ENVIRONMENTS
```bash
npm run build:no-minify
```
✅ **This build succeeds** in memory-constrained environments.
- Build time: ~19 seconds
- Memory usage: ~1.5GB peak
- Output size: ~3.4MB (unminified)

## What Was Optimized

### Vite Configuration
- ✅ ESNext target for modern, smaller output
- ✅ ESBuild minification (faster than Terser)
- ✅ Sourcemaps disabled in production
- ✅ Gzip size reporting disabled
- ✅ Manual chunk splitting into 8 vendor bundles
- ✅ Max parallel file operations set to 1
- ✅ CSS code splitting enabled
- ✅ Legal comments removed

### Build Strategy
- ✅ Aggressive vendor code splitting
- ✅ Node.js heap size increased to 4GB (configurable)
- ✅ All dashboard routes lazy-loaded
- ✅ Named imports for tree-shaking

### Vendor Chunks Created
1. `vendor-react` - React core libraries
2. `vendor-radix` - Radix UI components
3. `vendor-charts` - Recharts visualization
4. `vendor-tanstack` - TanStack Query
5. `vendor-forms` - Form libraries (react-hook-form, zod)
6. `vendor-icons` - Icon libraries
7. `vendor-animation` - Framer Motion
8. `vendor` - All other dependencies

## Unused Dependencies Identified

These can be safely removed to reduce bundle size:

```bash
npm uninstall react-icons @radix-ui/react-icons styled-components react-toastify react-select react-datepicker react-dropzone
```

**Estimated savings:** 500KB-1MB in bundle size

## Build Success Metrics

### Current Status
| Build Type | Memory | Time | Size | Status |
|------------|--------|------|------|--------|
| Standard | 4GB | ~30s | 1.2MB | ⚠️ High memory |
| Low-mem | 2GB | ~35s | 1.2MB | ⚠️ May fail |
| No-minify | 1.5GB | ~19s | 3.4MB | ✅ **Works** |

### Bundle Sizes (No-minify Build)
- Main bundle: ~129KB
- Vendor-react: ~1.08MB
- Vendor (other): ~1.28MB
- Vendor-charts: ~540KB
- Vendor-tanstack: ~189KB
- Vendor-forms: ~141KB
- Route chunks: 10-50KB each

## Troubleshooting

### Build Killed at "rendering chunks..."
**Solution:** Use `npm run build:no-minify`

### Out of Memory Error
**Solution:** Close other applications or use a build server with more RAM

### Slow Build
**Solution:** The no-minify build is significantly faster (~19s vs ~30s)

## Next Steps

1. **For Production:** Consider post-build minification on a separate server
2. **For Optimization:** Remove unused dependencies listed above
3. **For Monitoring:** Track bundle sizes with each deployment
4. **For Performance:** Consider implementing Brotli pre-compression

## Support

For detailed information, see `BUILD_OPTIMIZATION.md`
