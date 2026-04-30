# Production Planning — Advanced Settings

## Overview

Each flock can optionally have **advanced settings** that override the breed standard curves with farm-specific values. When null, the breed standard is used automatically.

---

## Fields

| Field | Type | Range | Default | Description |
|---|---|---|---|---|
| `initialMortalityPct` | `number \| null` | 0–100 | `null` | Flat % of hens that die before production starts. Applied once to hens housed. |
| `eggsPct` | `number \| null` | 0–200 | `null` | Egg production as % of breed standard. 100 = standard. 95 = farm produces 95% of expected. |
| `hatchingEggsPct` | `number \| null` | 0–100 | `null` | % of total eggs set for hatching. Overrides the breed's per-week ramp-up curve. |
| `chicksPct` | `number \| null` | 0–100 | `null` | % of hatching eggs that become saleable chicks (hatch rate). Overrides breed curve. |

**null = use breed standard.** Send `null` explicitly to reset a field back to standard.

---

## How the calculation chain works

```
hensAlive       = hensHoused × (1 - initialMortalityPct / 100)
eggs            = hensAlive × (hdPct / 100) × 7 × (eggsPct / 100)
hatchingEggs    = eggs × (hatchingEggsPct / 100)
saleableChicks  = hatchingEggs × (chicksPct / 100)
```

When `hatchingEggsPct` or `chicksPct` is null, the per-week values from the breed standard are used instead (they vary week by week as the flock matures).

---

## Setting advanced settings (create or update flock)

Advanced settings are stored on the flock and sent in the **create** (`POST`) or **update** (`PUT`) flock body.

### Create flock with advanced settings

```http
POST /api/production/flocks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Flock A",
  "hatchDate": "2024-03-01",
  "hensHoused": 10000,
  "productionPeriod": 72,
  "productId": "23",
  "initialMortalityPct": 2,
  "eggsPct": 97,
  "hatchingEggsPct": 75,
  "chicksPct": 80
}
```

### Update advanced settings only

```http
PUT /api/production/flocks/9
Authorization: Bearer <token>
Content-Type: application/json

{
  "initialMortalityPct": 2,
  "eggsPct": 97,
  "hatchingEggsPct": 75,
  "chicksPct": 80
}
```

### Reset a field to breed standard (send null)

```http
PUT /api/production/flocks/9
Authorization: Bearer <token>
Content-Type: application/json

{
  "hatchingEggsPct": null,
  "chicksPct": null
}
```

---

## Reading advanced settings from a flock

All flock responses include an `advancedSettings` object:

```json
{
  "id": 9,
  "name": "Flock A",
  "hensHoused": 10000,
  "productionPeriod": 72,
  "advancedSettings": {
    "initialMortalityPct": 2,
    "eggsPct": 97,
    "hatchingEggsPct": 75,
    "chicksPct": 80
  }
}
```

`null` in any field = breed standard is used for that calculation.

---

## Execute planning with advanced settings

No extra parameters needed. The planning endpoint reads advanced settings from the flock automatically.

```http
GET /api/production/planning/execute?flockId=9
Authorization: Bearer <token>
```

The `hensHoused` value in each row of the response already reflects the mortality adjustment:

```json
{
  "startWeek": 20,
  "rows": [
    {
      "period": "2024.20",
      "weekIndex": 0,
      "standardWeek": 20,
      "hensHoused": 9800,
      "eggs": 1939,
      "hatchingEggs": 1454,
      "saleableChicks": 1163,
      "hatchingEggsCum": 1454,
      "saleableChicksCum": 1163,
      "hdPctProduction": 4.5,
      "hhPctProduction": 4.5
    }
  ]
}
```

> Note: `hensHoused` in the row = `originalHensHoused × (1 - initialMortalityPct / 100)`

---

## Validation errors

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "initialMortalityPct", "message": "initialMortalityPct must be between 0 and 100" },
      { "field": "eggsPct", "message": "eggsPct must be between 0 and 200" }
    ]
  }
}
```

---

## UI recommendations

Show the 4 fields as optional inputs, all blank/empty by default (= use breed standard).

| Field | Label suggestion | Input | Placeholder |
|---|---|---|---|
| `initialMortalityPct` | Initial Mortality | number, step 0.1 | Breed standard |
| `eggsPct` | Egg Production (% of standard) | number, step 0.1 | 100 |
| `hatchingEggsPct` | Hatching Eggs % | number, step 0.1 | Breed standard |
| `chicksPct` | Chick Hatch Rate % | number, step 0.1 | Breed standard |

Treat empty input as `null` (do not send 0).
