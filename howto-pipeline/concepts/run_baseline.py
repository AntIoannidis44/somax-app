import sys, os, re, time
sys.path.insert(0, os.path.dirname(__file__))
from gen import gen_one, build_text, IMG_DIR, load_cost
from baseline_data import BASELINE

DONE_PATTERNS = {"squat_pattern", "adductor_groin_stretch", "flexion_pilates_mat", "horizontal_row", "horizontal_press"}

def slug(name):
    s = name.lower()
    s = re.sub(r"[()/,']", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s + ".png"

def main(start, count):
    todo = [b for b in BASELINE if b[0] not in DONE_PATTERNS]
    batch = todo[start:start+count]
    for entry in batch:
        pattern, gender, movement, setup, p1, p2, primary, secondary, conf, ubp = entry
        state = load_cost()
        if state["total"] >= 36.0:
            print("BUDGET STOP before", pattern); break
        text = build_text(movement, setup, p1, p2, primary, secondary)
        out = os.path.join(IMG_DIR, pattern, slug(movement))
        t0 = time.time()
        ok, result, state = gen_one(gender, text, out)
        print(f"{pattern:45s} {gender:6s} ok={ok} total=${state['total']:.3f} n={state['count']} dt={time.time()-t0:.0f}s", flush=True)

if __name__ == "__main__":
    start = int(sys.argv[1]); count = int(sys.argv[2])
    main(start, count)
