"""Validate expansion/gen-sourced.json + expansion/gen-somax.json.
Run: python3 validate_gen.py ..   (program-library folder)"""
import json, sys, collections, re, itertools
D = sys.argv[1]
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}; LV = {"beginner", "intermediate", "advanced"}
SP = {"hiit", "general"}
GO = {"strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"}
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
REQ = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes", "equipment",
       "lifestyle", "whoItsFor", "howToRun", "description", "exercises", "credit", "sourceUrl", "sourceNote", "verified"]
ALLOWED = set(REQ) | {"series", "day", "daysInSeries", "basedOn"}
errs = []
def chk(c, m):
    if not c: errs.append(m)
old = []
for f in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    old += json.load(open(f"{D}/{f}"))
old_ids = {p["id"] for p in old}
S = json.load(open(f"{D}/expansion/gen-sourced.json")); X = json.load(open(f"{D}/expansion/gen-somax.json"))
src_ids = {p["id"] for p in json.load(open(f"{D}/sourced-programs.json"))} | {p["id"] for p in S}
seen = set()
for fn, P, somax in [("gen-sourced", S, False), ("gen-somax", X, True)]:
    for p in P:
        i = p.get("id")
        chk(isinstance(i, str) and i.startswith("x-gen-"), f"{i} prefix")
        chk(i not in seen and i not in old_ids, f"dup id {i}"); seen.add(i)
        for k in REQ: chk(k in p, f"{i} missing {k}")
        chk(set(p) <= ALLOWED, f"{i} extra keys {set(p) - ALLOWED}")
        chk(p["category"] in CAT, f"{i} cat"); chk(p["level"] in LV, f"{i} level"); chk(p["sport"] in SP, f"{i} sport")
        chk(p["goals"] and set(p["goals"]) <= GO, f"{i} goals"); chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle")
        chk(len(p["howToRun"]) == 4, f"{i} howToRun len {len(p['howToRun'])}")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} dpw")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} minutes/duration")
        chk(p["equipment"] and all(isinstance(e, str) and e == e.lower() for e in p["equipment"]), f"{i} equipment")
        chk(p["exercises"], f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e) <= EXK and isinstance(e.get("name"), str) and isinstance(e.get("sets"), int) and e["sets"] >= 1
                and isinstance(e.get("reps"), str) and e["reps"], f"{i} bad ex {e}")
        if "series" in p:
            chk(isinstance(p.get("day"), int) and isinstance(p.get("daysInSeries"), int), f"{i} series fields")
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p.get("basedOn"), f"{i} somax fields")
            for b in p.get("basedOn", []): chk(b in src_ids, f"{i} basedOn unknown {b}")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True and "basedOn" not in p, f"{i} src fields")
        txt = json.dumps(p)
        for us in ["color", "program\"", " lbs", " miles", "favorite", "center "]:
            chk(us not in txt, f"{i} US spelling/unit '{us}'")
# series completeness
ser = collections.defaultdict(list)
for p in S + X:
    if "series" in p: ser[p["series"]].append(p)
for s, ps in ser.items():
    n = ps[0]["daysInSeries"]
    chk(sorted(p["day"] for p in ps) == list(range(1, n + 1)), f"series {s} days {sorted(p['day'] for p in ps)}")
# near-duplicate check (exercise-name Jaccard, ignoring warm-up/cool-down lines)
def names(p):
    return {re.sub(r"\(.*?\)", "", e["name"]).strip().lower() for e in p["exercises"]
            if not re.match(r"(warm-up|cool-down|rest|easy)", e["name"].lower())}
pool = old + S + X
dups = []
for a, b in itertools.combinations(pool, 2):
    if not (a["id"].startswith("x-gen-") or b["id"].startswith("x-gen-")): continue
    na, nb = names(a), names(b)
    if len(na) >= 3 and len(nb) >= 3:
        j = len(na & nb) / len(na | nb)
        if j >= 0.5 and not (a.get("series") and a.get("series") == b.get("series")):
            dups.append((round(j, 2), a["id"], b["id"]))
for fn, P in [("gen-sourced", S), ("gen-somax", X)]:
    print(fn, len(P))
    for key in ["sport", "level", "category"]:
        print("  ", key, dict(collections.Counter(p[key] for p in P)))
    print("   sport x level", dict(collections.Counter((p["sport"], p["level"]) for p in P)))
    print("   minutes", sorted(collections.Counter(p["sessionMinutes"] for p in P).items()))
    print("   lifestyle", dict(collections.Counter(l for p in P for l in p["lifestyle"])))
print("equipment tags:", sorted({e for p in S + X for e in p["equipment"]}))
print("near-duplicates (Jaccard>=0.5):", sorted(dups, reverse=True) or "none")
print("ERRORS:", len(errs)); [print("  ", e) for e in errs]
sys.exit(1 if errs else 0)
