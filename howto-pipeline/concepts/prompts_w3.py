# Worker 3 prompt builder. Each entry: setup, p1, p2, optional primary/secondary override (None = use queue data
# subject to the low-confidence rule), optional extra text. Build full prompt with build(item, fix="").
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_w3 import RULES

HERE = os.path.dirname(os.path.abspath(__file__))
QUEUE = {i["variantId"]: i for i in json.load(open(os.path.join(HERE, "gen_queue_3.json")))}
LOW = {"low", "low-moderate", "best-practice"}

FEMALE_ID = ("CHARACTER: the EXACT SAME FEMALE character from the reference photo - same bald head, same face, "
             "feminine chest and waist shape clearly visible through her fitted blue short-sleeve top, black "
             "leggings, white trainers. She is a woman in both panels; do not change her gender, do not give her "
             "a male face, male chest or broad male shoulders. ")
MALE_ID = ("CHARACTER: the EXACT SAME MALE character from the reference photo - same bald head and face, white "
           "t-shirt, grey shorts, white trainers, in both panels. ")
FORMAT = ("PANEL NUMBERS: in the top-left corner of each panel put a bold black digit (1 in the top panel, 2 in the "
          "bottom panel) centred inside a thin black circle outline, like a circled-number badge - never a bare "
          "numeral without its circle. ARROW: one short dark-grey/black vertical arrow pointing down, in the gap "
          "between the two panels - never red or coloured. The two panels must show clearly different body "
          "positions. Both panels use the same camera; nothing cropped. ")

import re
def _clean(names):
    return [re.sub(r"\s*\([^)]*see notes[^)]*\)", "", n).strip() for n in names]

def muscles(item, P=None, S=None):
    prim = P if P is not None else item["primary"]
    sec = S if S is not None else item["secondary"]
    if item["confidence"] in LOW:
        sec = []
    return _clean(prim), _clean(sec)

E = {}
def e(vid, setup, p1, p2, P=None, S=None, extra=""):
    E[vid] = dict(setup=setup, p1=p1, p2=p2, P=P, S=S, extra=extra)

e("existing-136", "Pull-up on a straight overhead pull-up bar, hands gripping the bar overhand slightly wider than shoulders, body hanging free with feet off the floor",
  "dead hang: arms fully straight overhead holding the bar, body hanging below the bar, legs straight or ankles lightly crossed, feet well off the floor",
  "top of the pull-up: elbows bent and pulled down to her sides, chin clearly above the bar, chest close to the bar")
e("new-115", "Step-up onto a sturdy flat exercise bench/box about knee height, no weights",
  "standing tall on the floor beside the bench facing it, one foot planted flat on top of the bench, knee bent, the other foot on the floor, arms relaxed",
  "standing fully upright ON TOP of the bench on the lead leg with that knee straight, the trailing leg's knee driven up in front to hip height, clearly elevated above the floor compared with panel 1")
e("existing-086", "Copenhagen side plank: lying on her side beside a flat bench, the TOP leg's inner ankle/foot resting on top of the bench, bottom forearm on the floor under the shoulder",
  "start: side-lying with the hip resting on the floor, bottom forearm on the floor, top foot on the bench, bottom leg on the floor",
  "end: hips lifted high off the floor so the body forms a straight line from head to the top foot on the bench, bottom leg lifted up to touch the underside of the bench, top hand on the hip")
e("existing-061", "Burpee, bodyweight, on the floor",
  "low phase: in a straight-arm plank (high push-up position) with hands on the floor under the shoulders and legs extended straight behind",
  "jump phase: jumping straight up in the air, feet off the floor, body fully extended, arms reaching straight overhead")
e("existing-076", "Hanging leg raise from an overhead pull-up bar, hands overhand shoulder-width, arms straight",
  "dead hang with arms straight overhead, body and legs hanging straight down, feet off the floor",
  "both legs raised straight together in front to at least hip height (legs horizontal, an L-shape at the hips), arms still straight; the torso stays upright under the bar")
