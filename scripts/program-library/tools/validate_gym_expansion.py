"""Validate expansion/gym-sourced.json + gym-somax.json against the library schema and existing files.
Usage: python3 validate_gym_expansion.py <program-library dir>
"""
import json, sys, collections

D = sys.argv[1]
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}
LV = ["beginner", "intermediate", "advanced"]
SP = {"strength-training", "bodybuilding", "powerlifting", "calisthenics"}
GO = ["strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"]
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
REQ = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes", "equipment", "lifestyle",
       "whoItsFor", "howToRun", "description", "exercises", "credit", "sourceUrl", "sourceNote", "verified"]
ALLOWED = set(REQ) | {"series", "day", "daysInSeries", "basedOn"}

errs = []
chk = lambda c, m: c or errs.append(m)

existing = {}
for fn in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    for p in json.load(open(f"{D}/{fn}")):
        existing[p["id"]] = fn
src = json.load(open(f"{D}/expansion/gym-sourced.json"))
som = json.load(open(f"{D}/expansion/gym-somax.json"))
known = set(existing) | {p["id"] for p in src}
ids = set(); names = set(); series = collections.defaultdict(list)

for fn, P, somax in [("gym-sourced", src, False), ("gym-somax", som, True)]:
    for p in P:
        i = p.get("id", "?")
        chk(i.startswith("x-gym-"), f"{i} prefix")
        chk(i not in ids, f"dup id {i}"); ids.add(i)
        chk(i not in existing, f"{i} collides with {existing.get(i)}")
        chk(p["name"] not in names, f"dup name {p['name']}"); names.add(p["name"])
        for k in REQ: chk(k in p, f"{i} missing {k}")
        chk(set(p) <= ALLOWED, f"{i} extra keys {set(p) - ALLOWED}")
        chk(p["category"] in CAT, f"{i} cat"); chk(p["level"] in LV, f"{i} level"); chk(p["sport"] in SP, f"{i} sport")
        chk(p["goals"] and set(p["goals"]) <= set(GO), f"{i} goals"); chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle")
        chk(len(p["howToRun"]) == 4, f"{i} howToRun != 4")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} dpw")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} duration")
        chk(p["equipment"] and all(isinstance(x, str) and x for x in p["equipment"]), f"{i} equipment")
        for k in ["whoItsFor", "description", "name", "credit", "sourceNote"]: chk(isinstance(p[k], str) and p[k].strip(), f"{i} empty {k}")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and {"name", "sets", "reps"} <= set(e), f"{i} ex keys {e}")
            chk(isinstance(e["sets"], int) and e["sets"] >= 1 and isinstance(e["reps"], str) and e["reps"], f"{i} ex vals {e}")
        if "series" in p:
            chk(isinstance(p.get("day"), int) and isinstance(p.get("daysInSeries"), int), f"{i} series fields")
            series[p["series"]].append(p)
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"), f"{i} somax fields")
            for b in p.get("basedOn", []): chk(b in known, f"{i} basedOn unknown {b}")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and "basedOn" not in p, f"{i} src fields")
for s, L in series.items():
    days = sorted(p["day"] for p in L)
    chk(days == list(range(1, len(L) + 1)) and all(p["daysInSeries"] == len(L) for p in L), f"series {s} days {days}")

print("sourced", len(src), "somax", len(som), "total", len(src) + len(som))
for lab, P in [("SOURCED", src), ("SOMAX", som)]:
    c = collections.Counter((p["sport"], p["level"]) for p in P)
    print(lab)
    for sp in sorted(SP): print(f"  {sp:18}", {l: c[(sp, l)] for l in LV}, "=", sum(c[(sp, l)] for l in LV))
print("ERRORS:", len(errs)); [print(" ", e) for e in errs]
sys.exit(1 if errs else 0)
