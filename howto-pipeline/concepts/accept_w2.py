"""Worker 2 bookkeeping: python3 accept_w2.py accept <vid> <attempt#> "notes"  |  fail <vid> "reason" | note <vid> "notes" """
import json, os, shutil, sys
C = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(C, "results_w2.json")
P = os.path.join(C, "..", "images", "_pending")
q = json.load(open(os.path.join(C, "gen_queue_2.json")))
res = {e["variantId"]: e for e in json.load(open(R))} if os.path.exists(R) else {}
att = lambda v: len([f for f in os.listdir(os.path.join(C, "attempts_w2")) if f.startswith(v + "_a") and f.endswith(".png")]) if os.path.isdir(os.path.join(C, "attempts_w2")) else 0
cmd, vid = sys.argv[1], sys.argv[2]
if cmd == "accept":
    src = os.path.join(C, "attempts_w2", f"{vid}_a{sys.argv[3]}.png")
    dst = os.path.join(P, f"{vid}.png")
    assert not os.path.exists(dst), dst
    os.makedirs(P, exist_ok=True); shutil.copy2(src, dst)
    res[vid] = {"variantId": vid, "status": "accepted", "attempts": att(vid), "path": os.path.abspath(dst), "notes": sys.argv[4] if len(sys.argv) > 4 else ""}
elif cmd == "fail":
    res[vid] = {"variantId": vid, "status": "failed", "attempts": att(vid), "path": None, "notes": sys.argv[3]}
elif cmd == "skip":
    res[vid] = {"variantId": vid, "status": "skipped-remapped", "attempts": 0, "path": None, "notes": sys.argv[3]}
elif cmd == "nsb":
    res[vid] = {"variantId": vid, "status": "not-started-budget", "attempts": 0, "path": None, "notes": sys.argv[3] if len(sys.argv) > 3 else ""}
order = [i["variantId"] for i in q]
json.dump([res[v] for v in order if v in res], open(R, "w"), indent=1)
print(cmd, vid, res[vid]["status"], res[vid]["attempts"])
