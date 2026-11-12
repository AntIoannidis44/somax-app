"""Generate expansion/mb-sourced.json: credited golf / pilates / yoga-mobility programs.

Every entry here was fetched and read in full on 2026-11-13 (see expansion/mb-notes.md for the
source audit, licence checks and the sources that were skipped). Only exercise names, sets,
reps/holds and structure are recorded; all prose is Somax's own paraphrase.

Run:  python3 tools/gen_mb_sourced.py expansion/mb-sourced.json
"""
import json
import sys

OUT = sys.argv[1]
P = []


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight:
        d["weight"] = weight
    if distance:
        d["distance"] = distance
    if group:
        d["group"] = group
    return d


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, lifestyle, who, how, description,
        exercises, credit, url, note, series=None, day=None, days=None):
    d = {"id": id, "name": name}
    if series:
        d.update(series=series, day=day, daysInSeries=days)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min",
             daysPerWeek=dpw, sessionMinutes=minutes, equipment=equipment, lifestyle=lifestyle,
             whoItsFor=who, howToRun=how, description=description, exercises=exercises,
             credit=credit, sourceUrl=url, sourceNote=note, verified=True)
    P.append(d)


# =========================================================================== GOLF

add("x-mb-gripp-golf-warm-up", "GRIPP Golf Injury-Prevention Warm-up", "other", "beginner", "golf",
    ["mobility", "sport-performance"], 10, 2, ["golf club"],
    ["outdoor", "older-adults", "time-efficient", "minimal-equipment", "busy"],
    "Golfers aged 45+ (and anyone else) who want a short, club-only warm-up they can do beside the first tee without mats or bands.",
    ["Do it before every round or practice session - the trial asked players to use it at least twice a week.",
     "Use a short iron (7-9 iron) as your prop and move slowly and with control.",
     "Ten reps of each move on each side; the whole thing takes 5-10 minutes.",
     "Stop any exercise that hurts. The trial was designed to test injury prevention, so don't treat it as proven protection."],
    "Six standing exercises with a short iron, built by Dutch physios, sports doctors and the Dutch Golf Federation for an injury-prevention trial in golfers over 45.",
    [E("Leg Swing (club at your side for support)", 1, "10/side"),
     E("Arms in the Air (club overhead, arms straight)", 1, "10"),
     E("Arm Rotations (club vertical, rotate each way)", 1, "10/hand"),
     E("Sidewards Bending (club overhead)", 1, "10/side"),
     E("Upper-back Rotation in golf stance", 1, "10/side"),
     E("Powerful Rotation (club low to high diagonal)", 1, "10/side")],
    "Gladdines S, von Gerhardt AL, Verhagen E, Beumer A, Eygendaal D (Amphia Hospital, Amsterdam UMC, Erasmus MC, Dutch Golf Federation) - BMC Sports Science, Medicine and Rehabilitation 2022",
    "https://doi.org/10.1186/s13102-022-00511-4",
    "Open-access trial protocol, CC BY 4.0. Exercises and the '10 times each side, short iron' rule are from Figure 3 of the paper. This is the protocol paper; the trial's injury results are not reported in it.")