e("new-p3-001", "Jumping rope (skipping) with a jump rope held in both hands",
  "standing on the balls of both feet, elbows close to the sides, hands at hip height holding the rope handles, the rope arcing overhead behind her",
  "small bounce in the air with both feet clearly lifted a few centimetres off the floor and toes pointed down, the rope passing under her feet")
e("new-057", "Deep low lunge stretch on a floor mat, no equipment",
  "half-kneeling: right knee on the mat, left foot flat in front with the left knee bent at 90 degrees, torso upright, hands on the front thigh",
  "deep low lunge: front knee bent forward over the ankle, hips sunk low and forward, back leg extended long behind with the back knee on the mat, both arms raised straight overhead")
e("existing-007", "Bodyweight reverse lunge on the floor, hands on hips",
  "standing tall, feet hip-width apart, hands on hips",
  "one leg stepped far back into a lunge: front knee bent about 90 degrees over the ankle, back knee bent and lowered just above the floor, torso upright, hands on hips")
e("gap-n015", "Open Book thoracic rotation lying on her side on a floor mat, knees bent at 90 degrees and stacked, head resting on the mat",
  "side-lying with both arms extended straight out in front at shoulder height, palms together, knees stacked",
  "the top arm swept open in a big arc so it lies straight out on the floor on the OTHER side of her body, chest rotated open toward the ceiling, head turned to follow the hand, knees still stacked together")
e("existing-075", "Crunch (curl-up) lying on her back on a floor mat, knees bent, feet flat, hands lightly behind the head",
  "lying flat on her back, head and shoulders resting on the mat",
  "head and shoulder blades curled up off the mat, upper back rounded, lower back still on the mat",
  P=["Rectus Abdominis"], S=["Obliques"])
e("existing-027", "Bench dip: sitting on the edge of a flat bench, hands gripping the bench edge beside the hips, heels on the floor in front with knees slightly bent",
  "arms straight, hips just in front of the bench edge",
  "elbows bent about 90 degrees pointing backward, hips lowered well below the bench height in front of the bench")
e("new-018", "Side-lying clamshell on a floor mat, hips and knees bent about 45 degrees, knees and feet stacked, head on the bottom arm, no band",
  "both knees stacked together, feet together",
  "top knee rotated open toward the ceiling as far as possible while the feet stay touching, like an opening clamshell",
  P=["Gluteus Maximus"], S=[])
e("existing-058", "45-degree back extension machine (hyperextension bench): lying face down on the angled pad, hips on the pad, ankles hooked under the ankle rollers, arms crossed on the chest",
  "bottom: torso hinged forward and DOWN at the hips, head pointing toward the floor, upper body nearly vertical below the pad",
  "top: torso raised up to form one straight diagonal line with the legs, back flat - an obviously different torso angle from panel 1",
  P=["Erector Spinae", "Gluteus Maximus"], S=["Hamstrings"])
e("gap-n012", "Couch stretch on a floor mat in front of a wall",
  "kneeling: back knee on the mat right next to the wall, the back shin running up the wall with the top of that foot against the wall, front foot flat on the floor with the front knee bent at 90 degrees, torso leaning forward with hands on the front knee",
  "hips sunk forward and torso lifted fully upright, back knee still on the mat and shin up the wall, so the front of the back thigh and hip is stretched")
e("gap-n003", "Drop landing from a low plyometric box about shin height",
  "standing tall on top of the low box, stepping one foot off the front edge",
  "landed on the floor in front of the box on both feet, holding a stable athletic stance: knees and hips bent, knees over the toes, chest up, arms forward for balance")
e("gap-n031", "Standing roll down, bodyweight, standing on the floor",
  "standing tall, feet hip-width apart, arms relaxed by the sides",
  "spine rounded forward vertebra by vertebra, chin tucked, head hanging, arms dangling toward the floor near the shins, knees softly bent")
e("new-001", "Standing band chest press: a long resistance band anchored at chest height to a wall anchor behind the body, one handle in each hand, staggered stance",
  "hands at the sides of the chest, elbows bent and pulled back, band taut behind",
  "arms pressed straight forward at chest height, hands together in front of the chest, band stretched from the anchor behind")
