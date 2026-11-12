"""Validate expansion/field-sourced.json + field-somax.json against the library schema.
Run: python3 tools/validate_field.py"""
import json, os, re, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CAT = {"gym", "fitness", "run", "walk", "ride", "swim", "other"}
LV = {"beginner", "intermediate", "advanced"}
SP = {"afl", "soccer", "basketball", "tennis", "boxing"}
GO = {"strength", "muscle", "fat-loss", "endurance", "mobility", "general-fitness", "sport-performance"}
LS = {"busy", "home", "travel", "minimal-equipment", "full-gym", "outdoor", "older-adults", "time-efficient"}
EXK = {"name", "sets", "reps", "weight", "distance", "group"}
SRC_ORDER = ["id", "name", "series", "day", "daysInSeries", "category", "level", "sport", "goals", "duration",
             "daysPerWeek", "sessionMinutes", "equipment", "description", "whoItsFor", "lifestyle", "howToRun",
             "exercises", "credit", "sourceUrl", "sourceNote", "verified"]
SMX_ORDER = ["id", "name", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes",
             "equipment", "description", "whoItsFor", "lifestyle", "howToRun", "exercises", "credit",
             "sourceUrl", "sourceNote", "basedOn", "verified"]
errs = []
def chk(c, m):
    if not c: errs.append(m)

existing = set()
for fn in ["sourced-programs.json", "somax-programs.json", "afl-programs.json"]:
    existing |= {p["id"] for p in json.load(open(os.path.join(D, fn)))}
src = json.load(open(os.path.join(D, "expansion", "field-sourced.json")))
smx = json.load(open(os.path.join(D, "expansion", "field-somax.json")))
allids = existing | {p["id"] for p in src} | {p["id"] for p in smx}
seen = set(); names = collections.Counter()
for fn, P, somax in [("field-sourced", src, False), ("field-somax", smx, True)]:
    for p in P:
        i = p.get("id", "?")
        chk(i.startswith("x-field-"), f"{i} prefix"); chk(i not in seen and i not in existing, f"dup id {i}"); seen.add(i)
        names[p["name"]] += 1
        order = [k for k in (SMX_ORDER if somax else SRC_ORDER) if k in p]
        chk(list(p.keys()) == order, f"{i} key order/extra keys {list(p.keys())}")
        for k in (SMX_ORDER if somax else [k for k in SRC_ORDER if k not in ("series", "day", "daysInSeries")]):
            chk(k in p, f"{i} missing {k}")
        if "series" in p: chk(isinstance(p["day"], int) and isinstance(p["daysInSeries"], int), f"{i} series ints")
        chk(p["category"] in CAT, f"{i} cat"); chk(p["level"] in LV, f"{i} level"); chk(p["sport"] in SP, f"{i} sport")
        chk(p["goals"] and set(p["goals"]) <= GO, f"{i} goals"); chk(set(p["lifestyle"]) <= LS, f"{i} lifestyle")
        chk(len(p["howToRun"]) == 4, f"{i} howToRun != 4")
        chk(isinstance(p["daysPerWeek"], int) and 1 <= p["daysPerWeek"] <= 7, f"{i} daysPerWeek")
        chk(isinstance(p["sessionMinutes"], int) and p["duration"] == f"{p['sessionMinutes']} min", f"{i} duration")
        chk(p["exercises"] and p["equipment"], f"{i} empty")
        for e in p["exercises"]:
            chk(set(e) <= EXK and isinstance(e.get("name"), str) and isinstance(e.get("sets"), int) and e["sets"] >= 1
                and isinstance(e.get("reps"), str), f"{i} bad ex {e}")
            for k in ("weight", "distance", "group"):
                if k in e: chk(isinstance(e[k], str) and e[k], f"{i} ex {k}")
        if somax:
            chk(p["credit"] == "Somax" and p["sourceUrl"] == "" and p["verified"] is False and p["basedOn"], f"{i} somax fields")
            for b in p["basedOn"]: chk(b in allids, f"{i} basedOn unknown {b}")
            chk(i not in p["basedOn"], f"{i} self-reference")
        else:
            chk(p["sourceUrl"].startswith("https://") and p["verified"] is True and p["credit"], f"{i} src fields")
        txt = json.dumps(p)
        chk(not re.search(r"\b(color|center|meters|favorite|program me)\b", txt), f"{i} US spelling?")
chk(all(v == 1 for v in names.values()), f"dup names {[n for n, v in names.items() if v > 1]}")
print("field-sourced", len(src), "field-somax", len(smx))
for lab, P in [("sourced", src), ("somax", smx)]:
    t = collections.Counter((p["sport"], p["level"]) for p in P)
    for s in sorted(SP):
        print(f"  {lab:7} {s:10}", {l: t[(s, l)] for l in ["beginner", "intermediate", "advanced"]}, "total", sum(t[(s, l)] for l in LV))
print("ERRORS:", len(errs)); [print("  ", e) for e in errs]