add("x-mb-bliss-bodyweight-potentiated-golf-warm-up", "Bodyweight-Potentiated Golf Warm-up", "other", "intermediate", "golf",
    ["sport-performance", "mobility"], 15, 3, ["bands", "golf club", "golf balls"],
    ["outdoor", "time-efficient"],
    "Competent golfers who warm up on the range and want a research-tested routine that finishes with jumps and plyo push-ups to wake up speed before driving.",
    ["Use it before range sessions or rounds where you want to swing hard.",
     "Work through the four blocks in order: raise (skipping), activate and mobilise, golf shots from wedge to driver, then the jumps and push-ups.",
     "Rest about one minute after the last jump set before hitting your first full-effort drive.",
     "Tested on 13 skilled male college golfers; it raised clubhead speed and carry in that study, but results in other golfers may differ."],
    "The standardised RAMP warm-up from a St Mary's University study, with the bodyweight potentiation block (countermovement jumps and plyometric push-ups) that increased clubhead speed versus a normal warm-up.",
    [E("Skipping", 1, "2 min"),
     E("Leg Swings", 1, "10/side"),
     E("Band Shoulder External Rotations", 2, "10/side"),
     E("Single-leg Kneeling Kickbacks", 1, "10/side"),
     E("Lunges with Rotation", 1, "10/side"),
     E("Overhead Squat with golf club", 1, "12"),
     E("Sand-wedge Pitch Shots", 1, "3"),
     E("Sand-wedge Full Shots", 1, "3"),
     E("7-iron Full Shots", 1, "2"),
     E("Driver Full Shots", 1, "2"),
     E("Countermovement Jump", 3, "10", group="A"),
     E("Plyometric Push-ups", 2, "10", group="A")],
    "Bliss A, Livingstone H, Tallent J (St Mary's University, Twickenham) - Journal of Sport and Exercise Science 2021",
    "https://jses.net/wp-content/uploads/2021/02/Bliss-et-al.-2021.pdf",
    "Free-to-read journal article (Sport and Exercise Science New Zealand). Protocol from Table 1 (standardised warm-up + BWP condition). No licence or reuse restriction stated on the PDF or article page.")

UTAH_WU = [E("Warm-up: Cat-Cow", 1, "10"),
           E("Warm-up: World's Greatest Stretch", 1, "5/side"),
           E("Warm-up: Shoulder Circles", 1, "15 forward + 15 back"),
           E("Warm-up: Bodyweight Squats", 1, "15"),
           E("Warm-up: Arm Wings with Torso Rotations", 1, "15s")]
UTAH_CREDIT = "Shane Thoreson, DPT, Golf Clinic physical therapist (University of Utah Health)"
UTAH_URL = "https://healthcare.utah.edu/healthfeed/2025/07/your-strength-training-guide-better-golf-game"
UTAH_NOTE = ("Free article on healthcare.utah.edu. Exercise names, sets and reps from the article; where a block gives no "
             "set count (mobility, balance) one set is stored, and session length is a Somax estimate. No reuse restriction found in the linked university disclaimer.")
UTAH_WHO = "Amateur golfers of any handicap who want a simple three-day strength, mobility and power plan with dumbbells, a band and a med ball."
UTAH_HOW = ["Three days a week (e.g. Mon/Wed/Fri), doing Day 1, 2 and 3 in order.",
            "Start every session with the 5-10 minute warm-up.",
            "Strength: 3 sets of 8-10 with a weight that leaves 1-2 reps in reserve; power: 2-3 sets of 5-8 done fast with full rest.",
            "Progress by adding weight, reps or a set when it feels easy; keep it up 2-3 times a week through the season."]

add("x-mb-utah-golf-day-1-strength-mobility", "Utah Health Golf Program - Day 1 Strength & Mobility", "gym", "beginner", "golf",
    ["strength", "mobility", "sport-performance"], 45, 3, ["dumbbells", "mat"], ["full-gym", "home"],
    UTAH_WHO, UTAH_HOW,
    "Full-body dumbbell strength plus hip and thoracic-spine mobility - the two areas the clinic says golfers most need for rotation.",
    UTAH_WU + [E("Goblet Squat", 3, "8-10"), E("Dumbbell Romanian Deadlift", 3, "8-10"),
               E("Push-ups (knee or full)", 3, "8-10"), E("Bent-over Dumbbell Row", 3, "8-10"),
               E("Plank Hold", 3, "30-60s"),
               E("Open Books (T-spine rotation)", 1, "10/side"), E("90/90 Hip Stretch", 1, "30s/side"),
               E("Standing Hip CARs", 1, "5 slow/side")],
    UTAH_CREDIT, UTAH_URL, UTAH_NOTE, series="University of Utah Health Golf Program", day=1, days=3)

