"""Credited (verified) stretching / mobility / warm-up / cool-down programs.
Every entry was read from its sourceUrl on 2026-11-18. Only facts are recorded
(exercise names, hold times, reps/sides); all prose (description/whoItsFor/howToRun)
is our own. Where the source itself gives no hold time or rep count for a named
exercise, this is said plainly in sourceNote rather than inventing a precise figure
that looks sourced - same convention as the original research notes (e.g. the USTA
dynamic warm-up entry, where distances weren't given and "1 length" was used as a
placeholder and flagged).

Usage: python3 gen_mobility_sourced.py <out.json>
"""
import json, sys

OUT = sys.argv[1]


def E(name, sets, reps):
    return {"name": name, "sets": sets, "reps": str(reps)}


P = []


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how,
        exercises, credit, url, note):
    d = dict(id=id, name=name, category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min",
              daysPerWeek=dpw, sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who,
              lifestyle=lifestyle, howToRun=how, exercises=exercises, credit=credit, sourceUrl=url, sourceNote=note,
              verified=True)
    P.append(d)


# =========================================================== NHS flexibility exercises
add(
    id="x-mobility-nhs-flexibility-exercises",
    name="NHS Flexibility Exercises",
    category="fitness", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"],
    minutes=8, dpw=2,
    equipment=["bodyweight"],
    description="Four short NHS stretches for the neck, side and calves - gentle enough for anyone starting from a low baseline.",
    who="Anyone easing back into movement, including people who haven't exercised in a while, who want a short, safe flexibility routine with no equipment.",
    lifestyle=["home", "minimal-equipment", "time-efficient", "busy"],
    how=[
        "Do this at least twice a week; it pairs with the NHS strength and balance routines.",
        "Build up the repetitions gradually over time, and stop if you feel pain or become unwell.",
        "Wear loose, comfortable clothing and keep water handy.",
        "These are general exercises, not a treatment for a specific injury or condition - see a GP or physio if something hurts.",
    ],
    exercises=[
        E("Neck Rotation", 3, "5s hold/side"),
        E("Neck Stretch", 3, "5s hold/side"),
        E("Sideways Bend", 3, "2s hold/side"),
        E("Calf Stretch", 3, "each side (NHS gives no hold time for this one)"),
    ],
    credit="NHS",
    url="https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/flexibility-exercises/",
    note="Free NHS page, footer states \"© Crown copyright\" (other NHS entries already in this library cite the Open Government Licence v3.0 for nhs.uk content generally; this page's own footer names only Crown copyright). Exercise names, hold times and rep counts copied as given; the page states no hold time for the calf stretch, which is noted on that exercise rather than invented.",
)

# =========================================================== Cleveland Clinic - everyday flexibility stretches
add(
    id="x-mobility-clevelandclinic-flexibility-stretches",
    name="Cleveland Clinic Everyday Flexibility Stretches",
    category="fitness", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"],
    minutes=10, dpw=5,
    equipment=["mat"],
    description="Five static stretches for the hips, glutes, back, hamstrings and thighs from a Cleveland Clinic exercise physiologist.",
    who="Anyone wanting a short daily stretch routine for the lower body and back - no workout required beforehand.",
    lifestyle=["home", "minimal-equipment", "time-efficient"],
    how=[
        "Do about 10 minutes of stretching, up to twice a day, depending on how tight you feel.",
        "Start each hold at 20-30 seconds; as your mobility improves, build up to 1-2 minutes.",
        "Stretch to the point of mild tension, never pain - stop if anything hurts.",
        "Consistency matters more than any single session; work it into your day where you can.",
    ],
    exercises=[
        E("Piriformis Stretch", 1, "20-30s/side"),
        E("Child's Pose", 1, "20-30s"),
        E("Standing Forward Bend", 1, "20-30s"),
        E("Standing Quad Stretch", 1, "20-30s (source does not specify a side count)"),
        E("Seated Hip Stretch", 1, "20-30s (source does not specify a side count)"),
    ],
    credit="Christopher Travers, MS (Cleveland Clinic, Health Essentials)",
    url="https://health.clevelandclinic.org/flexibility-exercises-training-stretches",
    note="Free Cleveland Clinic Health Essentials article (dated Nov 11 2026 at read time), expert-reviewed by exercise physiologist Christopher Travers. No reuse terms stated on the page - same situation as the Cleveland Clinic Sun Salutation entry already in this library. Exercise names, technique cues (paraphrased) and the hold-time guidance are from the article; it names a side for the piriformis stretch only, which is reflected above.",
)

