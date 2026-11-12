"""Validate expansion/run-sourced.json + expansion/run-somax.json.

Checks: JSON parses, required fields, enums, exercise keys/types, howToRun has 4 items,
unique 'x-run-' ids (also unique against the existing library), Somax/sourced field rules,
basedOn ids exist (in run-sourced or the existing sourced/afl files), and flags
near-duplicate exercise lists. Usage (from the program-library folder):
    python3 tools/validate_run_expansion.py .
"""
import json, sys, collections

D = sys.argv[1]
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}
LV = {"beginner", "intermediate", "advanced"}
SP = {"running", "general"}
GO = {"strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"}
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
REQ = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "equipment", "description",
       "exercises", "credit", "sourceUrl", "sourceNote", "verified", "whoItsFor", "lifestyle", "howToRun", "sessionMinutes"]
errs = []


def chk(c, msg):
    if not c: errs.append(msg)


src = json.load(open(f"{D}/expansion/run-sourced.json"))
som = json.load(open(f"{D}/expansion/run-somax.json"))
existing = []
for fn in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    existing += json.load(open(f"{D}/{fn}"))
existing_ids = {p["id"] for p in existing}
basedon_pool = {p["id"] for p in src} | {p["id"] for p in json.load(open(f"{D}/sourced-programs.json"))} | \
               {p["id"] for p in json.load(open(f"{D}/afl-programs.json"))}

seen = set()
for fn, P, somax in [("run-sourced.json", src, False), ("run-somax.json", som, True)]:
    for p in P:
        i = p.get("id", "?")
        chk(i.startswith("x-run-"), f"{fn} {i} id prefix")
        chk(i not in seen and i not in existing_ids, f"{fn} {i} duplicate id")
        seen.add(i)
        for k in REQ:
            chk(k in p, f"{fn} {i} missing {k}")
        extra = set(p) - set(REQ) - {"series", "day", "daysInSeries", "basedOn"}
        chk(not extra, f"{fn} {i} unexpected keys {extra}")
        chk(p["category"] in CAT, f"{i} category {p['category']}")
        chk(p["level"] in LV, f"{i} level")
        chk(p["sport"] in SP, f"{i} sport {p['sport']}")
        chk(p["goals"] and set(p["goals"]) <= GO, f"{i} goals {p['goals']}")
        chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle {p['lifestyle']}")
        chk(isinstance(p["howToRun"], list) and len(p["howToRun"]) == 4, f"{i} howToRun must have 4 items")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} daysPerWeek")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} duration/sessionMinutes")
        chk(isinstance(p["equipment"], list) and p["equipment"], f"{i} equipment")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and isinstance(e.get("name"), str) and isinstance(e.get("sets"), int) and e["sets"] >= 1
                and isinstance(e.get("reps"), str), f"{i} bad exercise {e}")
            for k in ("weight", "distance", "group"):
                if k in e: chk(isinstance(e[k], str) and e[k], f"{i} bad {k} in {e}")
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"), f"{i} somax fields")
            for b in p.get("basedOn", []):
                chk(b in basedon_pool, f"{i} basedOn unknown {b}")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and p["credit"] != "Somax" and "basedOn" not in p,
                f"{i} sourced fields")

# near-duplicate check: identical exercise signature (name+sets+reps+distance) across the new + existing library
def sig(p):
    return tuple((e["name"].lower(), e["sets"], e["reps"], e.get("distance", "")) for e in p["exercises"])

sigs = collections.defaultdict(list)
for p in src + som + existing:
    sigs[sig(p)].append(p["id"])
for s, ids in sigs.items():
    if len(ids) > 1 and any(x.startswith("x-run-") for x in ids):
        errs.append(f"near-duplicate exercise list: {ids}")

ALL = src + som
print(f"run-sourced: {len(src)}  run-somax: {len(som)}  total new: {len(ALL)}")
for label, P in [("sourced", src), ("somax", som)]:
    c = collections.Counter((p["sport"], p["level"]) for p in P)
    print(f"  {label} by sport/level:", dict(sorted(c.items())))
print("  categories:", dict(collections.Counter(p["category"] for p in ALL)))
print("  goals:", dict(collections.Counter(g for p in ALL for g in p["goals"])))
print("  lifestyle:", dict(collections.Counter(l for p in ALL for l in p["lifestyle"])))
grid = collections.Counter((p["level"], g) for p in ALL for g in p["goals"])
print("  level x goal gaps (new files):", [(l, g) for l in LV for g in GO if grid[(l, g)] == 0])
run_total = sum(1 for p in ALL + existing if p["sport"] == "running")
gen_walk = sum(1 for p in ALL + existing if p["sport"] == "general" and p["category"] == "walk")
print(f"  library totals incl. existing: running={run_total}, general/walk={gen_walk}")
print("ERRORS:", len(errs))
for e in errs: print("  ", e)
sys.exit(1 if errs else 0)