add("x-mb-utah-golf-day-2-mobility-power", "Utah Health Golf Program - Day 2 Mobility & Power", "gym", "beginner", "golf",
    ["sport-performance", "mobility"], 40, 3, ["medicine ball", "bands", "foam roller"], ["full-gym", "home"],
    UTAH_WHO, UTAH_HOW,
    "Rotational and lower-body power done fast, then mobility for the upper back, hips, shoulders and ankles, with optional easy cardio.",
    UTAH_WU + [E("Medicine Ball Rotational Slams", 2, "5-8"), E("Jump Squats or Broad Jumps", 2, "5-8"),
               E("Cable or Band Rotations (fast)", 2, "5-8"),
               E("T-spine Extension over Foam Roller", 1, "10"), E("Lunge with Rotation", 1, "5/side"),
               E("Shoulder Wall Slides", 1, "10"), E("Ankle Rockers", 1, "15/side"),
               E("Optional: light cycling or swimming", 1, "20 min")],
    UTAH_CREDIT, UTAH_URL, UTAH_NOTE, series="University of Utah Health Golf Program", day=2, days=3)

add("x-mb-utah-golf-day-3-strength-balance", "Utah Health Golf Program - Day 3 Strength & Balance", "gym", "beginner", "golf",
    ["strength", "sport-performance"], 45, 3, ["dumbbells", "bands", "mat"], ["full-gym", "home"],
    UTAH_WHO, UTAH_HOW,
    "Single-leg strength, overhead pressing and anti-rotation core, plus eyes-closed balance for a steadier weight shift.",
    UTAH_WU + [E("Split Squat or Reverse Lunge", 3, "8-10"), E("Single-leg Romanian Deadlift", 3, "8-10"),
               E("Overhead Dumbbell Press", 3, "8-10"), E("Bird-Dog (3s hold)", 3, "10/side"),
               E("Single-leg Balance (eyes closed)", 1, "20s/side"), E("Side Plank", 1, "20-30s/side"),
               E("Standing Pallof Press with band", 1, "10/side"),
               E("Optional cool-down: Child's Pose + Reach, Supine Twist, Diaphragmatic Breathing", 1, "5 min")],
    UTAH_CREDIT, UTAH_URL, UTAH_NOTE, series="University of Utah Health Golf Program", day=3, days=3)

PEERJ_CREDIT = "Redondo JC, de Benito AM, Izquierdo JM, Garcia-Ramos A - PeerJ 2020"
PEERJ_URL = "https://doi.org/10.7717/peerj.9963"
PEERJ_NOTE = ("Open-access study, CC BY 4.0. Loads and sets from Table 2 (three six-week phases); the 10-min warm-up and "
              "30-min individual functional block are described in the methods but not itemised.")
PEERJ_WHO = "Experienced, well-trained golfers (the study used elite 16-year-old male players) who already lift and want a periodised in-season strength-to-power block."
PEERJ_HOW = ["Two sessions a week (the study used Wednesday and Friday) for six weeks per phase: Phase 1, then 2, then 3.",
             "In the study, sessions done before golf practice gave better jump, ball-speed and rotational-power results than the same sessions after practice.",
             "Percentages are of your one-rep max; rest 4 minutes between sets.",
             "Only for lifters with good technique - get coached if %1RM training is new to you."]

add("x-mb-peerj-youth-golf-phase-1-max-strength", "Concurrent Training for Golfers - Phase 1 Max Strength", "gym", "advanced", "golf",
    ["strength", "sport-performance"], 65, 2, ["barbell", "bench", "machines", "cables"], ["full-gym"],
    PEERJ_WHO, PEERJ_HOW,
    "Heavy 3x5 at 80% across five machine and free-weight lifts after a golf-specific movement block.",
    [E("Standardised warm-up", 1, "10 min"), E("Golf-specific functional movement work", 1, "30 min"),
     E("Horizontal Bench Press", 3, "5", weight="80% 1RM, 4 min rest"), E("Seated Row Machine", 3, "5", weight="80% 1RM, 4 min rest"),
     E("Leg Press Machine", 3, "5", weight="80% 1RM, 4 min rest"), E("Seated Calf Extension", 3, "5", weight="80% 1RM, 4 min rest"),
     E("Triceps Cable Push-down", 3, "5", weight="80% 1RM, 4 min rest")],
    PEERJ_CREDIT, PEERJ_URL, PEERJ_NOTE, series="Concurrent Training for Golfers (PeerJ)", day=1, days=3)

