# usage: w1_res.py vid status attempts "notes" [srcimg]  -> updates results_w1.json, copies accepted image to _pending (no overwrite)
import json, sys, os, shutil
R = 'results_w1.json'; PEND = '../images/_pending'
res = json.load(open(R)) if os.path.exists(R) else {}
vid, status, att, notes = sys.argv[1:5]
path = None
if status == 'accepted':
    path = os.path.abspath(os.path.join(PEND, vid + '.png'))
    if os.path.exists(path): sys.exit('EXISTS ' + path)
    shutil.copy(sys.argv[5], path)
res[vid] = dict(variantId=vid, status=status, attempts=int(att), path=path, notes=notes)
json.dump(res, open(R, 'w'), indent=1); print(vid, status)
