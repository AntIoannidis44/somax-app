import json,sys
r=json.load(open('../build/audit_resolved.json'))
want=set(int(x) for x in sys.argv[1:])
by={}
for n,v in r.items():
    if v['idx'] in want: by.setdefault(v['idx'],[]).append(n)
for i in sorted(by): print(f"[{i}]", " | ".join(sorted(by[i]))); print()