add("x-mb-peerj-youth-golf-phase-2-explosive", "Concurrent Training for Golfers - Phase 2 Explosive Strength", "gym", "advanced", "golf",
    ["sport-performance", "strength"], 65, 2, ["barbell", "bench", "machines", "cables", "hurdles"], ["full-gym"],
    PEERJ_WHO, PEERJ_HOW,
    "Contrast pairs: six reps at 70% followed straight away by ten fast jumps, push-ups or pull-downs.",
    [E("Standardised warm-up", 1, "10 min"), E("Golf-specific functional movement work", 1, "30 min"),
     E("Horizontal Bench Press", 3, "6", weight="70% 1RM", group="A"), E("Plyometric Push-ups", 3, "10", group="A"),
     E("Seated Row Machine", 3, "6", weight="70% 1RM", group="B"), E("Explosive Pull-downs", 3, "10", group="B"),
     E("Leg Press Machine", 3, "6", weight="70% 1RM", group="C"), E("Vertical Jumps over 45cm Hurdles", 3, "10", group="C"),
     E("Seated Calf Extension", 3, "6", weight="70% 1RM", group="D"), E("Vertical Jumps over 45cm Hurdles", 3, "10", group="D"),
     E("Triceps Cable Push-down", 3, "6", weight="70% 1RM", group="E"), E("Plyometric Push-ups", 3, "10", group="E")],
    PEERJ_CREDIT, PEERJ_URL, PEERJ_NOTE, series="Concurrent Training for Golfers (PeerJ)", day=2, days=3)

add("x-mb-peerj-youth-golf-phase-3-golf-specific", "Concurrent Training for Golfers - Phase 3 Golf-Specific Strength", "other", "advanced", "golf",
    ["sport-performance"], 50, 2, ["weighted golf club", "acceleration tubing club", "golf balls"], ["outdoor"],
    PEERJ_WHO, PEERJ_HOW,
    "The final six weeks swap gym lifts for loaded and assisted drives: weighted-club drives and accelerated drives with a tubing club system.",
    [E("Standardised warm-up", 1, "10 min"), E("Golf-specific functional movement work", 1, "30 min"),
     E("Golf Drives with Weighted Clubs", 3, "10", weight="4 min rest"),
     E("Accelerated Drives with Acceleration Tubing Club", 3, "10", weight="4 min rest")],
    PEERJ_CREDIT, PEERJ_URL, PEERJ_NOTE, series="Concurrent Training for Golfers (PeerJ)", day=3, days=3)

TOGU_CREDIT = "Li M, Ruan C, Zhang L (Shenzhen University) - Journal of Functional Morphology and Kinesiology 2024"
TOGU_URL = "https://doi.org/10.3390/jfmk9040243"
TOGU_NOTE = "Open-access study, CC BY 4.0. Exercises and sets x time from Table 1 (TOGU Balanza disc and Dynair air cushion are the brand-name kit used)."
TOGU_WHO = "Mid-handicap golfers (the study used 15-20 handicappers) who want a four-week core and balance block using balance discs and cushions."
TOGU_HOW = ["Three sessions a week, about 60 minutes, alongside normal golf practice.",
            "Week 1 uses the foundation session; weeks 2-4 use the progression session.",
            "Do a 10-minute warm-up before and a 10-minute cool-down after each session, as the study did.",
            "In the study this improved FMS scores, balance and swing measures over four weeks; small sample (16 trained players)."]

