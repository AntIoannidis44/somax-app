"""Original Somax stretching / mobility / warm-up / cool-down programs, built from
(and citing via basedOn) scripts/program-library/expansion/mobility-sourced.json plus
general stretching-science knowledge (ACSM's 2-3x/week, 10-30s-building-to-60s hold
guidance; the dynamic-before/static-after split used throughout the sourced set).

One rule applied throughout, because it is a factual claim about the body:
dynamic stretches/movements are only ever placed in a *warm-up* (before activity);
static (held) stretches are only ever placed in a *cool-down* or standalone
*flexibility* session (after activity, or on their own). No exercise here is
described as "activating" or "working" a muscle the way a strength exercise would be -
a stretch's claim is "lengthens" or "eases tension in", never "works" or "activates".

Usage: python3 gen_mobility_somax.py <out.json>
"""
import json, sys

OUT = sys.argv[1]


def E(name, sets, reps):
    return {"name": name, "sets": sets, "reps": str(reps)}


P = []


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how,
        exercises, basedOn):
    d = dict(id=id, name=name, category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min",
              daysPerWeek=dpw, sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who,
              lifestyle=lifestyle, howToRun=how, exercises=exercises, credit="Somax", sourceUrl="",
              sourceNote="Original Somax program.", basedOn=basedOn, verified=False)
    P.append(d)


NHS = "x-mobility-nhs-flexibility-exercises"
CCF = "x-mobility-clevelandclinic-flexibility-stretches"
CCD = "x-mobility-clevelandclinic-dynamic-warmup"
CCS = "x-mobility-clevelandclinic-static-cooldown"

# =========================================================== BEGINNER (7)

add(
    id="x-mobility-somax-prework-dynamic-warmup-10",
    name="Somax Pre-Workout Dynamic Warm-Up 10",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=10, dpw=4,
    equipment=["bodyweight"],
    description="A brisk, moving warm-up that takes the major joints through their range before you train. No held stretches here - just movement.",
    who="Anyone about to lift, run or play sport who wants a quick general warm-up that isn't tied to one sport.",
    lifestyle=["home", "minimal-equipment", "time-efficient", "busy"],
    how=[
        "Do this right before training, as the first thing in your session.",
        "Keep moving the whole time - don't hold any position; the aim is range of motion, not a stretch.",
        "Start each drill slow and add a little speed once you feel warm.",
        "Go straight into your workout afterwards - save held stretches for your cool-down.",
    ],
    exercises=[
        E("Arm Circles", 1, "10 each way"),
        E("Torso Rotations", 1, "10 each way"),
        E("Leg Swings (front-to-back)", 1, "10/leg"),
        E("Walking Lunge with Reach", 1, "8/leg"),
        E("Hip Circles", 1, "10 each way"),
        E("High Knees", 1, "20s"),
    ],
    basedOn=[CCD],
)

add(
    id="x-mobility-somax-postwork-static-cooldown-10",
    name="Somax Post-Workout Static Cooldown 10",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=10, dpw=4,
    equipment=["mat"],
    description="Held stretches for the legs, chest and shoulders once your session is done, while the muscles are still warm.",
    who="Anyone finishing a workout who wants a simple, general cool-down that isn't tied to one sport.",
    lifestyle=["home", "minimal-equipment", "time-efficient"],
    how=[
        "Do this straight after training, once your breathing has settled.",
        "Hold each stretch for 30 seconds per side; don't bounce.",
        "Stretch to mild tension only - ease off if it becomes painful.",
        "This is the one time to hold stretches - save moving drills for your warm-up next time.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "30s/side"),
        E("Quad Stretch", 1, "30s/side"),
        E("Calf Stretch", 1, "30s/side"),
        E("Chest Doorway Stretch", 1, "30s"),
        E("Shoulder Cross-Body Stretch", 1, "30s/side"),
        E("Child's Pose", 1, "45s"),
    ],
    basedOn=[CCS],
)

