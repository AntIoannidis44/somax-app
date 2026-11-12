"""Validate expansion/mb-sourced.json + expansion/mb-somax.json (golf / pilates / yoga-mobility).

Run:  python3 tools/validate_mb.py .        (from scripts/program-library)
Checks: JSON parses, required fields + order, enums, exercise keys/types, unique x-mb- ids (also vs
existing library files), basedOn ids exist (existing sourced-programs.json or mb-sourced.json), source
vs Somax field rules, near-duplicate exercise lists. Prints counts by sport x level.
"""
import json, sys, collections, glob, os
D = sys.argv[1] if len(sys.argv) > 1 else "."
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}
LV = ["beginner", "intermediate", "advanced"]
SP = {"golf", "pilates", "yoga-mobility"}
GO = {"strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"}
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
ORDER = ["id", "name", "series", "day", "daysInSeries", "category", "level", "sport", "goals", "duration", "daysPerWeek",
         "sessionMinutes", "equipment", "lifestyle", "whoItsFor", "howToRun", "description", "exercises", "credit",
         "sourceUrl", "sourceNote", "verified", "basedOn"]
REQ = [k for k in ORDER if k not in ("series", "day", "daysInSeries", "basedOn")]
errs = []
def chk(c, m):
    if not c: errs.append(m)
src = json.load(open(f"{D}/expansion/mb-sourced.json"))
som = json.load(open(f"{D}/expansion/mb-somax.json"))
existing_ids = set()
for fn in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    existing_ids |= {p["id"] for p in json.load(open(f"{D}/{fn}"))}
for fn in glob.glob(f"{D}/expansion/*.json"):
    if os.path.basename(fn).startswith("mb-"): continue
    try: existing_ids |= {p["id"] for p in json.load(open(fn)) if isinstance(p, dict) and "id" in p}
    except Exception: pass
valid_based = {p["id"] for p in json.load(open(f"{D}/sourced-programs.json"))} | {p["id"] for p in src}
ids = set()
for fn, P, somax in [("mb-sourced", src, False), ("mb-somax", som, True)]:
    for p in P:
        i = p.get("id")
        chk(i and i.startswith("x-mb-"), f"{i} prefix")
        chk(i not in ids, f"dup {i}"); ids.add(i)
        chk(i not in existing_ids, f"{i} collides with existing library id")
        for k in REQ: chk(k in p, f"{fn} {i} missing {k}")
        keys = [k for k in p]
        chk(keys == [k for k in ORDER if k in p], f"{i} field order {keys}")
        chk(set(keys) <= set(ORDER), f"{i} unknown keys {set(keys)-set(ORDER)}")
        chk(p["category"] in CAT, f"{i} cat"); chk(p["level"] in LV, f"{i} level"); chk(p["sport"] in SP, f"{i} sport")
        chk(p["goals"] and set(p["goals"]) <= GO, f"{i} goals {p['goals']}")
        chk(p["lifestyle"] and set(p["lifestyle"]) <= LS, f"{i} lifestyle {p['lifestyle']}")
        chk(len(p["howToRun"]) == 4 and all(isinstance(h, str) and h for h in p["howToRun"]), f"{i} howToRun")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} daysPerWeek")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} minutes/duration")
        chk(isinstance(p["equipment"], list) and p["equipment"], f"{i} equipment")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and isinstance(e.get("name"), str) and isinstance(e.get("sets"), int) and e["sets"] >= 1
                and isinstance(e.get("reps"), str) and e["reps"], f"{i} bad ex {e}")
        if "series" in p:
            chk(isinstance(p["day"], int) and isinstance(p["daysInSeries"], int) and 1 <= p["day"] <= p["daysInSeries"], f"{i} series fields")
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"), f"{i} somax fields")
            for b in p.get("basedOn", []): chk(b in valid_based, f"{i} basedOn unknown {b}")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and "basedOn" not in p and p["credit"] != "Somax", f"{i} src fields")
# series completeness
ser = collections.defaultdict(list)
for p in src + som:
    if "series" in p: ser[p["series"]].append(p)
for s, L in ser.items():
    n = L[0]["daysInSeries"]
    chk(sorted(p["day"] for p in L) == list(range(1, n + 1)), f"series {s} days {[p['day'] for p in L]}")
# near-duplicate check: exercise-name Jaccard within same sport (ignoring warm-up lines)
def names(p): return {e["name"].lower() for e in p["exercises"] if not e["name"].lower().startswith("warm-up")}
allp = src + som
for a in range(len(allp)):
    for b in range(a + 1, len(allp)):
        A, B = allp[a], allp[b]
        if A["sport"] != B["sport"] or A.get("series") and A.get("series") == B.get("series"): continue
        na, nb = names(A), names(B)
        j = len(na & nb) / max(1, len(na | nb))
        chk(j < 0.6, f"near-duplicate {A['id']} ~ {B['id']} ({j:.2f})")
for fn, P in [("mb-sourced", src), ("mb-somax", som)]:
    print(fn, len(P))
    c = collections.Counter((p["sport"], p["level"]) for p in P)
    for s in sorted(SP): print("  ", s, {l: c[(s, l)] for l in LV}, "total", sum(c[(s, l)] for l in LV))
print("ERRORS:", len(errs)); [print("  ", e) for e in errs]
sys.exit(1 if errs else 0)