add("x-mb-togu-golf-core-week-1", "TOGU Golf Core & Balance - Week 1", "fitness", "intermediate", "golf",
    ["sport-performance", "strength"], 60, 3, ["balance disc", "mat"], ["home", "full-gym"],
    TOGU_WHO, TOGU_HOW,
    "Foundation week: four-round timed core holds and back extensions, with an unstable-surface plank.",
    [E("Plank Support", 4, "1 min"), E("Russian Twist", 4, "1 min"),
     E("Prone Back Extensions", 4, "to fatigue"), E("Kneeling Plank on Balance Disc", 4, "1 min")],
    TOGU_CREDIT, TOGU_URL, TOGU_NOTE, series="TOGU Golf Core & Balance", day=1, days=2)

add("x-mb-togu-golf-core-weeks-2-4", "TOGU Golf Core & Balance - Weeks 2-4", "fitness", "intermediate", "golf",
    ["sport-performance", "strength"], 60, 3, ["balance disc", "balance cushion", "medicine ball", "cable rope", "flexible power stick"], ["full-gym"],
    TOGU_WHO, TOGU_HOW,
    "Progression weeks: single-leg and two-foot balance on discs, med-ball holds and throws, rope rotations and anti-rotation on a cushion.",
    [E("Single-leg Disc Touch Support (both sides)", 3, "1 min"), E("Two-foot Standing on Balance Disc", 4, "1 min"),
     E("Two-foot Standing on Disc holding Medicine Ball", 4, "1 min"), E("Plank on Balance Disc", 4, "1 min"),
     E("Single-leg Standing on Balance Disc", 4, "1 min"), E("Single-leg Standing on Disc holding Ball", 4, "1 min"),
     E("Push-up on Balance Cushion", 4, "1 min"), E("Standing Body Rotation with Rope", 4, "1 min"),
     E("Single-leg Standing on Balance Disc (repeat)", 4, "1 min"), E("Anti-rotation Hold on Balance Cushion", 2, "1 min"),
     E("Medicine Ball Throws on Balance Cushion", 2, "1 min"), E("Power-stick Swinging on Air Cushion", 4, "1 min")],
    TOGU_CREDIT, TOGU_URL, TOGU_NOTE, series="TOGU Golf Core & Balance", day=2, days=2)

# ======================================================================== PILATES

add("x-mb-lpt-physio-based-pilates", "NHS Physio-Based Pilates (Leicestershire)", "fitness", "beginner", "pilates",
    ["mobility", "general-fitness"], 25, 7, ["mat", "towel"], ["home", "older-adults", "minimal-equipment"],
    "People new to Pilates, including those with everyday back niggles, who want the gentle standing, lying and stretching routine NHS physios teach in class.",
    ["The leaflet's dose is 8-12 reps of each exercise, 2 or 3 times a day - choose the exercises that suit you; a full run-through is about 25 minutes.",
     "Set up each move with the five elements: breathing, centring, ribcage, shoulder blades, head and neck. Breathe out on the effort, never hold your breath.",
     "Hold each stretch about 15-30 seconds.",
     "The leaflet itself notes Pilates isn't proven better than other exercise for pain - pick what you enjoy, and ask a physio if anything hurts."],
    "An NHS physiotherapy Pilates sequence: standing knee bends and heel raises, lying table-top and leg slides, bridge, side-lying leg work, prone swan and swimming, then six stretches.",
    [E("Knee Bends with arm raise", 1, "8-12"), E("Single Leg Bends", 1, "8-12/side"),
     E("Heel Raises with arm raise", 1, "8-12"), E("Standing Roll Down", 1, "8-12"),
     E("Table Top / Heel Taps", 1, "8-12/side"), E("Leg Slides", 1, "8-12/side"),
     E("Bridge (peel spine off the mat)", 1, "8-12"), E("Side-lying Lift and Lower", 1, "8-12/side"),
     E("Clam", 1, "8-12/side"), E("Swan Dive (2s hold)", 1, "8-12"), E("Swimming (prone arm reach)", 1, "8-12/side"),
     E("Cat and Camel", 1, "8-12"), E("Full Body Stretch", 1, "15-30s"), E("Seated Hamstring Stretch", 1, "15-30s"),
     E("Knee Hugs", 1, "15-30s"), E("Knee Rolls", 1, "15-30s/side"), E("Side-lying Gluteal Stretch", 1, "15-30s/side")],
    "Leicestershire Partnership NHS Trust MSK Physiotherapy (leaflet 608)",
    "https://www.leicspart.nhs.uk/wp-content/uploads/2024/08/608-Physio-based-pilates.pdf",
    "Free NHS patient leaflet ('Your guide to physiotherapy based Pilates'). Exercise names, reps and hold times only. No reproduction restriction stated in the leaflet.")