e("new-p3-002", "Jumping jacks, bodyweight",
  "standing with feet together and arms down by the sides",
  "feet jumped wide apart (wider than shoulders) and arms raised out to the sides up to about shoulder height and above")
e("existing-038", "Dead bug lying on her back on a floor mat",
  "both arms reaching straight up toward the ceiling, hips and knees bent at 90 degrees (tabletop legs), lower back flat on the mat",
  "one arm lowered straight back overhead toward the floor while the OPPOSITE leg extends straight out just above the floor; the other arm stays pointing up and the other knee stays bent at 90 degrees")
e("existing-036", "Floor back extension (superman) lying face down on a floor mat, arms extended overhead",
  "lying flat face down, arms straight overhead on the mat, legs straight",
  "chest, arms and legs all lifted clearly off the mat, back arched, looking at the floor")
e("existing-133", "Standing overhead triceps stretch",
  "standing tall with arms relaxed by the sides",
  "one arm raised overhead with the elbow bent so the hand drops behind the head toward the upper back, the other hand gently pressing that elbow back",
  extra=" This is a stretch: the highlighted muscles are the ones being lengthened on the raised arm.")
e("gap-n033", "Pilates single leg circles lying on her back on a floor mat, arms flat by the sides",
  "one leg extended straight up toward the ceiling, the other leg straight on the mat",
  "the raised leg moved in a big circle: shown swept across the body and down toward the floor at a clear diagonal, with a thin curved grey motion line tracing the circle around the foot (exaggerated range)")
e("existing-130", "Tibialis raise standing with the back and hips leaning against a wall, heels about a foot in front of the wall",
  "both feet flat on the floor",
  "toes and front of both feet lifted HIGH off the floor, heels stay on the floor - exaggerate the toe lift so the soles are clearly visible angled up")
e("new-104", "Resistance band squat to overhead press: standing on the middle of a long band, a handle in each hand at the shoulders",
  "deep bodyweight squat, thighs parallel to the floor, hands holding the band handles at shoulder height",
  "standing fully upright, both arms pressed straight overhead, band stretched from the feet to the hands")
e("existing-042", "Bear crawl on the floor: on hands and toes, knees bent and hovering just above the floor, back flat",
  "on hands and toes with the knees hovering a few centimetres above the floor, back flat like a tabletop",
  "moving forward: right hand and left foot stepped forward together, knees still hovering low, hips stay level")
e("existing-116", "Build-up sprint (running stride) on a flat floor",
  "relaxed jogging stride, upright torso, short stride",
  "full sprint stride: strong forward lean, front knee driven high, back leg fully extended, arms pumping hard")
e("gap-y018", "Crow pose (bakasana) on a yoga mat",
  "deep squat on the balls of the feet, palms flat on the mat shoulder-width in front, knees resting high on the backs of the upper arms",
  "leaning forward onto the hands with elbows bent, both feet lifted off the mat, knees on the upper arms, balancing on the hands only")
e("gap-y029", "Savasana relaxation pose on a yoga mat",
  "sitting on the mat with legs extended, hands behind her for support, about to lie back",
  "lying flat on her back, arms relaxed at about 30 degrees from the body palms up, legs relaxed and slightly apart, eyes closed",
  P=[], S=[])
e("new-062", "Seated shoulder press machine: sitting with back against the upright pad, gripping the two machine handles",
  "handles at shoulder height, elbows bent below the hands",
  "arms pressed straight up overhead, handles at the top of the machine's range")
e("gap-n024", "Pilates open leg rocker on a floor mat",
  "balancing on the sit bones in a V-sit: both legs extended straight and wide up in a V, hands holding the backs of the ankles, spine curved",
  "rolled back onto the upper back and shoulders, legs still in the wide V and now overhead, still holding the ankles")
e("gap-n021", "Prone floor angel lying face down on a mat, forehead resting on a folded towel",
  "arms straight by the sides of the body, palms down, hovering just off the floor",
  "arms swept out wide and up past the head into a Y overhead, hovering off the floor, like a snow angel")