# =========================================================== Cleveland Clinic - dynamic warm-up (Dr Anne Rex)
add(
    id="x-mobility-clevelandclinic-dynamic-warmup",
    name="Cleveland Clinic Dynamic Warm-Up Movements",
    category="fitness", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"],
    minutes=6, dpw=4,
    equipment=["bodyweight"],
    description="Three dynamic, moving warm-up drills from a Cleveland Clinic osteopathic physician: a leg pendulum, walking lunges and hip circles.",
    who="Anyone about to train who wants to move the hips and legs through their range before the main session, rather than holding a stretch cold.",
    lifestyle=["home", "minimal-equipment", "time-efficient", "busy"],
    how=[
        "Do this right before training, not instead of your sport's own warm-up.",
        "Keep moving throughout - don't hold any position; the aim is to move each joint through its full range.",
        "Go through each drill at an easy pace first, then a little quicker as you warm up.",
        "Move straight into your workout afterwards - save held (static) stretches for after you train.",
    ],
    exercises=[
        E("Leg Pendulum Swing", 1, "10-12 swings/leg"),
        E("Walking Lunge", 1, "8/leg (source gives no rep count; used as a typical dose)"),
        E("Small Hip Circles", 1, "10 each way (source gives no rep count; used as a typical dose)"),
    ],
    credit="Dr. Anne Rex, DO (Cleveland Clinic, Health Essentials)",
    url="https://health.clevelandclinic.org/understanding-the-difference-between-dynamic-and-static-stretching",
    note="Free Cleveland Clinic Health Essentials article (dated 29 Aug 2024), expert-reviewed by Dr. Anne Rex. No reuse terms stated. The leg-pendulum rep count (10-12 swings/leg) is exactly as given; the article names walking lunges and small hip circles as examples but gives no rep count for either, so a typical dose is used and flagged here rather than presented as the source's own number - this is the same split used for the companion static-stretch entry from the same article.",
)

# =========================================================== Cleveland Clinic - static cool-down (Dr Anne Rex, same article)
add(
    id="x-mobility-clevelandclinic-static-cooldown",
    name="Cleveland Clinic Static Cool-Down Stretches",
    category="fitness", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"],
    minutes=8, dpw=4,
    equipment=["mat"],
    description="Five classic static stretches - hamstring, calf, triceps, quad and shoulder - from the same Cleveland Clinic article's cool-down section.",
    who="Anyone finishing a workout who wants a short, held-stretch routine while the muscles are still warm.",
    lifestyle=["home", "minimal-equipment", "time-efficient"],
    how=[
        "Do this after training, once your breathing has settled and your muscles are still warm.",
        "Hold each stretch for 30-90 seconds, breathing deeply throughout.",
        "This is the time for static holds - save fast, moving drills for your warm-up instead.",
        "Ease off if a stretch becomes painful; mild tension is normal, pain is not.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "30-90s"),
        E("Calf Stretch", 1, "30-90s"),
        E("Triceps Stretch", 1, "30-90s"),
        E("Quad Stretch", 1, "30-90s"),
        E("Shoulder Stretch", 1, "30-90s"),
    ],
    credit="Dr. Anne Rex, DO (Cleveland Clinic, Health Essentials)",
    url="https://health.clevelandclinic.org/understanding-the-difference-between-dynamic-and-static-stretching",
    note="Same article and expert as x-mobility-clevelandclinic-dynamic-warmup, split by the article's own dynamic-vs-static framing: this entry is its static, post-workout half. The 30-90 second hold range and all five stretch names are exactly as given; the article does not state a per-side count for any of the five, which is reflected by leaving reps as a plain hold time rather than inventing a side count.",
)

with open(OUT, "w") as f:
    json.dump(P, f, indent=2)
    f.write("\n")
print(f"wrote {len(P)} sourced entries to {OUT}")