# ================================================================== YOGA-MOBILITY

add("x-mb-nhs-sitting-exercises", "NHS Sitting Exercises", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 10, 2, ["chair"], ["home", "older-adults", "minimal-equipment", "time-efficient"],
    "Older adults, people returning after illness and anyone who finds standing or floor exercise hard - all done from a solid chair without arms.",
    ["At least twice a week; combine with the NHS flexibility, balance and strength routines.",
     "Use a stable chair without wheels or arms, feet flat and knees at right angles.",
     "Build up the repetitions gradually over time.",
     "Check with a GP first if you're unsure the exercises are right for you."],
    "Five gentle seated moves for the chest, upper back, hips, ankles and neck.",
    [E("Chest Stretch", 5, "5-10s"), E("Upper-body Twist (hold 5s)", 1, "5/side"),
     E("Hip Marching", 1, "5/leg"), E("Ankle Stretch (point and flex)", 2, "5/foot"),
     E("Neck Rotation (hold 5s)", 1, "3/side")],
    "NHS", "https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/sitting-exercises/",
    "Information from the NHS website is licensed under the Open Government Licence v3.0. Exercise names and reps only.")

add("x-mb-nhs-stretch-after-exercising", "NHS Post-Workout Stretch", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 5, 3, ["mat"], ["home", "time-efficient", "busy", "minimal-equipment"],
    "Anyone finishing a run, walk, gym session or class who wants a quick, gentle cool-down for the legs and hips.",
    ["After every workout, once your breathing has settled.",
     "Hold each stretch 15-20 seconds per side; spend longer if you need to.",
     "Stretch to mild tension only and keep breathing.",
     "Injured, pregnant or have a medical condition? Ask a physio which stretches suit you."],
    "Five stretches for the buttocks, hamstrings, inner thighs, calves and front of thighs, about five minutes in total.",
    [E("Buttock Stretch (lying, figure-4)", 1, "15-20s/side"), E("Lying Hamstring Stretch", 1, "15-20s/side"),
     E("Inner Thigh Stretch (soles together)", 1, "15-20s"), E("Calf Stretch", 1, "15-20s/side"),
     E("Side-lying Thigh Stretch", 1, "15-20s/side")],
    "NHS", "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/",
    "Information from the NHS website is licensed under the Open Government Licence v3.0. Exercise names and hold times only.")

add("x-mb-bhft-low-back-pain-exercises", "NHS Low Back Pain Gentle Exercises (Berkshire)", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 10, 7, ["mat"], ["home", "older-adults", "minimal-equipment", "time-efficient"],
    "People with everyday (non-serious) low back pain or stiffness who want four gentle moves to do little and often.",
    ["Twice a day, morning and afternoon, building from 1 up to 20 repetitions.",
     "Some discomfort is OK, but the moves shouldn't make your symptoms much worse.",
     "Keep up your normal activities - long bed rest slows recovery.",
     "Red flags (new bladder or bowel problems, numbness in the saddle area, worsening leg weakness) need urgent medical help, not exercise."],
    "Knee rolls, knees to chest, bridge and standing side bends from an NHS physiotherapy leaflet.",
    [E("Knee Roll Stretch", 1, "1-20"), E("Knee to Chest Stretch", 1, "1-20"),
     E("Bridge", 1, "1-20"), E("Standing Side Bend", 1, "1-20/side")],
    "Berkshire Healthcare NHS Foundation Trust Physiotherapy (leaflet BH1165n)",
    "https://www.berkshirehealthcare.nhs.uk/media/qwqaccdd/bh1165n-low-back-pain-v1-feb-2026.pdf",
    "Free NHS patient leaflet, reviewed Feb 2026. Exercise names and rep ranges only. No reproduction restriction stated in the leaflet.")

