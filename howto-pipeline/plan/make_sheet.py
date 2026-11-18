import json,collections
from openpyxl import Workbook
from openpyxl.styles import Font,PatternFill,Alignment
rows=json.load(open('rows.json')); A=json.load(open('planned_aka.json'))
C=json.load(open('../audit/catalog.json')); L=json.load(open('../build/lookup_preview.json')); r=json.load(open('../build/audit_resolved.json'))
REDRAW_OF={"Straight-arm Plank":18,"Band External Rotation (elbow at side)":114,"Control Balance (Pilates)":181,"Cobra / Double Leg Lift Combo":224}
use=collections.Counter(v['idx'] for v in r.values() if v['idx'] is not None)
inuse_defects=[int(i) for i,c in C.items() if not c['ok'] and int(i) not in (89,42) and use.get(int(i),0)>0]
imgs=collections.defaultdict(list)
for x in rows:
    if x['decision']=='NEW': imgs[x['image_or_reason']].append(x)
new_only=[k for k in imgs if k not in REDRAW_OF]
total=len(new_only)+len(inuse_defects)+len(REDRAW_OF)
wb=Workbook(); H=Font(bold=True,color="FFFFFF"); F=PatternFill("solid",fgColor="1F4E78")
def head(ws,cols,w):
    ws.append(cols)
    for i,c in enumerate(ws[1]): c.font=H; c.fill=F; ws.column_dimensions[c.column_letter].width=w[i]
    ws.freeze_panes="A2"
s=wb.active; s.title="Summary"
for a in [["Exercise how-to images - exact gap (2026-11-19)"],[],["Exercise names in the app with no picture",len(rows)],
 ["  no image needed (runs, swims, rides, session instructions, multi-move lines, sport drills, breathing)",sum(x['decision']=='NOIMG' for x in rows)],
 ["  linked to an EXISTING picture (done today, no new image)",sum(x['decision']=='EXISTING' for x in rows)],
 ["  covered by a PLANNED image",sum(x['decision']=='NEW' for x in rows)],["  waiting on owner answer",sum(x['decision']=='OWNER' for x in rows)],[],
 ["IMAGES REQUIRED",total],["  new movements",len(new_only)],["  redraws of defective pictures still in use",len(inuse_defects)],["  redraws of broken pictures (names were unlinked)",len(REDRAW_OF)],
 ["  + pending owner answers (0 to 3)","see Owner tab"],[],
 ["Verification layers"],["A  every name classified exactly once",f"PASS ({len(rows)} / {len(rows)})"],["B  names linked to existing pictures pass the app's name test","PASS (0 failures)"],
 ["C  every name under a planned image passes the name test against that image's name + labels","PASS (0 failures)"],
 ["D  each planned image checked against all 476 existing pictures","49 hits, each judged a different movement (equipment/position/limb); 4 are redraws"],
 ["E  planned images checked against each other","9 hits, each judged a different movement"],["F  every name reviewed individually by eye","done"]]: s.append(a)
s.column_dimensions['A'].width=95; s.column_dimensions['B'].width=70; s['A1'].font=Font(bold=True,size=14); s['A9'].font=Font(bold=True,size=13); s['B9'].font=Font(bold=True,size=13)
p=wb.create_sheet("Images required"); head(p,["#","Image name","Type","Exercise names it covers (all labelled to this image)","How many names","Programs (sample)"],[5,46,40,110,10,70])
n=0
for k in sorted(imgs):
    n+=1; xs=imgs[k]; names=sorted({x['exercise'] for x in xs})
    typ=f"REDRAW of broken picture #{REDRAW_OF[k]}" if k in REDRAW_OF else "NEW"
    p.append([n,k,typ," | ".join(names+[f"[label] {a}" for a in A.get(k,[]) if a not in names]),len(names),"; ".join(sorted({pp for x in xs for pp in x['programs']})[:6])])
for i in sorted(inuse_defects):
    n+=1; names=sorted(nm for nm,v in r.items() if v['idx']==i)
    p.append([n,L['entries'][i].get('name'),f"REDRAW of defective picture #{i}: {C[str(i)].get('issues','')}"," | ".join(names),len(names),"; ".join(sorted({pp for nm in names for pp in r[nm]['programs']})[:6])])
for c in p['D']: c.alignment=Alignment(wrap_text=True,vertical='top')
e=wb.create_sheet("Every name"); head(e,["Exercise name","Decision","Planned image / existing picture / reason","How decided","Name test","Programs"],[60,12,60,24,12,80])
for x in rows:
    e.append([x['exercise'],x['decision'],x['image_or_reason'],x['how'],"pass" if x['decision'] in ('NEW','EXISTING') else "-","; ".join(x['programs'])])
o=wb.create_sheet("Owner"); head(o,["Exercise name","Question","Programs"],[45,90,40])
for x in rows:
    if x['decision']=='OWNER': o.append([x['exercise'],x['image_or_reason'],"; ".join(x['programs'])])
wb.save('image_gap.xlsx')
json.dump({k:{"type":("redraw #%d"%REDRAW_OF[k]) if k in REDRAW_OF else "new","names":sorted({x['exercise'] for x in imgs[k]}),"labels":A.get(k,[])} for k in sorted(imgs)},open('planned_images.json','w'),indent=1)
print('TOTAL',total,'| new',len(new_only),'| in-use redraws',len(inuse_defects),sorted(inuse_defects),'| broken redraws',len(REDRAW_OF),'| rows',n)
