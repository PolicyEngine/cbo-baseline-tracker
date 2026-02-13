"""
Extract CBO baseline parameter data from policyengine-us at two git commits
and produce a comparison JSON file.
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_DIR = Path("/Users/maxghenis/PolicyEngine/policyengine-us")

OLD_COMMIT = "23e7d802b7"
NEW_COMMIT = "f99b4cd80e"

OLD_LABEL = "February 2024"
NEW_LABEL = "February 2026"

SOURCE_URL = "https://www.cbo.gov/publication/61882"

OUTPUT_PATH = Path(
    "/Users/maxghenis/PolicyEngine/cbo-baseline-tracker/public/data"
    "/cbo_comparison.json"
)

# Paths relative to the repo root.
CBO_CAL = "policyengine_us/parameters/calibration/gov/cbo"
CPI_DIR = "policyengine_us/parameters/gov/bls/cpi"

# Simple (flat) CBO calibration files.  key -> (filename, category, label override or None)
SIMPLE_FILES = {
    "income_tax": (
        f"{CBO_CAL}/income_tax.yaml",
        "revenue",
        None,
    ),
    "payroll_taxes": (
        f"{CBO_CAL}/payroll_taxes.yaml",
        "revenue",
        None,
    ),
    "social_security": (
        f"{CBO_CAL}/social_security.yaml",
        "spending",
        None,
    ),
    "snap": (
        f"{CBO_CAL}/snap.yaml",
        "spending",
        None,
    ),
    "ssi": (
        f"{CBO_CAL}/ssi.yaml",
        "spending",
        None,
    ),
    "unemployment_compensation": (
        f"{CBO_CAL}/unemployment_compensation.yaml",
        "spending",
        None,
    ),
}

# Nested file (income_by_source.yaml) -- each top-level key (except
# description/metadata) is a sub-parameter.
NESTED_FILE = f"{CBO_CAL}/income_by_source.yaml"
NESTED_CATEGORY = "income"

# CPI files -- only exist in the NEW commit for cpi_u and cpi_w.
# c_cpi_u exists in both commits.
CPI_FILES = {
    "cpi_u": (f"{CPI_DIR}/cpi_u.yaml", "cpi"),
    "cpi_w": (f"{CPI_DIR}/cpi_w.yaml", "cpi"),
    "c_cpi_u": (f"{CPI_DIR}/c_cpi_u.yaml", "cpi"),
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def git_show(commit: str, path: str) -> str | None:
    """Return file contents at *commit*, or None if the path doesn't exist."""
    result = subprocess.run(
        ["git", "show", f"{commit}:{path}"],
        capture_output=True,
        text=True,
        cwd=REPO_DIR,
    )
    if result.returncode != 0:
        return None
    return result.stdout


def extract_year(date_key: str) -> str:
    """'2025-01-01' -> '2025'"""
    return date_key.split("-")[0]


def is_annual_or_feb(date_key: str) -> bool:
    """Return True for dates like YYYY-01-01 or YYYY-02-01 (annual / Feb
    projections used in CPI files)."""
    parts = date_key.split("-")
    return parts[1] in ("01", "02")


def parse_values_dict(raw_values: dict, cpi_mode: bool = False) -> dict:
    """Convert a YAML values dict to {year_str: numeric_value}.

    * Handles the policyengine YAML convention where some entries are dicts
      with a ``value`` key (and optional ``metadata``).
    * For CPI files (``cpi_mode=True``), only Jan or Feb dates are kept
      and the year for Feb dates is used as-is (they represent the
      *following* year's parameter, but we store the calendar year of the
      date itself to keep things simple and comparable).
    """
    out: dict[str, float | int] = {}
    for date_key, val in raw_values.items():
        dk = str(date_key)
        if cpi_mode and not is_annual_or_feb(dk):
            continue
        year = extract_year(dk)

        if isinstance(val, dict):
            # e.g. {value: 9_033_840_000_000, metadata: ...}
            val = val.get("value", val)
        if isinstance(val, (int, float)):
            # For CPI with Feb dates, store by year of the Feb date.
            out[year] = val
    return out


def compute_pct_change(
    old: dict[str, float | int], new: dict[str, float | int]
) -> dict[str, float]:
    """Percent change = (new - old) / |old| * 100, for overlapping years."""
    pct: dict[str, float] = {}
    for yr in sorted(set(old) & set(new)):
        o = old[yr]
        n = new[yr]
        if o == 0:
            continue
        pct[yr] = round((n - o) / abs(o) * 100, 2)
    return pct


def parse_flat_yaml(content: str, cpi_mode: bool = False):
    """Parse a flat YAML file (description / values / metadata)."""
    data = yaml.safe_load(content)
    values = parse_values_dict(data.get("values", {}), cpi_mode=cpi_mode)
    meta = data.get("metadata", {})
    label = meta.get("label", "")
    unit = meta.get("unit", "")
    return values, label, unit


# ---------------------------------------------------------------------------
# Main extraction
# ---------------------------------------------------------------------------


