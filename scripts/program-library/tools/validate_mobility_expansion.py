"""Validate expansion/mobility-sourced.json + expansion/mobility-somax.json against the
library schema and every other program file already in the library.

Modelled on validate_gym_expansion.py, with two differences:
1. SP (the valid `sport` set) is the FULL set from tools/validate.py, not the four
   gym sports - this batch spans yoga-mobility, running, strength-training, cycling,
   soccer and hybrid.
2. The "existing ids" collision check loads every *.json file already sitting in
   scripts/program-library/ and scripts/program-library/expansion/ (not just
   sourced/somax/afl-programs.json), so this batch is checked against the whole
   library, including every other expansion group.

Usage: python3 validate_mobility_expansion.py <program-library dir>
"""
import glob, json, os, sys, collections

D = sys.argv[1]
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}
LV = ["beginner", "intermediate", "advanced"]
SP = {"strength-training", "bodybuilding", "powerlifting", "running", "cycling", "swimming", "calisthenics",
      "hiit", "pilates", "yoga-mobility", "soccer", "afl", "basketball", "tennis", "boxing", "golf", "hybrid",
      "general"}
GO = ["strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"]
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
REQ = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes", "equipment",
       "lifestyle", "whoItsFor", "howToRun", "description", "exercises", "credit", "sourceUrl", "sourceNote",
       "verified"]
ALLOWED = set(REQ) | {"series", "day", "daysInSeries", "basedOn"}

errs = []
chk = lambda c, m: c or errs.append(m)

THIS_BATCH = {"mobility-sourced.json", "mobility-somax.json"}

# Every existing program id in the library: every top-level *.json in the
# program-library folder, plus every *.json already in expansion/, excluding the
# two files this batch is about to write/overwrite.
existing = {}
for fn in sorted(glob.glob(f"{D}/*.json")):
    for p in json.load(open(fn)):
        existing[p["id"]] = os.path.relpath(fn, D)
for fn in sorted(glob.glob(f"{D}/expansion/*.json")):
    base = os.path.basename(fn)
    if base in THIS_BATCH:
        continue
    for p in json.load(open(fn)):
        if p["id"] in existing:
            continue  # already counted (shouldn't happen, but don't mask a real dup)
        existing[p["id"]] = os.path.relpath(fn, D)

src = json.load(open(f"{D}/expansion/mobility-sourced.json"))
som = json.load(open(f"{D}/expansion/mobility-somax.json"))
src_ids = {p["id"] for p in src}
ids = set()
names = set()
series = collections.defaultdict(list)

for fn, PP, somax in [("mobility-sourced", src, False), ("mobility-somax", som, True)]:
    for p in PP:
        i = p.get("id", "?")
        chk(i.startswith("x-mobility-"), f"{i} prefix")
        chk(i not in ids, f"dup id {i}")
        ids.add(i)
        chk(i not in existing, f"{i} collides with {existing.get(i)}")
        chk(p["name"] not in names, f"dup name {p['name']}")
        names.add(p["name"])
        for k in REQ:
            chk(k in p, f"{i} missing {k}")
        chk(set(p) <= ALLOWED, f"{i} extra keys {set(p) - ALLOWED}")
        chk(p["category"] in CAT, f"{i} cat {p.get('category')}")
        chk(p["level"] in LV, f"{i} level {p.get('level')}")
        chk(p["sport"] in SP, f"{i} sport {p.get('sport')}")
        chk(p["goals"] and set(p["goals"]) <= set(GO), f"{i} goals {p.get('goals')}")
        chk("mobility" in p["goals"], f"{i} goals missing 'mobility'")
        chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle {p.get('lifestyle')}")
        chk(len(p["howToRun"]) == 4, f"{i} howToRun != 4")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} dpw")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} duration")
        chk(p["equipment"] and all(isinstance(x, str) and x for x in p["equipment"]), f"{i} equipment")
        for k in ["whoItsFor", "description", "name", "credit", "sourceNote"]:
            chk(isinstance(p[k], str) and p[k].strip(), f"{i} empty {k}")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and {"name", "sets", "reps"} <= set(e), f"{i} ex keys {e}")
            chk(isinstance(e["sets"], int) and e["sets"] >= 1 and isinstance(e["reps"], str) and e["reps"],
                f"{i} ex vals {e}")
        if "series" in p:
            chk(isinstance(p.get("day"), int) and isinstance(p.get("daysInSeries"), int), f"{i} series fields")
            series[p["series"]].append(p)
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"),
                f"{i} somax fields")
            for b in p.get("basedOn", []):
                chk(b in src_ids, f"{i} basedOn {b} not in mobility-sourced.json")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and "basedOn" not in p,
                f"{i} src fields")

for s, L in series.items():
    days = sorted(p["day"] for p in L)
    chk(days == list(range(1, len(L) + 1)) and all(p["daysInSeries"] == len(L) for p in L), f"series {s} days {days}")

print("sourced", len(src), "somax", len(som), "total", len(src) + len(som))
for lab, PP in [("SOURCED", src), ("SOMAX", som)]:
    c = collections.Counter((p["sport"], p["level"]) for p in PP)
    print(lab)
    for sp in sorted({p["sport"] for p in PP}):
        print(f"  {sp:18}", {l: c[(sp, l)] for l in LV}, "=", sum(c[(sp, l)] for l in LV))

print("ERRORS:", len(errs))
for e in errs:
    print(" ", e)
sys.exit(1 if errs else 0)
