"""
Compute aggregate fiscal metrics from cbo_comparison.json.

Reads the parameter-level comparison data and produces aggregate_impacts.json
with total revenue, total mandatory spending, and fiscal balance under old
and new CBO baselines.
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "public" / "data"
INPUT_PATH = DATA_DIR / "cbo_comparison.json"
OUTPUT_PATH = DATA_DIR / "aggregate_impacts.json"

# Which parameter keys contribute to each aggregate.
REVENUE_KEYS = ["income_tax", "payroll_taxes"]
SPENDING_KEYS = ["social_security", "snap", "ssi", "unemployment_compensation"]


def sum_params(
    params: dict,
    keys: list[str],
    series: str,
) -> dict[str, float]:
    """Sum the given parameter keys for a particular series ('old' or 'new').

    Returns {year_str: total_value} for all years that appear in *all*
    the requested parameters (intersection of year sets).
    """
    # Collect year sets per key.
    year_sets = []
    for key in keys:
        if key not in params:
            continue
        year_sets.append(set(params[key][series].keys()))

    if not year_sets:
        return {}

    # Use union of years but only include a year if the key has data for it.
    all_years = sorted(set().union(*year_sets))

    totals: dict[str, float] = {}
    for year in all_years:
        total = 0.0
        for key in keys:
            if key not in params:
                continue
            val = params[key][series].get(year)
            if val is not None:
                total += val
        totals[year] = total
    return totals


def compute_pct_change(
    old: dict[str, float], new: dict[str, float]
) -> dict[str, float]:
    """Percent change = (new - old) / |old| * 100 for overlapping years."""
    pct: dict[str, float] = {}
    for yr in sorted(set(old) & set(new)):
        o = old[yr]
        n = new[yr]
        if o == 0:
            continue
        pct[yr] = round((n - o) / abs(o) * 100, 2)
    return pct


def compute_diff(
    old: dict[str, float], new: dict[str, float]
) -> dict[str, float]:
    """Absolute difference (new - old) for overlapping years."""
    diff: dict[str, float] = {}
    for yr in sorted(set(old) & set(new)):
        diff[yr] = new[yr] - old[yr]
    return diff


def main():
    with open(INPUT_PATH) as f:
        data = json.load(f)

    params = data["parameters"]

    # --- Total revenue ---
    rev_old = sum_params(params, REVENUE_KEYS, "old")
    rev_new = sum_params(params, REVENUE_KEYS, "new")

    # --- Total mandatory spending ---
    spend_old = sum_params(params, SPENDING_KEYS, "old")
    spend_new = sum_params(params, SPENDING_KEYS, "new")

    # --- Fiscal balance (revenue - spending) ---
    # Only for years that appear in both revenue and spending.
    balance_years = sorted(set(rev_old) & set(spend_old) & set(rev_new) & set(spend_new))
    balance_old = {yr: rev_old[yr] - spend_old[yr] for yr in balance_years}
    balance_new = {yr: rev_new[yr] - spend_new[yr] for yr in balance_years}

    # Build the years list: union of all years from the projection period.
    # Only include years >= 2025 (the projection window).
    all_years = set()
    for d in [rev_old, rev_new, spend_old, spend_new]:
        all_years.update(d.keys())
    years = sorted(y for y in all_years if int(y) >= 2025)

    output = {
        "metadata": {
            "old_baseline": data["metadata"]["old_baseline"],
            "new_baseline": data["metadata"]["new_baseline"],
            "source_url": data["metadata"]["source_url"],
            "generated_at": data["metadata"]["generated_at"],
            "revenue_components": REVENUE_KEYS,
            "spending_components": SPENDING_KEYS,
        },
        "years": years,
        "metrics": {
            "total_revenue": {
                "label": "Total federal revenue",
                "description": "Income tax + payroll taxes",
                "old": {y: rev_old.get(y) for y in years if rev_old.get(y) is not None},
                "new": {y: rev_new.get(y) for y in years if rev_new.get(y) is not None},
                "pct_change": {
                    k: v
                    for k, v in compute_pct_change(rev_old, rev_new).items()
                    if k in years
                },
                "diff": {
                    k: v
                    for k, v in compute_diff(rev_old, rev_new).items()
                    if k in years
                },
            },
            "total_spending": {
                "label": "Total mandatory spending",
                "description": "Social Security + SNAP + SSI + unemployment",
                "old": {y: spend_old.get(y) for y in years if spend_old.get(y) is not None},
                "new": {y: spend_new.get(y) for y in years if spend_new.get(y) is not None},
                "pct_change": {
                    k: v
                    for k, v in compute_pct_change(spend_old, spend_new).items()
                    if k in years
                },
                "diff": {
                    k: v
                    for k, v in compute_diff(spend_old, spend_new).items()
                    if k in years
                },
            },
            "fiscal_balance": {
                "label": "Fiscal balance",
                "description": "Revenue minus mandatory spending",
                "old": {y: balance_old[y] for y in years if y in balance_old},
                "new": {y: balance_new[y] for y in years if y in balance_new},
                "pct_change": {
                    k: v
                    for k, v in compute_pct_change(balance_old, balance_new).items()
                    if k in years
                },
                "diff": {
                    k: v
                    for k, v in compute_diff(balance_old, balance_new).items()
                    if k in years
                },
            },
        },
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {OUTPUT_PATH}  ({OUTPUT_PATH.stat().st_size:,} bytes)")
    print(f"Years: {years}")
    for key, metric in output["metrics"].items():
        n_old = len(metric["old"])
        n_new = len(metric["new"])
        print(f"  {key:20s}  old={n_old}  new={n_new}  label={metric['label']!r}")


if __name__ == "__main__":
    main()
