# Fitnet Tracking Contract

## Destinations

- GTM: `GTM-WQXMLSVH`
- GA4: `G-WH85QPJEK0`
- Meta Pixel/Dataset: `1785730109070633`

## Rules

- Website code owns event meaning, coach/package values, payment path, and payment confirmation.
- GTM maps stable dataLayer events to GA4 and Meta.
- No GTM click selector or visible button text is used for business events.
- No customer name, email, phone, WhatsApp number, or payment-card data enters dataLayer.
- `payment_success` is reserved for a paid Ziina transaction confirmed by the backend.
- Free registration fires `registration_form_submit`, but never `payment_success`.
- Syria/manual payment clicks fire `payment_started` with:
  - `payment_method: whatsapp_manual`
  - `payment_path: syria`
- Syria/manual clicks never fire Purchase.

## Shared Parameters

- `coach_id`
- `coach_name`
- `domain`
- `challenge_id`
- `challenge_name`
- `package_id`
- `package_name`
- `value`
- `currency`
- `items`
- `cta_location` when applicable
- `page_type` when applicable
- `payment_method` when applicable
- `payment_path` when applicable

## Event Mapping

| dataLayer event | GA4 | Meta |
| --- | --- | --- |
| `registration_form_view` | `registration_form_view` | - |
| `registration_form_start` | `form_start` | - |
| `registration_form_step_complete` | `form_step_complete` | - |
| `registration_form_submit` | `generate_lead` | `CompleteRegistration` |
| `payment_started` | `begin_checkout` | `InitiateCheckout` |
| `payment_success` | `purchase` | `Purchase` |
| `payment_failed` | `payment_failed` | - |

## GTM Import

Import `GTM-WQXMLSVH-fitnet-multicoach.json` into a new workspace using **Merge**.
For conflicting tags and variables, choose **Overwrite** so the published Tarek-specific
entities are replaced by their dynamic versions. Review the import summary before
confirming. Do not publish until Preview testing passes.