add(
    id="x-mobility-somax-morning-mobility-flow-12",
    name="Somax Morning Mobility Flow 12",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=12, dpw=7,
    equipment=["bodyweight"],
    description="Gentle joint circles and a few short holds to loosen up first thing in the morning - not a workout warm-up, just a way to start the day moving.",
    who="Anyone who wakes up stiff and wants a short routine before breakfast, with no equipment or floor time required.",
    lifestyle=["home", "minimal-equipment", "time-efficient"],
    how=[
        "Do this most mornings, before or after a shower - whatever fits your routine.",
        "Move slowly and gently; your body is coming from rest, not from a workout.",
        "Hold the short stretches lightly - there's no need to push for range this early.",
        "Skip anything that feels sharp or painful and try again tomorrow.",
    ],
    exercises=[
        E("Neck Rotation", 3, "5s hold/side"),
        E("Cat-Cow", 1, "8 reps"),
        E("Hip Circles", 1, "10 each way"),
        E("Ankle Circles", 1, "10 each way"),
        E("Standing Side Bend", 3, "3s hold/side"),
        E("Gentle Standing Forward Reach", 1, "20s"),
    ],
    basedOn=[NHS, CCD],
)

add(
    id="x-mobility-somax-deskjob-hip-neck-relief-10",
    name="Somax Desk-Job Hip & Neck Relief 10",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=10, dpw=5,
    equipment=["chair"],
    description="Short static stretches for the neck and hips to undo a few hours of sitting - all from a desk chair.",
    who="Anyone at a desk all day who gets a tight neck or tight hips and wants something they can do without changing clothes.",
    lifestyle=["busy", "minimal-equipment", "time-efficient"],
    how=[
        "Do this once or twice during the workday - a good excuse for a short break.",
        "Hold each stretch gently; you should feel a mild pull, never pain.",
        "Stay seated and keep both feet on the floor unless a stretch says otherwise.",
        "If anything aggravates an existing neck or back problem, skip it and check with a physio.",
    ],
    exercises=[
        E("Neck Rotation", 3, "5s hold/side"),
        E("Neck Side Stretch", 3, "5s hold/side"),
        E("Seated Hip Stretch (ankle on knee)", 1, "30s/side"),
        E("Seated Figure-4 Glute Stretch", 1, "30s/side"),
        E("Seated Chest Opener", 1, "30s"),
        E("Standing Hip Flexor Stretch (chair-supported)", 1, "30s/side"),
    ],
    basedOn=[NHS, CCF],
)

add(
    id="x-mobility-somax-flexibility-builder-beginner-15",
    name="Somax General Flexibility Builder - Beginner 15",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=15, dpw=3,
    equipment=["mat"],
    description="A standalone flexibility session - not tied to a workout - that slowly lengthens the major muscle groups over a few weeks of regular holds.",
    who="Anyone who wants to get more flexible generally, with no workout required before or after this session.",
    lifestyle=["home", "minimal-equipment"],
    how=[
        "Do this 2-3 times a week, on its own or on a rest day.",
        "Warm up with a few minutes of easy walking or marching first - don't stretch stone cold.",
        "Hold each stretch 20-30 seconds to start; add time only once it feels easy, not painful.",
        "Progress is slow - expect weeks, not days, before you notice more range.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "20-30s/side"),
        E("Standing Quad Stretch", 1, "20-30s/side"),
        E("Calf Stretch", 1, "20-30s/side"),
        E("Piriformis Stretch", 1, "20-30s/side"),
        E("Child's Pose", 1, "30s"),
        E("Chest Doorway Stretch", 1, "20-30s"),
    ],
    basedOn=[CCF, NHS],
)

