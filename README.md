# Drabyna Systems Showcase

Sanitised, interactive demonstrations of connected commerce and operational systems.

## What this repository demonstrates

- API orchestration across commerce, validation, warehouse and customer messaging.
- Barcode-led packing evidence and a customer-service proof record.
- A deliberately small set of useful warehouse KPIs.
- A complete customer returns and exchange workflow.

## Public by design

Every customer, order, product, event and metric in this repository is synthetic. This repository was created from a blank history and does not contain production source code, private repository history, credentials, customer information or live endpoints.

## Run locally

No build tool or dependency installation is required. Serve the repository with any static file server, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Publishing

GitHub Pages deploys automatically whenever a commit is pushed to `main`. The deployment workflow is defined in `.github/workflows/pages.yml`.

## Rights

Copyright © Drabyna. All rights reserved. No licence is granted to copy, modify, distribute or reuse this source code.