e("existing-025", "Russian twist sitting on a floor mat, knees bent, heels on the floor, torso leaned back about 45 degrees, hands clasped together",
  "hands clasped at the right hip, torso rotated to the right",
  "hands clasped at the left hip, torso rotated to the left - an obviously opposite rotation from panel 1")
e("new-101", "Sliding leg curl lying on her back on the floor, heels on two small round furniture sliders",
  "hips lifted in a bridge, legs straight, heels on the sliders",
  "heels pulled in toward the glutes on the sliders, knees bent, hips still lifted in a bridge")
e("gap-y023", "Warrior 1 standing yoga pose on a yoga mat",
  "standing tall at the front of the mat, feet together, arms by the sides",
  "long lunge stance: front knee bent over the ankle, back leg straight with the back heel down and back foot angled out, hips facing forward, torso upright, both arms raised straight overhead")
e("new-123", "Tuck jump, bodyweight",
  "standing in a quarter squat ready to jump, arms swung back",
  "in the air at the peak of the jump, both knees pulled up high to the chest, feet well off the floor")
e("new-002", "Band face pull: a resistance band anchored at face height to a post in front of her, holding the band with both hands",
  "arms straight in front at face height, band taut",
  "band pulled to the face, elbows high and wide out to the sides at shoulder height, hands beside the ears")
e("new-007", "Barbell reverse lunge with a loaded barbell racked across the upper back",
  "standing tall holding the barbell on the upper back, feet hip-width",
  "one leg stepped far back, back knee gently touching the floor, front knee bent about 90 degrees, torso upright, bar still on the back")
e("new-010", "Bird-dog band row: on hands and knees on a mat, a resistance band anchored low in front, one hand holding the band",
  "on all fours, the working arm extended forward holding the band, both knees on the mat",
  "the working arm rowing the band back with the elbow pulled past the ribs, while the OPPOSITE leg extends straight back at hip height")
e("gap-n007", "Bounding (exaggerated running stride) on a flat surface",
  "pushing off: back leg extending forcefully off the ground, the other knee starting to drive forward",
  "airborne with a huge stride: front knee driven high to hip height, back leg fully extended behind, opposite arm swung forward, both feet off the ground")
e("new-108", "Swiss ball leg curl lying on his back on a mat, heels on top of a large stability ball, arms flat on the floor",
  "hips lifted so the body is a straight line from shoulders to heels, legs straight on the ball",
  "heels rolling the ball in toward the glutes, knees bent about 90 degrees, hips still high")
e("existing-080", "V-up lying on a floor mat",
  "lying flat on her back, arms extended straight overhead on the mat, legs straight on the mat",
  "torso and straight legs both raised to meet in a V, hands reaching to the shins, balancing on the sit bones")
e("new-p3-003", "Chin tuck sitting tall on a stool, side-on view of the head and neck",
  "head in a forward-poking posture, chin pushed forward ahead of the chest",
  "head drawn straight BACK with the chin tucked, a clear double chin, ears aligned over the shoulders - exaggerate the backward head movement so it is obviously different from panel 1",
  S=[])
e("gap-y005", "Cobra pose on a yoga mat",
  "lying face down, hands flat beside the chest, legs straight on the mat",
  "chest lifted into cobra with arms partly straightened, back arched, and one straight leg lifted off the mat behind")
e("new-022", "Yoga crescent lunge on a yoga mat",
  "standing tall at the front of the mat, arms by the sides",
  "high lunge: front knee bent over the ankle, back leg straight with the back heel lifted (on the ball of the back foot), torso upright, arms reaching straight overhead")
e("gap-y008", "Dolphin pose on a yoga mat",
  "forearms flat on the mat shoulder-width apart, hips lifted high, legs straight with feet far back in an inverted V",
  "feet walked in close toward the forearms, hips stacked high above the shoulders, legs straight")
e("new-030", "Dumbbell box step-over: holding a dumbbell in each hand by the sides, a plyo box in front",
  "standing on the floor on one side of the box with the lead foot planted on top of the box",
  "standing tall on top of the box on both feet, then the step continues down the other side - show him on top of the box with one foot reaching down the far side")
