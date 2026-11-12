"""Validate expansion/end-sourced.json and expansion/end-somax.json.
Run: python3 tools/validate_end.py .   (from scripts/program-library)
Checks: JSON parses, required fields, enums, exercise keys/types, unique x-end- ids (also vs the main library),
basedOn ids exist (main sourced + end-sourced), sport/level/goal counts, and near-duplicate names/exercise lists.
"""
import json, sys, collections, os

D = sys.argv[1]
CAT = {"ride", "swim", "fitness", "run", "other"}
LV = {"beginner", "intermediate", "advanced"}
SP = {"cycling", "swimming", "hybrid"}
GO = {"strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"}
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
REQ = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes", "equipment", "lifestyle",
       "whoItsFor", "howToRun", "description", "exercises", "credit", "sourceUrl", "sourceNote", "verified"]
errs = []


def chk(c, msg):
    if not c: errs.append(msg)


main_ids = set()
for f in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    main_ids |= {p["id"] for p in json.load(open(os.path.join(D, f)))}
main_sourced = {p["id"] for p in json.load(open(os.path.join(D, "sourced-programs.json")))}
src = json.load(open(os.path.join(D, "expansion/end-sourced.json")))
som = json.load(open(os.path.join(D, "expansion/end-somax.json")))
src_ids = {p["id"] for p in src}
ids = set()
for fn, P, somax in [("end-sourced", src, False), ("end-somax", som, True)]:
    for p in P:
        i = p.get("id")
        chk(i not in ids, f"dup {i}"); ids.add(i)
        chk(i.startswith("x-end-"), f"{i} prefix"); chk(i not in main_ids, f"{i} clashes with main library")
        for k in REQ: chk(k in p, f"{fn} {i} missing {k}")
        chk(p["category"] in CAT, f"{i} cat"); chk(p["level"] in LV, f"{i} level"); chk(p["sport"] in SP, f"{i} sport")
        chk(p["goals"] and set(p["goals"]) <= GO, f"{i} goals {p['goals']}"); chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle {p['lifestyle']}")
        chk(len(p["howToRun"]) == 4, f"{i} howToRun len {len(p['howToRun'])}")
        chk(isinstance(p["daysPerWeek"], int) and isinstance(p["sessionMinutes"], int), f"{i} ints")
        chk(p["duration"] == f"{p['sessionMinutes']} min", f"{i} duration mismatch")
        chk(isinstance(p["equipment"], list) and p["equipment"], f"{i} equipment")
        if "series" in p: chk(isinstance(p.get("day"), int) and isinstance(p.get("daysInSeries"), int), f"{i} series without day")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and isinstance(e.get("name"), str) and isinstance(e.get("sets"), int) and e["sets"] >= 1 and isinstance(e.get("reps"), str),
                f"{i} bad ex {e}")
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"), f"{i} somax fields")
            for b in p.get("basedOn", []): chk(b in main_sourced or b in src_ids, f"{i} basedOn unknown {b}")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and "basedOn" not in p, f"{i} src fields")

# near-duplicates: identical names or identical exercise-name lists
names = collections.Counter(p["name"].lower() for p in src + som)
chk(not [n for n, c in names.items() if c > 1], f"duplicate names {[n for n, c in names.items() if c > 1]}")
sig = collections.Counter(tuple((e["name"], e["sets"], e["reps"]) for e in p["exercises"]) for p in src + som)
chk(not [s for s, c in sig.items() if c > 1], "identical exercise lists found")

for fn, P in [("end-sourced", src), ("end-somax", som)]:
    print(fn, len(P))
    print("  sport x level", dict(sorted(collections.Counter((p["sport"], p["level"]) for p in P).items())))
    print("  category", dict(collections.Counter(p["category"] for p in P)))
print("ERRORS:", len(errs)); [print(" ", e) for e in errs]
sys.exit(1 if errs else 0)