add(
    id="x-mobility-somax-older-adult-gentle-mobility-15",
    name="Somax Older-Adult Gentle Mobility 15",
    category="fitness", level="beginner", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=15, dpw=3,
    equipment=["chair"],
    description="Chair-based and wall-supported stretches for the neck, legs and sides - gentle enough to start from a low baseline.",
    who="Older adults, people returning after illness, or anyone who finds floor exercise difficult.",
    lifestyle=["older-adults", "home", "minimal-equipment"],
    how=[
        "Do this 2-3 times a week; a stable chair without wheels or arms works best.",
        "Build up the hold times and repetitions gradually over several weeks.",
        "Keep a hand on the chair or wall for balance during the standing stretches.",
        "Check with a GP or physio first if you have a joint replacement, osteoporosis or a balance condition.",
    ],
    exercises=[
        E("Seated Neck Rotation", 3, "5s hold/side"),
        E("Seated Marching", 1, "10/leg"),
        E("Seated Ankle Circles", 1, "10 each way"),
        E("Seated Side Bend", 3, "3s hold/side"),
        E("Standing Calf Stretch (chair support)", 1, "15-20s/side"),
        E("Seated Hamstring Reach", 1, "15-20s/side"),
    ],
    basedOn=[NHS, CCF],
)

add(
    id="x-mobility-somax-runner-prerun-dynamic-warmup-10",
    name="Somax Runner's Pre-Run Dynamic Warm-Up 10",
    category="fitness", level="beginner", sport="running", goals=["mobility", "endurance"],
    minutes=10, dpw=4,
    equipment=["bodyweight"],
    description="Dynamic leg-swing and lunge movements to prep the hips, hamstrings and calves before a run - no held stretches.",
    who="Runners who currently skip a warm-up, or who go straight from static stretches into running.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this right before you run, after a couple of minutes of easy walking.",
        "Keep every drill moving - don't hold a position, even if it feels like a stretch.",
        "Build from a small range to a full range over the 10 minutes.",
        "Start your run straight after - save the static calf and hamstring stretches for afterwards.",
    ],
    exercises=[
        E("Leg Swings (front-to-back)", 1, "10/leg"),
        E("Walking Lunge with Reach", 1, "8/leg"),
        E("High Knees", 1, "20s"),
        E("Butt Kicks", 1, "20s"),
        E("Ankle Circles", 1, "10 each way"),
        E("Easy Strides (building to run pace)", 1, "2 x 20m"),
    ],
    basedOn=[CCD],
)

# =========================================================== INTERMEDIATE (9)

add(
    id="x-mobility-somax-lifter-prelift-dynamic-warmup-10",
    name="Somax Lifter's Pre-Lift Dynamic Warm-Up 10",
    category="fitness", level="intermediate", sport="strength-training", goals=["mobility", "strength"],
    minutes=10, dpw=4,
    equipment=["bodyweight"],
    description="Dynamic drills for the shoulders, hips and ankles to get moving before you load a barbell - movement, not held stretches.",
    who="Lifters who want a quick general warm-up for the joints before their working sets, on top of (not instead of) ramp-up sets on the bar.",
    lifestyle=["full-gym", "time-efficient"],
    how=[
        "Do this before your first warm-up set on the bar, not instead of it.",
        "Move continuously through each drill - no held positions.",
        "Spend a little longer on whichever joint feels stiffest that day.",
        "Go into your ramp-up sets straight after; save static stretching for the end of the session.",
    ],
    exercises=[
        E("Arm Circles", 1, "10 each way"),
        E("Torso Rotations", 1, "10 each way"),
        E("Bodyweight Squat to Stand", 1, "10"),
        E("Walking Lunge with Reach", 1, "8/leg"),
        E("Hip Circles", 1, "10 each way"),
        E("Scapular Circles", 1, "10 each way"),
    ],
    basedOn=[CCD],
)

add(
    id="x-mobility-somax-lifter-postlift-static-cooldown-12",
    name="Somax Lifter's Post-Lift Static Cooldown 12",
    category="fitness", level="intermediate", sport="strength-training", goals=["mobility", "strength"],
    minutes=12, dpw=4,
    equipment=["mat"],
    description="Static holds for the hips, chest and shoulders after a lifting session, when those joints have just worked through a heavy range.",
    who="Lifters who finish a session and leave straight away - a few minutes to lengthen what just got loaded.",
    lifestyle=["full-gym", "time-efficient"],
    how=[
        "Do this after your last set, once the bar is away.",
        "Hold each stretch 30-45 seconds per side, breathing out as you ease into it.",
        "Favour whichever side or joint felt tightest in the session.",
        "Skip anything that feels like joint pain rather than a muscle stretch, and mention it to a physio if it persists.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "30-45s/side"),
        E("Quad Stretch", 1, "30-45s/side"),
        E("Hip Flexor Lunge Stretch", 1, "30-45s/side"),
        E("Chest Doorway Stretch", 1, "30-45s"),
        E("Overhead Triceps/Lat Stretch", 1, "30-45s/side"),
        E("Child's Pose", 1, "45s"),
    ],
    basedOn=[CCS],
)

