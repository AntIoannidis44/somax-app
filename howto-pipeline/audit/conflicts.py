# Attribute cross-check: every name vs the catalog record of the picture it opens.
import json,re,sys
r=json.load(open('../build/audit_resolved.json')); C=json.load(open('catalog.json'))
EQ={'barbell':r'\bbarbell|\bbb\b','dumbbell':r'dumbbell|\bdb\b','kettlebell':r'kettlebell|\bkb\b','cable':r'\bcable','band':r'\bband|banded|resistance band|mini band|theraband','machine':r'machine|smith','ez bar':r'\bez[- ]?bar|cambered','trap bar':r'trap[- ]?bar|hex bar','medicine ball':r'med[- ]?ball|medicine[- ]?ball|wall ball','sandbag':r'sandbag','landmine':r'landmine','rings':r'\brings?\b','trx':r'\btrx|suspension','stability ball':r'swiss[- ]?ball|stability ball|physio ball|exercise ball','foam roller':r'foam roll','sled':r'\bsled','plate':r'\bplate\b','weight vest':r'vest','ankle weights':r'ankle weight','bodyweight':r'bodyweight|body weight|\bbw\b'}
ANG={'incline':r'\bincline','decline':r'\bdecline','flat':r'\bflat\b'}
POS={'seated':r'\bseated|\bsitting|\bsit\b|chair\b','standing':r'\bstanding','kneeling':r'(?<!half[- ])kneeling|\bon knees|from knees','half-kneeling':r'half[- ]kneeling','lying':r'\blying|supine|prone|on back|on your back'}
ONE={'one-arm':r'single[- ]arm|one[- ]arm|1[- ]arm|unilateral arm','one-leg':r'single[- ]leg|one[- ]leg|1[- ]leg|pistol'}
def has(pat,s): return re.search(pat,s,re.I) is not None
out=[]
for n,v in r.items():
    i=v['idx']
    if i is None: continue
    c=C.get(str(i))
    if not c: out.append((i,n,'no catalog record')); continue
    pic=(c['canon']+' | '+c['equip']+' | '+c['pos']).lower()
    alts=' or ' in n.lower() or '/' in n
    why=[]
    eqn=[k for k,p in EQ.items() if has(p,n)]
    if eqn and not alts:
        if not any(k==c['equip'] or has(EQ[k],pic) for k in eqn): why.append(f"equipment {eqn} vs picture {c['equip']}")
    for k,p in ANG.items():
        if has(p,n) and not has(p,pic):
            if k=='flat' and not any(has(ANG[x],pic) for x in ('incline','decline')): continue
            why.append(f"angle {k}")
    for k,p in POS.items():
        if has(p,n) and not alts:
            ok={'seated':['seated'],'standing':['standing','walking'],'kneeling':['kneeling','quadruped','half-kneeling'],'half-kneeling':['half-kneeling'],'lying':['supine','prone','side-lying','lying']}[k]
            if not any(o in c['pos'] or o in c['canon'].lower() for o in ok): why.append(f"position {k} vs {c['pos']}")
    for k,p in ONE.items():
        if has(p,n) and not alts and not has(p,pic) and c.get('arms' if k=='one-arm' else 'legs')!='one':
            why.append(k)
    if has(r'chin[- ]?up',n) and c.get('grip')=='overhand' and not alts: why.append('chin-up grip')
    if why: out.append((i,n,'; '.join(why)+'  ['+c['canon']+']'))
out.sort()
for x in out: print(x)
print(len(out),file=sys.stderr)