add("x-mb-livelighter-office-worker-routine", "LiveLighter 5x5x5 Office Worker Routine", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 5, 5, ["chair"], ["busy", "time-efficient", "minimal-equipment", "travel"],
    "Desk workers who want a five-minute stretch break they can do from their chair at work.",
    ["Five minutes, five times a week - for example once each workday.",
     "Sit tall with feet flat; move slowly into each position.",
     "Hold each stretch for the time shown and breathe normally.",
     "Pair it with regular standing or walking breaks through the day."],
    "Australian public-health routine: neck, ankles, hips, torso and shoulders, all seated.",
    [E("Four-way Neck Stretch", 1, "10s each direction"), E("Ankle Flexion", 3, "3s point + 3s flex/side"),
     E("Seated Hip Stretch (ankle over knee)", 1, "30s/side"), E("Seated Torso Twist", 1, "30s/side"),
     E("Shoulder Rolls", 1, "5 forward + 5 back")],
    "LiveLighter (Australian healthy-lifestyle public health program)",
    "https://cdn.livelighter.com.au/assets/resource/physical-activity/ll-mobility-guides-5x5x5-office-worker-both-sides.pdf",
    "Free downloadable LiveLighter mobility guide. Exercise names and holds only. No reuse restriction stated on the guide; site terms page could not be located.")

add("x-mb-emory-ten-stretches-as-you-age", "10 Stretches to Do as You Age", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 25, 2, ["chair", "wall", "towel", "mat"], ["home", "older-adults", "minimal-equipment"],
    "Older adults who want a full-body stretching routine using a chair, wall and towel, with standing, seated and lying options.",
    ["Twice a week, after a few minutes of walking or after strength or endurance exercise - not before.",
     "Hold each stretch 10-30 seconds and repeat 3-5 times (the lower number is shown); never bounce.",
     "A mild pull is fine; sharp pain means ease off.",
     "Had hip, back or other surgery? Check with your doctor first."],
    "Ten classic stretches originally published by the US National Institutes of Health: thighs, calves, back, shoulders, hamstrings, ankles, hips, neck, chest and lower back.",
    [E("Standing Thigh Stretch (hold chair)", 3, "10-30s/leg"), E("Wall Calf Stretch", 3, "10-30s/leg"),
     E("Seated Back Stretch (fold from hips)", 3, "10-30s"), E("Towel Shoulder & Upper-arm Stretch", 3, "10-30s/arm"),
     E("Bench Back-of-Leg Stretch", 3, "10-30s/leg"), E("Seated Ankle Stretch (toes up, toes away)", 3, "10-30s each way"),
     E("Lying Hip Stretch (knee out to side)", 3, "10-30s/leg"), E("Neck Turn Stretch", 3, "10-30s/side"),
     E("Chest Stretch (arms back)", 3, "10-30s"), E("Lying Lower-back Rotation", 3, "10-30s/side")],
    "Emory Healthy Aging Study (Emory University), exercises sourced from the US National Institutes of Health",
    "https://healthyaging.emory.edu/annual-report-2018/assets/production/files/EHAS_Stretches.pdf",
    "Free PDF. Its exercises are credited to NIH (US federal public-domain material). Where a 3-5 rep range is given, 3 sets are stored.")

with open(OUT, "w") as f:
    json.dump(P, f, indent=2, ensure_ascii=False)
print(OUT, len(P))