add(
    id="x-mobility-somax-runner-postrun-static-stretch-12",
    name="Somax Runner's Post-Run Static Stretch 12",
    category="fitness", level="intermediate", sport="running", goals=["mobility", "endurance"],
    minutes=12, dpw=4,
    equipment=["mat"],
    description="Held stretches for the calves, hamstrings, hip flexors and IT band once you've finished running and are still warm.",
    who="Runners who want a slightly longer static routine than a quick calf stretch at the letterbox.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this within about 10 minutes of finishing your run, while you're still warm.",
        "Hold each stretch 30 seconds per side; breathe normally, don't bounce.",
        "Spend extra time on whichever leg feels tighter that day.",
        "This is the time for held stretches - save the dynamic drills for before your next run.",
    ],
    exercises=[
        E("Calf Stretch", 1, "30s/side"),
        E("Hamstring Stretch", 1, "30s/side"),
        E("Standing Quad Stretch", 1, "30s/side"),
        E("Hip Flexor Lunge Stretch", 1, "30s/side"),
        E("Figure-4 Glute Stretch", 1, "30s/side"),
        E("Standing IT Band Side Stretch", 1, "30s/side"),
    ],
    basedOn=[CCS, CCF],
)

add(
    id="x-mobility-somax-flexibility-builder-intermediate-20",
    name="Somax General Flexibility Builder - Intermediate 20",
    category="fitness", level="intermediate", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=20, dpw=3,
    equipment=["mat"],
    description="A longer standalone flexibility session with eight full-body holds, for anyone who has built a base with the beginner routine.",
    who="Anyone who has run the Somax Beginner Flexibility Builder for a few weeks and wants a longer, fuller session.",
    lifestyle=["home", "minimal-equipment"],
    how=[
        "Do this 2-3 times a week, on its own or after an easy cardio session.",
        "Warm up with 5 minutes of easy movement first if you're doing this cold.",
        "Hold each stretch 45-60 seconds; breathe out as you ease deeper, never force it.",
        "Progress by adding hold time or range, not by bouncing into the stretch.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "45-60s/side"),
        E("Standing Quad Stretch", 1, "45-60s/side"),
        E("Calf Stretch", 1, "45-60s/side"),
        E("Piriformis Stretch", 1, "45-60s/side"),
        E("Hip Flexor Lunge Stretch", 1, "45-60s/side"),
        E("Child's Pose", 1, "60s"),
        E("Chest Doorway Stretch", 1, "45-60s"),
        E("Shoulder Cross-Body Stretch", 1, "45-60s/side"),
    ],
    basedOn=[CCF],
)

add(
    id="x-mobility-somax-deskjob-full-reset-20",
    name="Somax Desk-Job Full Flexibility Reset 20",
    category="fitness", level="intermediate", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=20, dpw=3,
    equipment=["mat"],
    description="A longer, floor-based version of the desk-job relief routine for the end of the day, covering the neck, hips, chest and back.",
    who="Anyone who has outgrown the 10-minute chair version and has a bit more time and floor space at the end of the day.",
    lifestyle=["home", "minimal-equipment", "time-efficient"],
    how=[
        "Do this a few evenings a week, after work rather than during it.",
        "Hold each stretch 30-45 seconds; ease in slowly rather than dropping straight to full depth.",
        "Work through the list in order - it moves from the neck down to the hips and back.",
        "Stop and see a physio if a stretch reproduces sharp or shooting pain rather than a muscle pull.",
    ],
    exercises=[
        E("Neck Rotation", 3, "5s hold/side"),
        E("Neck Side Stretch", 3, "5s hold/side"),
        E("Chest Doorway Stretch", 1, "30-45s"),
        E("Seated Hip Stretch", 1, "30-45s/side"),
        E("Hip Flexor Lunge Stretch", 1, "30-45s/side"),
        E("Piriformis Stretch", 1, "30-45s/side"),
        E("Standing Forward Bend", 1, "30-45s"),
        E("Child's Pose", 1, "45s"),
    ],
    basedOn=[NHS, CCF],
)

