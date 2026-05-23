# Bridge route visibility fix

This patch is intentionally conservative.

It fixes the `/bridge` visibility problem by adding a build-safe static-export route:

- `src/app/bridge/page.tsx`
- `components/inri-bridge-page.tsx`
- `src/app/not-found.tsx` redirect helper for `/bridge` -> `/bridge/` on static hosting

It also updates site links to `/bridge/` for GitHub Pages/static-export compatibility.

The page does **not** change contracts, watchers, PM2, bridge APIs, claims, releases, or wallet contracts.

After deploy, test:

```txt
https://platform.inri.life/bridge/
```

Then test the no-slash version:

```txt
https://platform.inri.life/bridge
```

If `/bridge/` works but `/bridge` does not, wait for GitHub Pages cache or open in an incognito window. The custom 404 redirect helps no-slash static routes.