def build_parameter_entry(
    key: str,
    old_content: str | None,
    new_content: str | None,
    category: str,
    label_override: str | None = None,
    cpi_mode: bool = False,
) -> dict:
    """Build a single parameter comparison dict."""
    old_vals: dict = {}
    new_vals: dict = {}
    label = label_override or ""
    unit = ""

    if old_content is not None:
        old_vals, lbl, u = parse_flat_yaml(old_content, cpi_mode=cpi_mode)
        if not label:
            label = lbl
        if not unit:
            unit = u

    if new_content is not None:
        new_vals, lbl, u = parse_flat_yaml(new_content, cpi_mode=cpi_mode)
        if not label:
            label = lbl
        if not unit:
            unit = u

    return {
        "label": label,
        "unit": unit,
        "category": category,
        "old": dict(sorted(old_vals.items())),
        "new": dict(sorted(new_vals.items())),
        "pct_change": dict(
            sorted(compute_pct_change(old_vals, new_vals).items())
        ),
    }


def extract_nested_subparams(
    old_content: str | None,
    new_content: str | None,
    category: str,
) -> dict[str, dict]:
    """Extract sub-parameters from the nested income_by_source.yaml."""
    SKIP_KEYS = {"description", "metadata"}

    old_data = yaml.safe_load(old_content) if old_content else {}
    new_data = yaml.safe_load(new_content) if new_content else {}

    # Gather top-level metadata for unit fallback.
    top_meta = old_data.get("metadata", {}) or new_data.get("metadata", {})
    top_unit = top_meta.get("unit", "")

    # Collect all sub-param keys from both commits.
    all_keys = sorted(
        (set(old_data.keys()) | set(new_data.keys())) - SKIP_KEYS
    )

    results: dict[str, dict] = {}
    for key in all_keys:
        old_sub = old_data.get(key, {})
        new_sub = new_data.get(key, {})

        # Sub-params can be structured two ways:
        #   A) {metadata: {label: ...}, values: {...}}
        #   B) {YYYY-MM-DD: val, ...}  (flat dict of date->value)
        def get_vals_and_label(sub):
            if sub is None:
                return {}, ""
            if isinstance(sub, dict) and "values" in sub:
                vals = parse_values_dict(sub["values"])
                lbl = sub.get("metadata", {}).get("label", "")
                return vals, lbl
            elif isinstance(sub, dict):
                # Flat format -- but might have a metadata key mixed in
                filtered = {
                    k: v
                    for k, v in sub.items()
                    if k not in ("metadata",) and not isinstance(v, dict)
                }
                # Also handle entries that are dicts with 'value' key
                for k, v in sub.items():
                    if isinstance(v, dict) and "value" in v:
                        filtered[k] = v["value"]
                vals = parse_values_dict(filtered)
                lbl = sub.get("metadata", {}).get("label", "") if isinstance(sub.get("metadata"), dict) else ""
                return vals, lbl
            return {}, ""

        old_vals, old_lbl = get_vals_and_label(old_sub)
        new_vals, new_lbl = get_vals_and_label(new_sub)
        label = old_lbl or new_lbl or key.replace("_", " ").title()

        results[key] = {
            "label": label,
            "unit": top_unit,
            "category": category,
            "old": dict(sorted(old_vals.items())),
            "new": dict(sorted(new_vals.items())),
            "pct_change": dict(
                sorted(compute_pct_change(old_vals, new_vals).items())
            ),
        }
    return results


def main():
    parameters: dict[str, dict] = {}

    # 1. Simple flat CBO calibration files.
    for key, (path, category, label_override) in SIMPLE_FILES.items():
        old_content = git_show(OLD_COMMIT, path)
        new_content = git_show(NEW_COMMIT, path)
        if old_content is None and new_content is None:
            print(f"WARNING: {key} not found at either commit, skipping.")
            continue
        parameters[key] = build_parameter_entry(
            key,
            old_content,
            new_content,
            category,
            label_override,
        )

    # 2. Nested income_by_source.yaml.
    old_nested = git_show(OLD_COMMIT, NESTED_FILE)
    new_nested = git_show(NEW_COMMIT, NESTED_FILE)
    nested_params = extract_nested_subparams(
        old_nested, new_nested, NESTED_CATEGORY
    )
    parameters.update(nested_params)

    # 3. CPI files.
    for key, (path, category) in CPI_FILES.items():
        old_content = git_show(OLD_COMMIT, path)
        new_content = git_show(NEW_COMMIT, path)
        if old_content is None and new_content is None:
            print(f"WARNING: {key} not found at either commit, skipping.")
            continue
        parameters[key] = build_parameter_entry(
            key,
            old_content,
            new_content,
            category,
            cpi_mode=True,
        )

    # Build output.
    output = {
        "metadata": {
            "old_baseline": OLD_LABEL,
            "new_baseline": NEW_LABEL,
            "source_url": SOURCE_URL,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
        "parameters": parameters,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {OUTPUT_PATH}  ({OUTPUT_PATH.stat().st_size:,} bytes)")
    print(f"Parameters: {len(parameters)}")
    for k, v in parameters.items():
        n_old = len(v["old"])
        n_new = len(v["new"])
        n_pct = len(v["pct_change"])
        print(
            f"  {k:40s}  category={v['category']:8s}  "
            f"old={n_old:2d}  new={n_new:2d}  pct_change={n_pct:2d}  "
            f"label={v['label']!r}"
        )


if __name__ == "__main__":
    main()