add(
    id="x-mobility-somax-hip-opener-flow-20",
    name="Somax Hip-Opener Flexibility Flow 20",
    category="fitness", level="intermediate", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=20, dpw=2,
    equipment=["mat"],
    description="A hip-focused static flexibility session - front, side and rotational hip stretches held in sequence.",
    who="Anyone with tight hips from sitting, cycling or lifting who wants one session dedicated entirely to that area.",
    lifestyle=["home", "minimal-equipment"],
    how=[
        "Do this 1-2 times a week on its own, ideally after an easy walk or warm shower.",
        "Hold each stretch 45-60 seconds per side; both sides, even if one feels tighter.",
        "Breathe slowly throughout - tension drops more from breathing out than from forcing the range.",
        "Expect this to feel uncomfortable in a tight hip, but stop if you feel pinching in the joint itself.",
    ],
    exercises=[
        E("Hip Flexor Lunge Stretch", 1, "45-60s/side"),
        E("Piriformis Stretch", 1, "45-60s/side"),
        E("Figure-4 Glute Stretch", 1, "45-60s/side"),
        E("Seated Hip Stretch (ankle on knee)", 1, "45-60s/side"),
        E("Butterfly Inner-Thigh Stretch", 1, "45-60s"),
        E("Standing IT Band Side Stretch", 1, "45-60s/side"),
    ],
    basedOn=[CCF],
)

add(
    id="x-mobility-somax-teamsport-dynamic-warmup-12",
    name="Somax Dynamic Warm-Up for Team Sports 12",
    category="fitness", level="intermediate", sport="soccer", goals=["mobility", "sport-performance"],
    minutes=12, dpw=2,
    equipment=["bodyweight"],
    description="A faster-paced dynamic warm-up with change-of-direction drills, for field and court sports before training or a match.",
    who="Players in soccer, basketball, tennis or similar sports who want a general movement-prep routine to add before their sport-specific drills.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this before training or a match, after a couple of minutes of easy jogging.",
        "Build intensity through the 12 minutes - start controlled, finish close to game speed.",
        "Keep everything moving; this is not the time for held stretches.",
        "Follow straight into ball work or small-sided drills, not a static stretch.",
    ],
    exercises=[
        E("High Knees", 1, "20s"),
        E("Butt Kicks", 1, "20s"),
        E("Walking Lunge with Reach", 1, "8/leg"),
        E("Lateral Shuffle", 1, "2 x 10m"),
        E("Leg Swings (front-to-back and side-to-side)", 1, "10/leg each direction"),
        E("Build-Up Sprints", 1, "3 x 20m"),
    ],
    basedOn=[CCD],
)

add(
    id="x-mobility-somax-yin-long-hold-flexibility-25",
    name="Somax Yin-Style Long-Hold Flexibility 25",
    category="fitness", level="intermediate", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=25, dpw=2,
    equipment=["mat", "cushion"],
    description="A slow session of long-held, supported stretches - closer to yin yoga than a quick stretch, for building range over time.",
    who="Anyone who prefers a slow, few-positions session over a longer list of shorter stretches, and has 25 minutes to spare.",
    lifestyle=["home", "minimal-equipment"],
    how=[
        "Do this 1-2 times a week, on a rest day or evening when you're not short on time.",
        "Settle into each position and relax into it rather than actively pulling deeper.",
        "Use a cushion or folded towel under the knees or hips wherever that feels more comfortable.",
        "Come out of any hold slowly, and skip a position entirely if it ever feels like joint pain.",
    ],
    exercises=[
        E("Child's Pose", 1, "90-120s"),
        E("Seated Forward Fold", 1, "90-120s"),
        E("Butterfly Inner-Thigh Stretch", 1, "90-120s"),
        E("Figure-4 Glute Stretch (supported)", 1, "90-120s/side"),
        E("Reclined Twist", 1, "90-120s/side"),
    ],
    basedOn=[CCF, CCS],
)