e("new-060", "Dumbbell skull crusher lying on a flat bench, a dumbbell in each hand, palms facing each other",
  "arms straight up above the shoulders holding the dumbbells",
  "elbows bent and kept pointing up, dumbbells lowered beside the head, upper arms still vertical")
e("gap-y010", "Eight-limbed pose (ashtanga namaskara) on a yoga mat",
  "plank position, arms straight",
  "knees, chest and chin lowered onto the mat while the hips stay lifted, hands flat beside the chest, elbows bent back",
  P=[], S=[])
e("new-034", "Fire hydrant on hands and knees on a mat",
  "all fours, hands under shoulders, knees under hips",
  "one bent knee lifted out to the side to hip height, knee still bent 90 degrees, hips level",
  P=["Gluteus Maximus"], S=[])
e("gap-y016", "Half moon yoga pose on a yoga mat",
  "standing in a wide stance, side-bent with the lower hand reaching toward the front foot (triangle-like setup)",
  "balancing on the front leg (straight) with the lower hand on the mat, the other leg lifted straight back to hip height parallel to the floor, top arm extended straight up, chest open to the side")
e("gap-y017", "Happy baby pose on a yoga mat",
  "lying on her back, knees hugged in to the chest",
  "knees drawn wide toward the armpits, shins vertical, soles of the feet facing the ceiling, hands holding the outside edges of the feet")
e("new-049", "Pilates jackknife on a floor mat, arms flat on the floor by the sides",
  "lying on the back with both straight legs raised to 90 degrees",
  "legs swept overhead and then pressed straight up toward the ceiling so the body is vertical, balanced on the shoulders and upper back, hips stacked over the shoulders")
e("existing-096", "Lateral shuffle in a low athletic stance",
  "low athletic stance, feet shoulder-width, knees and hips bent, hands in front",
  "mid-shuffle: lead foot stepped wide out to the side, feet clearly wider apart than panel 1, still in the low stance")
e("gap-n028", "Pancake straddle forward fold seated on a mat",
  "seated tall with legs spread wide in a straddle, hands resting on the thighs",
  "torso folded forward and down over one leg, chest toward the knee, hands reaching to the foot")
e("new-070", "Planche lean on the floor",
  "push-up plank, hands under the shoulders, arms straight",
  "shoulders leaned far forward past the wrists with arms straight, body horizontal, hands near the hips, toes barely touching or tucked",
  P=["Pectoralis Major", "Serratus Anterior"], S=[])
e("gap-y012", "Prayer pose (pranamasana) standing on a yoga mat",
  "standing tall with arms relaxed by the sides",
  "standing tall with the palms pressed together in front of the centre of the chest, elbows out",
  P=[], S=[])
e("gap-y031", "Puppy pose on a yoga mat",
  "on all fours, hips over knees",
  "hips stay high over the knees while the hands walk far forward, arms extended straight, chest and forehead lowered toward the mat")
e("new-081", "Body saw in a forearm plank, a Pilates ring held between the hands",
  "forearm plank, gripping a Pilates ring, body straight",
  "body slid backward so the shoulders are well behind the elbows, still in a straight plank line")
e("new-084", "Roll over prep lying on the back on a mat, a large stability ball held between the feet",
  "legs straight up toward the ceiling squeezing the ball between the feet",
  "hips lifted and legs carried overhead so the ball is above the head")
e("new-086", "Running man single-leg squat, bodyweight",
  "standing on one leg, the other knee driven up in front, opposite arm forward, like a sprinter",
  "single-leg squat on the standing leg, torso hinged forward, the free leg swept back behind, arms swapped")
e("new-089", "Pilates scissors lying on the back on a mat, head and shoulders curled up",
  "both legs straight up toward the ceiling",
  "one straight leg pulled toward the face with both hands holding it, the other straight leg lowered toward the floor")
e("new-004", "Seated band leg press: sitting on the floor, a resistance band looped around the sole of one foot, both band ends held in the hands",
  "the banded knee bent toward the chest",
  "the banded leg pressed straight out forward against the band")
