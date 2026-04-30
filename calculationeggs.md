# Egg Production Calculation

## Standards field meaning

`hd_pct_production` (and `hh_pct_production`) is Hen-Day Egg Production as a **percentage (0–100)**, not a decimal fraction and not "eggs per hen per week".

## Egg formula

```
eggs = hensHoused × (hdPct / 100) × 7
```

For a full 7-day week. Result rounded to nearest integer.

If `hd_pct_production` is null, fall back to `hh_pct_production`. If both null, eggs = 0.

Unit test: `hensHoused=28500`, `hdPct=55` → `eggs = 28500 × 0.55 × 7 = 109725`

## Period format

`period` is ISO year-week: `"2024.26"`. `standards.week` is flock **age in weeks** (not calendar week).

Period date is calculated as:
```
periodStartDate = hatchDate + (standardWeek × 7 days)
```

## productionPeriod field

`production_flocks.production_period` = **end week of life** (age in weeks when flock is culled). It is NOT a count of production weeks.

## Planning algorithm

1. Load `standards_growth` for the flock's `product_id`, `sex = 'female'`, ordered by `week ASC`.
2. `startWeek` = first week where `hd_pct_production > 0` (or `hh_pct_production > 0`). Typically week 20.
3. Generate one row per age week from `startWeek` to `productionPeriod` (inclusive).
4. For each row:
   - `eggs = hensHoused × (hdPct / 100) × 7`
   - `hatchingEggs = hensHoused × he_week`
   - `saleableChicks = hensHoused × saleable_chicks_week`
   - `hatchingEggsCum = hensHoused × he_cum`
   - `saleableChicksCum = hensHoused × saleable_chicks_cum`
   - `period = ISO year-week of (hatchDate + standardWeek × 7)`
   - `weekIndex = standardWeek - startWeek` (0-based)

Example: `startWeek=20`, `productionPeriod=72` → 53 rows, age weeks 20–72. All weeks fall within `standards_growth` data range (weeks 1–75), so no carry-forward needed.

## Other curves (same standards table)

| Field | Description |
|---|---|
| `he_week` | Hatching eggs per hen per week |
| `he_cum` | Hatching eggs cumulative per hen |
| `saleable_chicks_week` | Saleable chicks per hen per week |
| `saleable_chicks_cum` | Saleable chicks cumulative per hen |
| `egg_weight_week` | Egg weight (g) |

Do NOT use `eggsNoWeek` / `eggsNoHD` (always 0 for layers).