add(
    id="x-mobility-somax-cyclist-postride-static-stretch-12",
    name="Somax Cyclist's Post-Ride Static Stretch 12",
    category="fitness", level="intermediate", sport="cycling", goals=["mobility", "endurance"],
    minutes=12, dpw=3,
    equipment=["mat"],
    description="Held stretches for the hip flexors, quads and lower back that spend the most time folded forward on a bike.",
    who="Cyclists who ride several times a week and want a short static routine for after the ride, not before it.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this straight after a ride, while you're still warm from pedalling.",
        "Hold each stretch 30-45 seconds per side.",
        "Pay extra attention to the hip flexors - they shorten the most from the riding position.",
        "Save any dynamic leg-swing or lunge drills for before you ride, not after.",
    ],
    exercises=[
        E("Hip Flexor Lunge Stretch", 1, "30-45s/side"),
        E("Standing Quad Stretch", 1, "30-45s/side"),
        E("Standing Forward Bend (lower back)", 1, "30-45s"),
        E("Hamstring Stretch", 1, "30-45s/side"),
        E("Chest Doorway Stretch", 1, "30-45s"),
        E("Child's Pose", 1, "45s"),
    ],
    basedOn=[CCS, CCF],
)

# =========================================================== ADVANCED (4)

add(
    id="x-mobility-somax-advanced-mobility-flexibility-circuit-30",
    name="Somax Advanced Mobility & Flexibility Circuit 30",
    category="fitness", level="advanced", sport="yoga-mobility", goals=["mobility", "general-fitness"],
    minutes=30, dpw=3,
    equipment=["mat", "strap"],
    description="A longer, deeper static-stretch circuit with ten holds for lifters, runners and athletes who have already built a flexibility base.",
    who="Experienced trainees who already do a short flexibility routine and want a longer, more thorough session once or twice a week.",
    lifestyle=["home", "minimal-equipment"],
    how=[
        "Do this 2-3 times a week, on a rest day or after an easy session.",
        "Hold each stretch 60-90 seconds; use a strap or towel on the hamstring and shoulder holds if you can't reach comfortably.",
        "Move slowly between positions - this is a long session, not a race through the list.",
        "Deepen a hold only after it stops feeling like a stretch at all, never by bouncing.",
    ],
    exercises=[
        E("Hamstring Stretch (strap-assisted)", 1, "60-90s/side"),
        E("Standing Quad Stretch", 1, "60-90s/side"),
        E("Calf Stretch", 1, "60-90s/side"),
        E("Hip Flexor Lunge Stretch", 1, "60-90s/side"),
        E("Piriformis Stretch", 1, "60-90s/side"),
        E("Figure-4 Glute Stretch", 1, "60-90s/side"),
        E("Butterfly Inner-Thigh Stretch", 1, "60-90s"),
        E("Child's Pose", 1, "90s"),
        E("Overhead Triceps/Lat Stretch (strap-assisted)", 1, "60-90s/side"),
        E("Chest Doorway Stretch", 1, "60-90s"),
    ],
    basedOn=[CCF, NHS],
)

