import json,re,sys
sys.path.insert(0,'.')
from clusters import CLUSTERS
from manual import MANUAL
r=json.load(open('../build/audit_resolved.json'))
none=sorted(n for n,v in r.items() if v['idx'] is None and not v['link'])
NOIMG=json.load(open('noimg_rules.json'))
rows=[]
for n in none:
    if n in MANUAL:
        kind,_,what=MANUAL[n].partition(':'); how='individual decision'
    else:
        kind=None
        for c,p in CLUSTERS:
            if re.search(p,n,re.I): kind,what,how='NEW',c,'rule, reviewed by eye'; break
        if not kind:
            for k,p in NOIMG:
                if re.search(p,n,re.I): kind,what,how='NOIMG',k,'rule, reviewed by eye'; break
        if not kind: kind,what,how='UNCLASSIFIED','',''
    rows.append({"exercise":n,"decision":kind,"image_or_reason":what,"how":how,"programs":r[n]['programs']})
json.dump(rows,open('rows.json','w'),indent=1)
from collections import Counter
print(Counter(x['decision'] for x in rows)); print('planned images:',len({x['image_or_reason'] for x in rows if x['decision']=='NEW'}))
print('UNCLASSIFIED:',[x['exercise'] for x in rows if x['decision']=='UNCLASSIFIED'])
