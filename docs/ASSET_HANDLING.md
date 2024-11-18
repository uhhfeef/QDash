# QDash Asset Handling Documentation

## Overview
This document explains how static assets are handled in the QDash application, including the configuration for Cloudflare Workers, webpack, and the server-side handling.

## Configuration Structure

### 1. Webpack Configuration
```javascript
// webpack.config.js
output: {
    filename: 'assets/js/[name].bundle.js',
    chunkFilename: 'assets/js/[name].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
    assetModuleFilename: 'assets/[name][ext]'
}
```
- Bundled JS files go to `assets/js/`
- CSS files go to `assets/styles/`
- Public files are copied maintaining their structure

### 2. Cloudflare Workers Configuration
```toml
# wrangler.toml
[assets]
binding = "ASSETS"
directory = "./dist"
```
- Uses the `ASSETS` binding for static file serving
- Points to the `dist` directory where webpack outputs files

### 3. Server-side Asset Handling
```javascript
// server.js
app.get('/*', async (c) => {
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    if (asset.ok) {
        return asset
    }
    return c.notFound()
})
```
- Directly serves assets using Cloudflare's ASSETS binding
- Preserves original request context

## Key Points and Resolved Issues

### 1. Asset Directory Structure
- **Bundle Output**: All webpack-bundled files go under `/assets/`
- **Public Files**: Static files from `public/` maintain their original paths
- **Auth Files**: Authentication JS remains in `/js/` for separation

### 2. Fixed Issues
- **Overwriting Problem**: Previously, CopyWebpackPlugin was overwriting bundled files
- **Path Consistency**: Aligned webpack output paths with HTML references
- **Asset Serving**: Simplified asset serving to use raw requests

### 3. Important Configurations
- **Public Paths**: Must be listed in `publicPaths` array for authentication bypass
- **Asset Binding**: Must use `ASSETS` binding in wrangler.toml
- **Webpack Clean**: Enabled to prevent stale files

## Best Practices

1. **Asset Organization**
   - Keep source files in `src/`
   - Keep static files in `public/`
   - Let webpack handle bundling and optimization

2. **Path Management**
   - Use consistent paths in HTML references
   - Keep auth-related files separate from bundled files
   - Use the `/assets/` prefix for bundled files

3. **Debugging**
   - Check network requests in browser dev tools
   - Verify files in `dist` directory after build
   - Monitor server logs for asset serving errors

## Common Issues and Solutions

1. **404 Errors**
   - Verify file exists in `dist` directory
   - Check path in HTML matches webpack output
   - Ensure path is listed in `publicPaths`

2. **500 Errors**
   - Check ASSETS binding in wrangler.toml
   - Verify server.js asset handling code
   - Check for file permission issues

3. **Bundle Not Loading**
   - Verify webpack build output
   - Check browser console for errors
   - Ensure paths match between HTML and webpack output

## Development Workflow

1. Make changes to source files in `src/`
2. Run webpack build: `npm run build`
3. Verify files in `dist/` directory
4. Deploy to Cloudflare Workers
5. Monitor logs for any asset serving issues

Remember to rebuild and redeploy after any changes to asset configuration or paths.
