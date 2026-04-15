# Google Analytics on INRI Platform

This patch adds Google Analytics 4 to the Next.js root layout using `@next/third-parties/google` and sends page updates on route changes.

## Default measurement ID
- `G-M1ZJQTCXPT`

## Optional GitHub variable
Set this repository variable if you want to override the default build-time GA ID:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Result
- GA4 tag loads on every route
- route changes are pushed to GA on navigation
- you can verify traffic in Google Analytics Realtime / DebugView

## Important
Showing Google Analytics realtime visitors **inside the public site** still needs a secure backend or a scheduled export, because the Realtime Data API requires a numeric property ID and authenticated access.
