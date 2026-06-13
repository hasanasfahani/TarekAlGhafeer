# Fitnet Coach Websites

One hostname-driven application for Fitnet coach websites and the shared admin portal.

## Production Domains

- `abdulrahman-katlan.fitnetapp.com`
- `loay-hamdan.fitnetapp.com`
- `tarek-alghafeer.fitnetapp.com`
- `karam-alhemesh.fitnetapp.com`
- `admin.fitnetapp.com`

Coach identity, challenge details, packages, prices, and tracking metadata are configured
in `shared/coaches.ts`.

## Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run check
npm run build
```

## Deployment

The `main` branch deploys automatically to the `fitnet-coach-websites` Vercel project.
All production domains point to the same deployment and resolve their content by hostname.

## Tracking

Tracking documentation and the current GTM import artifact are stored in `docs/tracking/`.
Website code owns event semantics and dataLayer values; GTM maps stable events to GA4 and
Meta.
