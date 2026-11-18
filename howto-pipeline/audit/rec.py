# usage: python3 rec.py <<JSON {"cat":{idx:{...}}, "fix":{"Raw Name":"-"|target}}
import json,re,sys
norm=lambda n:re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",n.lower())).strip()
d=json.load(sys.stdin)
C=json.load(open('catalog.json')); C.update({str(k):v for k,v in d.get('cat',{}).items()}); json.dump(C,open('catalog.json','w'),indent=1)
F=json.load(open('../build/audit_fixes.json')); F.update({norm(k):v for k,v in d.get('fix',{}).items()}); json.dump(F,open('../build/audit_fixes.json','w'),indent=1)
print(len(C),len(F))
