# usage: python3 run_w3.py vid:attempt [vid:attempt ...]   fixes read from fixes_w3.json {vid: "extra fix text"}
import json, os, sys, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prompts_w3 import build, QUEUE
from gen_w3 import gen_one
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "w3_attempts")
fixes = json.load(open(os.path.join(HERE, "fixes_w3.json"))) if os.path.exists(os.path.join(HERE, "fixes_w3.json")) else {}
def run(arg):
    vid, a = arg.split(":")
    text, _, _ = build(vid, fixes.get(vid, ""))
    out = os.path.join(OUT, f"{vid}_a{a}.png")
    ok, res, st = gen_one(QUEUE[vid]["gender"], text, out)
    if ok:
        os.system(f'sips -Z 900 "{out}" --out "{out[:-4]}_s.jpg" -s format jpeg >/dev/null 2>&1')
    return f"{vid}_a{a}: {res[:150]} (total ${st['total']})"
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(run, sys.argv[1:]): print(r, flush=True)