e("new-092", "Side crow prep twisted squat on a yoga mat",
  "deep squat with feet and knees together, palms together at the chest",
  "torso twisted to one side so both hands are planted on the floor beside the feet, the outer upper arm resting against the outer knee")
e("new-094", "Sideways roll from a squat position on a mat",
  "deep squat on the mat, arms forward",
  "rolled sideways onto the side and back on the mat, knees tucked")
e("new-096", "Single-leg prisoner squat from a chair, hands behind the head",
  "seated on the edge of the chair, one foot planted, the other leg extended straight in front off the floor, hands behind the head",
  "standing up on the one leg, the other leg still held off the floor in front, hands behind the head")
e("new-102", "Spiderman lunge on a mat",
  "push-up plank",
  "one foot stepped forward outside the same-side hand, that hand on the floor inside the front foot, torso rotated open toward the front leg")
e("new-106", "Squat thrust, bodyweight",
  "deep squat with hands planted on the floor in front",
  "both feet kicked back into a straight-arm plank")
e("new-117", "Sumo squat, bodyweight, hands clasped at the chest",
  "standing with a wide stance, toes turned out",
  "deep squat in the wide stance, thighs parallel to the floor, knees tracking over the toes")
e("gap-n018", "T-spine extension over a foam roller lying on her back on a mat, a foam roller across the upper back under the shoulder blades, hands behind the head, knees bent, feet flat",
  "upper back rounded forward over the roller, chin tucked, elbows forward",
  "upper back extended backward over the roller, head and elbows lowered toward the floor behind")
e("gap-y027", "Thread the needle on a yoga mat",
  "all fours, hands under shoulders, knees under hips",
  "one arm threaded under the body to the opposite side, palm up, that shoulder and the side of the head lowered to the mat")
e("gap-y020", "Triangle pose on a yoga mat",
  "standing in a wide stance, arms extended out to the sides at shoulder height",
  "torso folded sideways over the straight front leg, lower hand on the shin, top arm extended straight up")
e("gap-n022", "Wall walk, face-down, starting in a push-up position with the feet against a wall",
  "push-up plank with the soles of the feet against the base of the wall",
  "feet walked up the wall and hands walked in toward the wall, chest facing the wall, close to a vertical handstand")
e("gap-n013", "World's greatest stretch on a yoga mat",
  "deep lunge, front knee bent, back leg straight, both hands on the floor inside the front foot",
  "torso rotated open, the arm on the front-leg side reaching straight up toward the ceiling, back hand still on the floor")
e("defect-standing-barbell-calf-raise", "Standing barbell calf raise: a loaded barbell across the upper back, balls of the feet on a low step platform",
  "heels dropped well BELOW the level of the step, calves stretched",
  "up high on the toes, heels lifted well ABOVE the step - exaggerate the rise so the difference from panel 1 is obvious")

def build(vid, fix=""):
    item = QUEUE[vid]; d = E[vid]
    prim, sec = muscles(item, d["P"], d["S"])
    rules = RULES.format(SEC_CLAUSE=" and the secondary working muscle group in a lighter orange tint" if sec else "")
    if not prim:
        start = rules.index("On the body in both panels")
        end = rules.index("No other text")
        rules = rules[:start] + "Do NOT add any muscle-highlight colour overlay anywhere on the body (resting/transition posture). " + rules[end:]
    who = FEMALE_ID if item["gender"] == "female" else MALE_ID
    body = f"{d['setup']}. Panel 1 (start): {d['p1']}. Panel 2 (end): {d['p2']}."
    if prim:
        body += " Primary muscle (solid flat red): " + ", ".join(prim) + "."
        if sec:
            body += " Secondary muscle (lighter orange): " + ", ".join(sec) + "."
        else:
            body += " No orange secondary overlay."
    return rules + body + d["extra"] + " " + who + FORMAT + fix, prim, sec

if __name__ == "__main__":
    for v in sys.argv[1:]:
        print(build(v)[0]); print()