add(
    id="x-mobility-somax-advanced-precompetition-dynamic-activation-15",
    name="Somax Advanced Pre-Competition Dynamic Activation 15",
    category="fitness", level="advanced", sport="hybrid", goals=["mobility", "sport-performance"],
    minutes=15, dpw=2,
    equipment=["bodyweight"],
    description="A higher-intensity dynamic warm-up - bounds, skips and shuffles - for competition day, building from easy movement to near full speed.",
    who="Competitive athletes who need a thorough movement-prep routine before a meet, match or race, beyond a casual jog and stretch.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this in the 15-20 minutes before you compete, after an easy aerobic warm-up.",
        "Build each drill from a controlled pace to close to competition speed by the last rep.",
        "Keep everything moving - there is no held stretch in this routine.",
        "Finish with your sport's own technical warm-up, then go straight into competition.",
    ],
    exercises=[
        E("High Knees", 1, "2 x 20m, building speed"),
        E("Butt Kicks", 1, "2 x 20m, building speed"),
        E("A-Skips", 1, "2 x 20m"),
        E("Walking Lunge with Reach", 1, "8/leg"),
        E("Lateral Shuffle", 1, "2 x 10m each way"),
        E("Build-Up Sprints", 1, "3 x 30m, up to 90%"),
    ],
    basedOn=[CCD],
)

add(
    id="x-mobility-somax-advanced-lifter-mobility-static-cooldown-20",
    name="Somax Advanced Lifter's Mobility & Static Cooldown 20",
    category="fitness", level="advanced", sport="strength-training", goals=["mobility", "strength"],
    minutes=20, dpw=4,
    equipment=["mat", "strap"],
    description="A longer post-session static routine for lifters training heavy several times a week, with extra shoulder and hip work.",
    who="Advanced lifters training 4+ days a week who want more than a quick cooldown stretch after heavy squat, bench or deadlift sessions.",
    lifestyle=["full-gym", "time-efficient"],
    how=[
        "Do this after your last set, every session, not just occasionally.",
        "Hold each stretch 45-60 seconds per side; use a strap on the shoulder stretch if your overhead range is limited.",
        "Prioritise whichever joint carried the most load that day - hips after squats/deadlifts, shoulders after bench/overhead work.",
        "Treat any joint pinching (rather than a muscle stretch) as a reason to stop and check with a physio.",
    ],
    exercises=[
        E("Hamstring Stretch", 1, "45-60s/side"),
        E("Hip Flexor Lunge Stretch", 1, "45-60s/side"),
        E("Piriformis Stretch", 1, "45-60s/side"),
        E("Standing Quad Stretch", 1, "45-60s/side"),
        E("Chest Doorway Stretch", 1, "45-60s"),
        E("Overhead Triceps/Lat Stretch (strap-assisted)", 1, "45-60s/side"),
        E("Shoulder Cross-Body Stretch", 1, "45-60s/side"),
        E("Child's Pose", 1, "60s"),
    ],
    basedOn=[CCS],
)

add(
    id="x-mobility-somax-advanced-runner-flexibility-static-cooldown-20",
    name="Somax Advanced Runner's Flexibility & Static Cooldown 20",
    category="fitness", level="advanced", sport="running", goals=["mobility", "endurance"],
    minutes=20, dpw=4,
    equipment=["mat"],
    description="A longer post-run static routine for runners doing high weekly mileage, covering the calves, hamstrings, hip flexors, glutes and IT band.",
    who="Runners training 4+ days a week or building toward a long race, who want a thorough cooldown rather than a quick calf stretch.",
    lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
    how=[
        "Do this after every run, within about 10 minutes of finishing.",
        "Hold each stretch 45-60 seconds per side; keep breathing slow and even.",
        "Spend extra time on whichever side feels tighter, especially after a hard or long run.",
        "Save any dynamic drills for your warm-up next time - this is a static, after-run session only.",
    ],
    exercises=[
        E("Calf Stretch", 1, "45-60s/side"),
        E("Hamstring Stretch", 1, "45-60s/side"),
        E("Standing Quad Stretch", 1, "45-60s/side"),
        E("Hip Flexor Lunge Stretch", 1, "45-60s/side"),
        E("Figure-4 Glute Stretch", 1, "45-60s/side"),
        E("Standing IT Band Side Stretch", 1, "45-60s/side"),
        E("Piriformis Stretch", 1, "45-60s/side"),
        E("Child's Pose", 1, "60s"),
    ],
    basedOn=[CCS, CCF],
)

with open(OUT, "w") as f:
    json.dump(P, f, indent=2)
    f.write("\n")
print(f"wrote {len(P)} somax entries to {OUT}")
