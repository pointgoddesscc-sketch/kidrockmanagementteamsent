# Independent Editorial Campaign Operations

## Scope and disclosure
This is a fan/editorial project, not an official artist or management property. Do not describe the operator as Kid Rock's management, booking desk, fan-relations team, or authorized representative unless written authorization is verified and retained. Do not offer meet-and-greets, tickets, merchandise, paid access, or collect payments on this site.

## Daily workflow (draft-first; no automatic publishing)
1. Check the artist's official website and public channels plus reputable reporting.
2. Record each proposed item in the editorial log with headline, source URL, source date, date checked, factual summary, confidence, and editor.
3. Separate confirmed facts from commentary; label unconfirmed claims and omit them if they cannot be corroborated.
4. Prepare one short post and one longer site note with source links.
5. Have a human review names, dates, rights, image permissions, and wording.
6. Publish manually only after review and only to accounts the operator owns or is authorized to manage.
7. Log the final URL, platform, publication time, and any correction.

## Suggested editorial rotation
- Monday: verified news roundup.
- Tuesday: music/catalogue spotlight with links to official listening services.
- Wednesday: sourced timeline or fact-check.
- Thursday: public interview or performance link with attribution.
- Friday: week-in-review.
- Saturday: fan discussion prompt that does not solicit sensitive information.
- Sunday: corrections, source audit, and next-week planning.

## Automation guardrails
- Draft generation and reminders may be automated; publication must remain approval-gated until platform OAuth, account ownership, scopes, and test-post permissions are verified.
- Never scrape or bypass platform controls. Never store tokens in repository files, browser storage, logs, or issue bodies. Use platform-supported secrets and OAuth.
- No cron job, social connection, analytics integration, or live publishing is claimed to exist until it is configured and tested in the target environment.
- Never invent metrics, engagements, traffic, or official status.

## Launch checklist
- [ ] Review all routes and remove official-management/booking/meet-and-greet claims.
- [ ] Confirm domain registrar delegation and DNS authority without disturbing mail records.
- [ ] Preview deployment passes route, mobile, keyboard, link, and content checks.
- [ ] Check redirects and ensure no payment/checkout flow is exposed for this project.
- [ ] Configure and test platform OAuth only for accounts the operator controls.
- [ ] Add scheduled draft/reminder job with logs, duplicate prevention, and failure alerting.
- [ ] Publish a manual test only after account authorization and owner approval.
- [ ] Verify analytics data source and consent/privacy requirements before reporting metrics.

## Current known constraints
The repository contains a Vercel static-site surface and a separate Cloudflare Worker entry point (src/index.js). Confirm which platform is authoritative for the apex domain before changing production. Preserve existing Forward Email MX/TXT records and do not replace the zone wholesale.
