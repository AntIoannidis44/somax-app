import json, sys, collections
D = sys.argv[1]
CAT={"gym","fitness","run","walk","ride","swim","other"}; LV={"beginner","intermediate","advanced"}
SP={"strength-training","bodybuilding","powerlifting","running","cycling","swimming","calisthenics","hiit","pilates","yoga-mobility","soccer","afl","basketball","tennis","boxing","golf","hybrid","general"}
GO={"strength","muscle","fat-loss","endurance","mobility","general-fitness","sport-performance"}
LS={"busy","home","travel","minimal-equipment","full-gym","outdoor","older-adults","time-efficient"}
EXK={"name","sets","reps","weight","distance","group"}
errs=[]
def chk(c,msg):
    if not c: errs.append(msg)
for fn,somax in [("sourced-programs.json",False),("somax-programs.json",True)]:
    P=json.load(open(f"{D}/{fn}")); ids=set()
    for p in P:
        i=p.get("id"); chk(i not in ids,f"dup {i}"); ids.add(i)
        for k in ["id","name","category","level","sport","goals","duration","daysPerWeek","equipment","description","exercises","credit","sourceUrl","sourceNote","verified","whoItsFor","lifestyle","howToRun","sessionMinutes"]:
            chk(k in p,f"{fn} {i} missing {k}")
        chk(p["category"] in CAT,f"{i} cat"); chk(p["level"] in LV,f"{i} level"); chk(p["sport"] in SP,f"{i} sport")
        chk(p["goals"] and set(p["goals"])<=GO,f"{i} goals"); chk(set(p["lifestyle"])<=LS,f"{i} lifestyle {p['lifestyle']}")
        chk(2<=len(p["howToRun"])<=5,f"{i} howToRun len"); chk(isinstance(p["daysPerWeek"],int) and isinstance(p["sessionMinutes"],int),f"{i} ints")
        chk(p["exercises"],f"{i} no exercises")
        for e in p["exercises"]:
            chk(set(e)<=EXK and isinstance(e["name"],str) and isinstance(e["sets"],int) and e["sets"]>=1 and isinstance(e["reps"],str),f"{i} bad ex {e}")
        if somax:
            chk(p["credit"]=="Somax" and p["sourceUrl"]=="" and p["verified"] is False and p.get("basedOn"),f"{i} somax fields")
        else:
            chk(p["sourceUrl"].startswith("http") and p["verified"] is True,f"{i} src fields")
    if somax:
        src={p["id"] for p in json.load(open(f"{D}/sourced-programs.json"))}
        for p in P:
            for b in p["basedOn"]: chk(b in src,f"{p['id']} basedOn unknown {b}")
    print(fn,len(P))
    for key in ["level","sport","category"]:
        print(" ",key,dict(collections.Counter(p[key] for p in P)))
    print("  goals",dict(collections.Counter(g for p in P for g in p["goals"])))
    grid=collections.Counter((p["level"],g) for p in P for g in p["goals"])
    missing=[(l,g) for l in LV for g in GO if grid[(l,g)]==0]
    print("  level x goal gaps:",missing)
MT={"breakfast","lunch","dinner","snack"}; MG={"muscle","fat-loss","endurance","general-fitness","strength"}; DI={"vegetarian","vegan","high-protein","low-carb","dairy-free","gluten-free"}
for fn,somax in [("sourced-meals.json",False),("somax-meals.json",True)]:
    M=json.load(open(f"{D}/{fn}")); ids=set()
    for m in M:
        i=m["id"]; chk(i not in ids,f"dup {i}"); ids.add(i)
        for k in ["id","name","mealType","level","goals","diet","prepMinutes","servings","kcal","proteinG","carbsG","fatG","ingredients","steps","description","credit","sourceUrl","sourceNote","verified","whoItsFor","tips"]:
            chk(k in m,f"{fn} {i} missing {k}")
        chk(m["mealType"] in MT and m["level"] in LV and set(m["goals"])<=MG and set(m["diet"])<=DI,f"{i} enums")
        chk(all(isinstance(m[k],(int,float)) for k in ["prepMinutes","servings","kcal","proteinG","carbsG","fatG"]),f"{i} nums")
        chk(all(set(x)=={"name","amount"} for x in m["ingredients"]),f"{i} ings")
        chk(1<=len(m["tips"])<=3,f"{i} tips")
        if somax: chk(m["verified"] is False and m.get("basedOn"),f"{i} somax")
        else: chk(m["verified"] is True and m["sourceUrl"].startswith("http"),f"{i} src")
        # macro sanity: kcal vs 4/4/9 within 20%
        est=4*m["proteinG"]+4*m["carbsG"]+9*m["fatG"]
        if abs(est-m["kcal"])/m["kcal"]>0.2: print("  macro mismatch",i,m["kcal"],round(est))
    print(fn,len(M),dict(collections.Counter(m["mealType"] for m in M)),"diet",dict(collections.Counter(d for m in M for d in m["diet"])))
print("ERRORS:",len(errs)); [print(" ",e) for e in errs]
