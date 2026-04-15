# LIVE AUDIENCE MAP SETUP (GA4 + GitHub Actions)

This site can publish `public/live-audience.json` automatically from **Google Analytics 4 Realtime** with no extra server.

## 1) Create a Google service account
- Open Google Cloud Console
- Create a project or use your current GA project
- Enable **Google Analytics Data API**
- Create a **Service Account**
- Create a JSON key and download it

## 2) Give the service account access to GA4
- Open Google Analytics
- Admin → Property Access Management
- Add the service account email
- Role: **Viewer** is enough

## 3) Configure GitHub
In your repository:

### Repository Variable
- `GA4_PROPERTY_ID` = your numeric GA4 property ID

### Repository Secret
- `GA4_SERVICE_ACCOUNT_JSON` = paste the full JSON key content

Optional variables:
- `GA4_MAX_COUNTRIES` = `25`
- `GA4_DEBUG` = `false`

## 4) How it updates
The Pages workflow now runs every **5 minutes** and updates:
- `public/live-audience.json`
- `public/mining-championship.json`

## 5) What the map expects
The published JSON contains entries like:

```json
{
  "updatedAt": "2026-04-15T18:40:00Z",
  "source": "ga4-realtime",
  "countries": [
    {
      "country": "Brazil",
      "code": "BR",
      "activeUsers": 12,
      "lat": -15.7939,
      "lng": -47.8828
    }
  ]
}
```

## 6) Troubleshooting
- If the map stays empty, check the workflow logs for `Build live audience feed`
- If the workflow says property/secret is missing, add the GitHub variable and secret first
- If the service account gets 403, confirm it was added to the GA4 property access list
