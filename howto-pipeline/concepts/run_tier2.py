import sys, os, re, time
sys.path.insert(0, os.path.dirname(__file__))
from gen import gen_one, build_text, IMG_DIR, load_cost
from tier2_data import TIER2

def slug(name):
    s = name.lower()
    s = re.sub(r"[()/,']", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s + ".png"

def main(start, count):
    batch = TIER2[start:start+count]
    for entry in batch:
        pattern, gender, movement, setup, p1, p2, primary, secondary, conf, ubp, reasoning = entry
        state = load_cost()
        if state["total"] >= 36.0:
            print("BUDGET STOP before", pattern, movement); break
        text = build_text(movement, setup, p1, p2, primary, secondary)
        out = os.path.join(IMG_DIR, pattern, slug(movement))
        t0 = time.time()
        ok, result, state = gen_one(gender, text, out)
        print(f"{pattern:45s} {movement:35s} {gender:6s} ok={ok} total=${state['total']:.3f} n={state['count']} dt={time.time()-t0:.0f}s", flush=True)

if __name__ == "__main__":
    start = int(sys.argv[1]); count = int(sys.argv[2])
    main(start, count)
