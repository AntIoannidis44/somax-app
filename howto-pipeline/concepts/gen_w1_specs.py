# Worker 1 per-item prompt specs -> gen_w1_specs.json
import json
S = {}
def add(vid, gender, movement, setup, p1, p2, primary, secondary=None, extra=None):
    S[vid] = dict(gender=gender, movement=movement, setup=setup, p1=p1, p2=p2, primary=primary, secondary=secondary, extra=extra)

add('existing-004','female','Bodyweight push-up','on the floor, hands slightly wider than shoulder width, body in one straight line from head to heels, no equipment',
    'high plank at the top of the push-up, arms fully straight, body straight',
    'chest lowered to just above the floor, elbows bent at about 45 degrees from the body, body still in one straight line - clearly much lower than panel 1',
    'chest (pectoralis major)','front shoulders (anterior deltoid) and triceps')
add('existing-110','female','Forearm side plank','lying on her side on an exercise mat, supported on the bottom forearm (elbow directly under the shoulder) and the side of the bottom foot, feet stacked, top hand resting on the top hip',
    'side-lying start: forearm on the mat, hips resting down on the mat, legs straight and stacked',
    'hips lifted high off the mat so the body forms one straight diagonal line from head to feet, supported only on the forearm and the side of the bottom foot - clearly higher than panel 1',
    'obliques (side of the waist) and gluteus maximus','quadratus lumborum (lower back side) and gluteus medius (side of the hip)')
add('gap-n006','female','Hop and stick (lateral bound)','bodyweight, no equipment, on a plain floor, viewed from the front-three-quarter so the sideways travel reads left-to-right',
    'balanced on the RIGHT leg only, knee and hip bent in a quarter-squat ready to push off sideways, left foot off the floor, arms back',
    'landed about one metre to the side on the LEFT leg only, knee bent to absorb the landing and held still (sticking it), right leg lifted and trailing behind/across, arms forward for balance - clearly travelled sideways from panel 1',
    'gluteus medius (side of the hip) and quadriceps (front thigh) of the landing leg', None)
add('new-100','female','Sit-to-stand','a plain sturdy chair with no armrests, arms crossed over the chest, feet flat on the floor hip-width apart',
    'sitting upright on the front half of the chair seat, knees bent at 90 degrees, arms crossed over the chest',
    'standing fully upright in front of the chair, hips and knees fully straight, arms still crossed over the chest - clearly standing, not sitting',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)')
add('new-015','male','Indoor rowing machine (ergometer) stroke','seated on the sliding seat of an indoor rowing machine with a flywheel at the front, feet strapped into the foot plates, holding the handle attached to the chain',
    'the catch: knees bent up to the chest with shins vertical, seat slid forward, arms straight reaching forward holding the handle, torso leaning slightly forward',
    'the finish: legs pushed fully straight, seat slid back, torso leaning slightly back, handle pulled into the lower ribs with elbows bent behind the body - clearly a different position from panel 1',
    'latissimus dorsi and middle/lower trapezius (upper back)','rear shoulders (posterior deltoid) and teres major')
add('existing-008','female','Bodyweight Bulgarian split squat','rear foot laces-down on top of a flat gym bench behind her, front foot planted on the floor about a stride in front of the bench, hands on hips, no weights',
    'standing tall with the front leg straight and the rear foot up on the bench',
    'front knee bent to about 90 degrees with the front thigh near parallel to the floor, back knee lowered toward the floor, torso upright - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the FRONT leg','adductor magnus (inner thigh) and soleus (calf) of the front leg')
add('gap-n011','female','90/90 hip switch','seated on an exercise mat, hands on the floor slightly behind the hips for support, feet flat and wider than hip width, knees bent',
    'seated with both knees bent and pointing straight up toward the ceiling, feet flat on the mat',
    'both knees rotated and dropped down to the same side onto the mat into the 90/90 position: front leg turned out with shin across the front of the body and knee bent 90 degrees, back leg turned in with its shin pointing behind and knee bent 90 degrees - clearly different from panel 1',
    'deep hip rotators (piriformis area, deep in the buttock) of both hips','gluteus medius/minimus and tensor fasciae latae (outer hip)')
add('existing-071','female','Parallel bar dip','supported between two parallel dip bars, gripping one bar in each hand, legs hanging with knees slightly bent and ankles crossed, feet well above the floor',
    'top position: arms fully straight, body held upright above the bars',
    'bottom position: elbows bent to about 90 degrees pointing back, shoulders lowered to roughly elbow height, torso slightly leaning forward - clearly lower than panel 1',
    'triceps (back of the upper arm)','front shoulders (anterior deltoid) and chest (pectoralis major)')

# --- retries / batch 2 ---
S['existing-110']['primary']='obliques (side of the waist) AND gluteus maximus (the whole buttock) - both in solid red'
S['existing-110']['secondary']='quadratus lumborum (small patch at the lower back just above the hip) and gluteus medius (upper outer side of the hip, above the buttock) - these two only in orange'
S['existing-110']['p1']='side-lying start: forearm on the mat, the bottom hip and bottom leg resting ON the mat (hip touching the mat), legs straight and stacked'
add('gap-n006','female','Lateral hop and stick (side-to-side single-leg bound)','bodyweight, no equipment, plain floor. CAMERA for this one: viewed from the FRONT (she faces the camera) so the sideways jump travels across the frame from left to right',
    'standing on the LEFT leg ONLY on the left side of the panel, left knee and hip bent in a quarter squat ready to push off sideways, right foot clearly lifted off the floor, arms swung to the left side',
    'landed on the RIGHT leg ONLY on the right side of the panel, about one metre away from where she started, right knee bent to absorb the landing and held still, left foot clearly OFF the floor with the left leg lifted and crossed slightly behind the right ankle, arms out for balance - only ONE foot touches the floor in each panel, never a lunge with both feet down',
    'gluteus medius (upper outer hip) and quadriceps (front thigh) of the standing/landing leg', None,
    'Use a horizontal arrow pointing right inside the gap is NOT wanted - keep the standard short downward dark-grey arrow between the panels.')
S['gap-n006']['extra']=None

# --- batch 3 ---
S['existing-110']['extra']=('MUSCLE COLOURS: paint the rounded back of her bottom hip/buttock (gluteus maximus) in SOLID RED, the same red as '
  'the side of the waist (obliques). Use orange ONLY for a small patch at the upper outer side of the top hip just below the waist '
  '(gluteus medius) and a small patch on the lower back just above the hip (quadratus lumborum). The buttock must NOT be orange.')
S['gap-n006']['p1']=('she stands on the LEFT side of the panel (body in the left third of the panel), balanced on ONE leg only (her left leg), '
  'knee and hip bent in a quarter squat ready to push off sideways to her right, the other foot clearly lifted off the floor')
S['gap-n006']['p2']=('she has bounded sideways and now stands on the RIGHT side of the panel (body in the right third of the panel, '
  'clearly far from where panel 1 shows her), landed and balanced on ONE leg only (her right leg), knee bent to absorb the landing and held still, '
  'the other leg lifted off the floor and swung behind the landing ankle, arms out for balance - only ONE foot touches the floor')
S['gap-n006']['extra']='Show a light floor shadow under the standing foot only. Do not draw both feet on the floor in either panel.'
S['new-015']['extra']=('The ONLY arrow in the whole image is one short downward dark-grey arrow placed in the empty gap BETWEEN panel 1 and panel 2 - '
  'never an arrow inside a panel.')
add('gap-n011','female','90/90 hip switch','seated on an exercise mat facing the camera at a three-quarter angle, hands on the mat slightly behind the hips for support, torso upright, feet flat and set wider than hip width',
    'both knees bent and pointing straight up toward the ceiling, both feet flat on the mat',
    'both knees dropped down to the SAME side (her right) so both thighs lie on the mat: the front leg rotated out with its shin running across in front of her body and the knee bent at 90 degrees, the back leg rotated in with its shin pointing out to the side behind her and the knee bent at 90 degrees - the classic 90/90 seated hip position, clearly different from panel 1',
    'deep hip rotators (piriformis area, painted as a flat red patch on the side/back of the hip and buttock)','gluteus medius/minimus and tensor fasciae latae (flat orange patch on the upper outer hip)',
    'Muscle tints are flat paint on the surface of her leggings, never a ball, sphere or object. No props, no ball.')
add('existing-077','female','Mountain climber','on the floor in a straight-arm high plank, hands under shoulders, no equipment',
    'straight-arm high plank with BOTH legs fully straight behind her, body in one straight line from head to heels',
    'same straight-arm plank but her right knee is driven forward and up underneath her body toward her chest (knee close to the elbows), the left leg stays straight behind - clearly different from panel 1',
    'abdominals (rectus abdominis and obliques on the front and side of the waist)', None)
add('gap-n032','female','Pilates single leg stretch','lying on her back on an exercise mat, head and shoulders curled up off the mat, lower back pressed to the mat',
    'right knee pulled in toward her chest with both hands holding the right shin, left leg extended long and straight at about 45 degrees off the mat',
    'legs switched: left knee pulled in toward her chest with both hands holding the left shin, right leg extended long and straight at about 45 degrees off the mat - make the switch obvious',
    'abdominals (rectus abdominis, front of the stomach)', None,
    'Her torso is shown clearly from the side (not foreshortened) so her feminine chest and waist read through the blue top.')
add('gap-n001','female','Countermovement jump','standing on a plain floor, bodyweight, no equipment, feet hip-width apart',
    'the dip: hips pushed back and knees bent into a quarter squat, torso leaning forward, both arms swung back behind the hips, feet flat on the floor',
    'the jump: whole body fully extended in the air, feet clearly off the floor (about 30 cm gap with a shadow below), toes pointed, both arms swung straight up overhead - clearly airborne',
    'quadriceps (front thigh) and gluteus maximus','hamstrings (back of thigh) and hip flexors (front of the hip)')
add('existing-108','female','Bird-dog','on hands and knees on an exercise mat, hands under shoulders, knees under hips, back flat',
    'all-fours tabletop position, back flat, both hands and both knees on the mat',
    'right arm extended straight forward at shoulder height and the left leg extended straight back at hip height, back still flat and level - opposite arm and leg, clearly different from panel 1',
    'abdominals (rectus abdominis and transverse abdominis, front and side of the stomach)','obliques and gluteus maximus/medius (buttock)')

# --- batch 4 ---
S['existing-110']['p1']=('resting start position: lying on her side, forearm on the mat with the elbow under the shoulder, her bottom hip and the whole '
  'side of her bottom thigh lying flat ON the mat (no gap under the hip at all), legs straight and stacked')
S['existing-110']['p2']=('hips lifted HIGH off the mat so there is a large clear gap between her hip and the mat and her body forms one straight diagonal line '
  'from head to feet, supported only on the forearm and the side of the bottom foot - obviously different from panel 1')
S['gap-n011']['p2']=('both knees dropped to her right so BOTH knees and both thighs rest ON the mat: the front leg turned out with its shin lying across in front '
  'of her pelvis, the back leg turned in with its shin lying on the mat pointing behind her, both knees bent at 90 degrees - the classic 90/90 seated hip '
  'position seen in yoga/mobility, clearly different from panel 1, no knee pointing up')
S['existing-077']['extra']='She has exactly two arms, two legs and two feet in each panel - never an extra foot or leg. In panel 2 one foot is on the floor behind and the other foot is tucked under her hips, off the floor.'
S['gap-n032']['p1']='start position: head and shoulders curled up off the mat, BOTH knees pulled in toward her chest with the shins parallel to the floor, hands resting on the shins'
S['gap-n032']['p2']=('head and shoulders still curled up, the right knee stays pulled in to her chest with both hands on the right shin, while the LEFT leg is now '
  'extended long and straight out away from her at about 45 degrees off the mat - obviously different from panel 1 where both knees are tucked')
add('new-113','female','Bodyweight split squat (static)','standing in a long split stance on the floor, one foot forward and one foot back, both feet staying on the floor the whole time, hands on hips, no weights, no bench',
    'standing tall in the split stance, both legs nearly straight, back heel raised',
    'both knees bent to about 90 degrees, back knee lowered to just above the floor, front thigh parallel to the floor, torso upright - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the front leg','adductor magnus (inner thigh) and soleus (calf) of the front leg')
add('new-012','female','Burpee broad jump','bodyweight, no equipment, plain floor',
    'bottom of the burpee: chest down to the floor in a push-up/plank position with hands under shoulders',
    'mid-air in a broad jump travelling FORWARD, well ahead of where the hands were in panel 1, both feet off the floor, knees tucked slightly, arms swung forward - clearly airborne and travelling forward',
    'quadriceps (front thigh) and gluteus maximus','hamstrings (back of thigh) and hip flexors (front of hip)')
add('new-025','female','Supported deep squat hold','bodyweight, standing in front of a vertical door frame, holding it lightly with both hands for balance',
    'standing upright facing the door frame, arms straight holding the frame at waist height, feet shoulder-width apart',
    'sitting down into a deep full squat, hips well below knee level, heels flat on the floor, chest up, still holding the door frame with both hands - clearly much lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)')
add('new-047','female','Hollow body hold','lying on her back on an exercise mat, no equipment',
    'lying flat on her back on the mat, arms extended overhead along the floor, legs straight on the mat, fully relaxed',
    'hollow hold: lower back pressed into the mat, head, shoulders and straight arms lifted off the mat reaching past her head, straight legs lifted about 30 cm off the mat so her body forms a shallow banana/dish shape - clearly lifted compared with panel 1',
    'rectus abdominis (front of stomach)','obliques and transverse abdominis (side of waist)',
    'Her torso is shown clearly from the side (not foreshortened) so her feminine chest and waist read through the blue top.')

# --- batch 5 ---
S['gap-n011']['setup']='seated on an exercise mat, viewed from the FRONT-three-quarter so both legs are clearly visible, hands on the mat slightly behind the hips, torso upright'
S['gap-n011']['p2']=('both knees rotated down to the floor on her right side so NOTHING points up: the front (left) leg lies on the mat in front of her with the thigh '
  'pointing forward and the shin running sideways across in front of her pelvis, knee bent 90 degrees; the back (right) leg lies on the mat out to her right side '
  'with the thigh pointing sideways and the shin pointing backward, knee bent 90 degrees - seen together the two legs make two right angles like a zig-zag on the floor; '
  'both knees touch the mat')
S['new-012']['p1']='bottom of the burpee: lying chest-down on the floor with hands flat beside the chest, legs straight behind, at the LEFT side of the panel'
S['new-012']['p2']='mid-air in a long broad jump travelling FORWARD to the right of the panel, far ahead of where she lay in panel 1, both feet off the floor with a shadow below, knees slightly tucked, arms swung forward'
S['new-012']['setup']='bodyweight, no equipment, plain floor, viewed side-on so the forward travel reads left to right'
S['new-012']['extra']='Muscle highlights are FLAT solid colour tints (not realistic anatomical muscle fibres or skin-removed anatomy). Red = front thigh and buttock; orange = back of thigh and front of hip only.'
S['new-025']['p2']=('sitting all the way down into a FULL deep squat - hips sunk far BELOW the knees, the backs of the thighs almost resting on the calves, heels flat on the floor, '
  'chest up, still holding the door frame with both hands - clearly much lower than panel 1')
S['new-025']['setup']='bodyweight, standing facing the side of an open doorway (a door frame set in a wall section), holding the vertical door-frame edge lightly with both hands for balance'
add('new-097','female','Single-leg shallow squat','bodyweight, standing on one leg, no partner, no equipment, arms forward for balance',
    'standing tall on the RIGHT leg only, the LEFT foot lifted just off the floor in front, arms reaching forward',
    'right knee and hip bent into a shallow quarter squat (about 30-45 degrees of knee bend) on the right leg only, left foot still off the floor, hips pushed slightly back - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the standing leg','adductor magnus (inner thigh) and soleus (calf) of the standing leg')
add('gap-y015','female','Frog stretch','on an exercise mat on forearms and knees, no equipment',
    'all-fours on forearms and knees with knees hip-width apart, hips stacked above the knees',
    'knees slid out very WIDE to the sides with the shins turned out and the inner edge of each foot on the mat, ankles in line with the knees, hips sunk back and down toward the heels while resting on the forearms - a deep inner-thigh stretch, clearly wider and lower than panel 1',
    'adductor group (inner thighs, being stretched)', None)
add('gap-n002','female','Depth jump','a sturdy plyometric box about knee height on a plain floor, bodyweight',
    'standing on top of the box, arms relaxed, about to step off',
    'after stepping off and landing next to the box she immediately explodes upward: whole body extended in the air above the floor beside the box, arms swung overhead, feet clearly off the floor with a shadow below - the box is behind her',
    'quadriceps (front thigh) and gluteus maximus','hamstrings (back of thigh) and hip flexors (front of hip)')
add('new-041','male','Grip squeeze with a hand gripper','seated upright on a plain chair/bench, forearm resting along the thigh, holding a spring hand gripper; CAMERA for this one: closer, framing the upper body and the gripping hand large and clear',
    'hand open, the hand gripper handles spread wide apart in the relaxed hand',
    'hand squeezed into a tight fist, the two gripper handles pressed together touching - clearly closed compared with panel 1',
    'forearm flexors (inner/palm side of the forearm)', None)
add('new-065','female','Mini squat (knee bend) with arms forward','bodyweight, standing, feet hip-width apart, no equipment',
    'standing tall, arms down by her sides',
    'knees bent into a small partial squat (about 45 degrees of knee bend, hips pushed slightly back) with both straight arms raised forward to shoulder height for balance - visibly lower than panel 1 with arms forward',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)')

# --- batch 6 ---
S['new-012']['p2']=('a TWO-FOOTED broad jump: mid-air travelling FORWARD to the right of the panel, far ahead of where she lay in panel 1, BOTH feet together side by side '
  'and both off the floor (not a running stride, not one leg forward), knees bent and tucked up in front of her, arms swung forward, shadow on the floor below')
S['new-025']['setup']='bodyweight, CAMERA viewed from the side, standing facing the edge of an open doorway, both hands holding the vertical door-frame edge for balance'
S['new-025']['p2']=('a full-depth resting squat (like a deep Asian squat): her buttocks are just above her heels, close to the floor, hips far below knee height, '
  'the backs of her thighs pressed against her calves, heels flat, chest upright, arms reaching forward holding the door frame - much lower than a parallel squat')
S['new-097']['p1']=('standing tall balanced on her RIGHT foot only; her LEFT foot is lifted clearly off the floor (about 20 cm) and held slightly forward with the '
  'left knee slightly bent; arms reaching forward for balance - only ONE foot touches the floor')
S['new-097']['p2']=('still balanced on the RIGHT foot only with the LEFT foot held clearly off the floor in front of her, right knee and hip bent into a shallow '
  'quarter squat on the one leg, arms forward - only ONE foot touches the floor, this is NOT a two-legged squat')
S['gap-y015']['p1']='on forearms and knees on the mat, knees together hip-width apart directly under her hips, back flat'
S['gap-y015']['p2']=('frog pose: both knees spread very far apart out to the LEFT and RIGHT sides (much wider than her shoulders, thighs pointing sideways), '
  'shins turned out with the inner edge of each foot on the mat, hips lowered down between the knees, still resting on the forearms - an obvious wide-kneed straddle, clearly different from panel 1')
S['gap-y015']['setup']='on an exercise mat, CAMERA viewed from behind-and-to-the-side at a three-quarter angle so the width between her knees is clearly visible, no equipment'
S['gap-y015']['extra']='Her torso is shown so her feminine chest and waist read through the blue top; keep her clearly female.'
add('existing-017','female','Single-leg glute bridge','lying on her back on an exercise mat, arms flat by her sides, left knee bent with the left foot flat on the mat',
    'hips resting on the mat, right leg held straight out in line with the left thigh (raised, not vertical)',
    'hips driven up so the body forms a straight line from shoulders to the left knee, right leg still held straight and in line with the body - clearly higher than panel 1',
    'gluteus maximus (buttock)','quadriceps and hamstrings of the working (bent) leg')
add('new-127','female','Wall sit','back flat against a plain wall, bodyweight, arms by her sides',
    'standing upright with her back and head against the wall, feet about 50 cm in front of the wall',
    'slid down the wall into a seated position with hips and knees bent to 90 degrees, thighs parallel to the floor, shins vertical, back flat on the wall - clearly lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)')
add('existing-060','female','Bear crawl hold with knee taps','on an exercise mat on hands and toes, hands under shoulders, knees bent 90 degrees and hovering just above the mat, back flat like a table',
    'bear hold: both hands and both feet on the mat, knees hovering about 5 cm off the mat, back flat and level',
    'same bear hold with knees still hovering, but her right hand lifted off the mat and reaching back to tap her left knee - clearly different from panel 1',
    'core / rectus abdominis (front of stomach) and serratus anterior (side of the ribs)','front shoulders (anterior deltoids) and quadriceps')
add('new-013','male','Cable glute kickback','standing facing a cable machine with a low pulley, an ankle cuff on his left ankle attached to the cable, both hands holding the machine frame, slight forward lean',
    'standing on the right leg, left leg straight down beside it with the cable taut from the low pulley to the ankle cuff',
    'left leg kicked straight back and up behind him (hip extended about 30 degrees past vertical), cable pulled taut from the pulley to the ankle, torso stable - clearly different from panel 1',
    'gluteus maximus of the kicking leg (buttock)','hamstrings and quadriceps of the kicking leg')

# --- batch 7 ---
S['new-025']['setup']='bodyweight, CAMERA viewed from the side, holding a sturdy vertical support pole/door frame edge in front of her with both hands for balance'
S['new-025']['p2']=('a FULL resting squat at the very bottom: her buttocks sit just a few centimetres above the floor, close to her heels, knees fully bent '
  'and pointing forward past her toes, hips far LOWER than the knees, heels flat on the floor, chest upright, arms reaching forward holding the support - '
  'deeper than a parallel squat (no thigh parallel to the floor)')
S['new-097']['setup']='bodyweight, standing on ONE leg only for the whole exercise, CAMERA viewed from the side so the lifted foot is clearly separated from the floor, arms forward for balance'
S['new-097']['extra']='Both panels must show the LEFT foot clearly in the air with visible space beneath it; the left leg is held forward with the knee slightly bent. Never draw both feet on the floor.'
S['gap-y015']['p2']=('frog pose: knees spread wide apart out to her left and right on the mat (wider than her shoulders) and each knee bent at a RIGHT ANGLE, '
  'so her shins point straight back behind her, parallel to each other, with the inside edge of each foot on the mat; hips sunk low in line with the knees; '
  'resting on her forearms - legs are bent, never straight')
S['existing-017']['extra']=('Muscle highlights must be FLAT solid colour tints painted on the leggings (not realistic skinned anatomy). Red only on the buttock; orange only on the '
  'front and back of the thigh of the BENT supporting leg. The raised straight leg has no highlight.')
S['existing-017']['p1']='hips resting on the mat, left knee bent with the left foot flat, right leg held straight and raised so the right thigh is level with the left thigh'
add('gap-n011','female','90/90 hip hold (seated hip stretch)','seated tall on an exercise mat in the 90/90 position for both panels: the FRONT leg (her right) bent 90 degrees at the knee with the outer side of the thigh and shin on the mat, the shin running across in front of her parallel to her hips; the BACK leg (her left) out to her left side bent 90 degrees at the knee with the inner side of the leg on the mat and the shin pointing backward; both knees on the mat',
    'sitting upright and tall in the 90/90 position, hands resting lightly on the mat beside her hips',
    'same 90/90 leg position, torso hinged forward from the hips so her chest leans down over the front shin, hands on the mat in front of the shin - clearly leaning forward compared with panel 1',
    'gluteal / deep hip external rotators of the FRONT leg (back and outer side of her right buttock and hip, being stretched)', None,
    'The highlight is a flat red tint on the surface of the front-leg buttock/outer hip only - never a ball or sphere. No props.')
add('gap-n010','female','Duck walk','bodyweight, no equipment, plain floor, CAMERA side-on so she travels from left to right',
    'staying in a deep squat (hips at or below knee height, torso upright, hands together in front of the chest) with both feet flat side by side',
    'still in the same deep squat height but she has taken a step forward: her right foot is planted one step ahead of the left, the left heel lifting as she shifts forward - she has visibly moved forward to the right compared with panel 1',
    'gluteus maximus and quadriceps (front thigh)','adductors (inner thigh) and calves (gastrocnemius/soleus)')
add('existing-074','female','Flutter kicks','lying on her back on an exercise mat, arms flat by her sides, lower back pressed into the mat, head resting on the mat',
    'both straight legs lifted together and hovering about 15 cm above the mat, side by side',
    'legs scissoring: the right straight leg raised high to about 45 degrees while the left straight leg is lowered to hover just above the mat - a large clear gap between the two legs, clearly different from panel 1',
    'abdominals (rectus abdominis and obliques, front and side of the stomach)','hip flexors (front of the hip and top of the thigh)',
    'Her torso is shown clearly from the side (not foreshortened) so her feminine chest and waist read through the blue top.')
add('new-042','male','Machine hack squat','standing on the angled foot platform of a plate-loaded hack squat machine, back and shoulders against the angled back pad, shoulders under the shoulder pads, hands on the side handles',
    'top position: legs nearly straight (knees soft), body high on the sled',
    'bottom position: knees bent to about 90 degrees, the sled and his body lowered down the angled rails, back still flat on the pad - clearly lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)')

# --- batch 8 ---
FLAT='Muscle highlights are FLAT solid colour tints painted over the clothing/skin surface (not realistic skinned anatomy); keep his white t-shirt and grey shorts visible.'
add('new-077','male','Dumbbell renegade row','high plank on the floor with each hand gripping a hexagonal dumbbell resting on the floor under the shoulders, feet wide apart, body straight',
    'high plank with both arms straight, both hands on the dumbbells on the floor',
    'still in the high plank, his right hand rows its dumbbell up to the side of his ribs with the elbow bent and pointing up past his back, the left arm stays straight on the other dumbbell, hips level - clearly different from panel 1',
    'latissimus dorsi and middle/lower trapezius (upper back) of the rowing side','rear shoulder (posterior deltoid) and teres major', FLAT)
add('new-068','male','Overhead squat with a stick','standing, holding a light wooden stick (dowel) overhead with straight arms and a wide grip, feet shoulder-width apart',
    'standing tall with the stick held straight overhead, arms locked',
    'squatted down until the thighs are parallel to the floor, chest up, the stick still held directly overhead on straight arms - clearly lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FLAT)
add('new-075','male','Prone Y raise','lying face down (chest supported) on an adjustable bench set to a low incline, feet on the floor, a light dumbbell in each hand',
    'arms hanging straight down toward the floor beside the bench, holding the dumbbells, thumbs forward',
    'both straight arms raised up and forward in a Y shape in line with his body, at about head height, thumbs up - clearly raised compared with panel 1',
    'rear shoulders (posterior deltoids)','rhomboids and middle/lower trapezius (upper back between the shoulder blades)', FLAT)
add('new-098','male','Single-leg dumbbell shoulder press','standing on his LEFT leg only, the right knee lifted to hip height, holding one dumbbell in the right hand',
    'balanced on one leg, right knee lifted, the dumbbell held at the right shoulder with the elbow bent below it',
    'still balanced on one leg with the right knee lifted, the dumbbell pressed straight up overhead with the right arm fully extended - clearly different from panel 1',
    'front shoulder (anterior deltoid) of the pressing arm','upper chest (clavicular pectoralis) and triceps of the pressing arm', FLAT)
add('gap-n019','female','Walking spiderman lunge with rotation','bodyweight, on a plain floor, no equipment',
    'deep lunge: her right foot planted forward outside her right hand, left leg straight back with the knee off the floor, both hands on the floor inside the front foot, hips low',
    'same deep lunge position, but the right hand has lifted and her chest rotates open to the right with the right arm reaching straight up to the ceiling, the left hand still on the floor - clearly different from panel 1',
    'hip flexors of the back (left) leg and the adductors (inner thigh) of the front leg, being stretched', None)
add('gap-y028','female','Supine twist','lying on her back on an exercise mat, arms extended out to the sides at shoulder height (T shape), palms down',
    'lying on her back with both knees bent and feet flat on the mat, knees pointing up, head centred',
    'both bent knees dropped together over to her right side resting on the mat, shoulders still flat on the mat, head turned to look left - clearly different from panel 1',
    'obliques (side of the waist)','hip external rotators (outer hip/buttock, stretched) and erector spinae (lower back)',
    'Her torso is shown clearly so her feminine chest and waist read through the blue top.')
add('gap-y024','female','Supported Warrior 2','a plain kitchen chair placed beside her, her right hand resting lightly on the top of the chair back for balance, left arm extended out to the side at shoulder height, feet in a wide stance (about 1.2 m apart) with the front (right) foot pointing toward the chair and the back foot turned in',
    'standing in the wide stance with both legs straight, torso upright, right hand on the chair back, left arm extended out to the side',
    'front (right) knee bent to about 90 degrees directly over the ankle, back leg straight, torso upright between the legs, right hand still on the chair back and left arm extended - clearly lower than panel 1',
    'quadriceps of the front (bent) leg and gluteus medius/maximus','obliques and spinal erectors')
add('existing-057','female','A-skips running drill','bodyweight, plain floor, CAMERA side-on, tall posture, arms bent at 90 degrees swinging opposite to the legs',
    'on the ball of the left foot, right knee driven up to hip height with the thigh level and the toes pulled up, left arm forward and right arm back',
    'the right leg has pawed down and the right foot strikes the floor under her hips, while the left knee starts driving up to hip height, arms switched (right arm forward) - clearly a different leg position from panel 1',
    'hip flexors (front of the hip, driving knee) and hamstrings/glutes (back of the thigh and buttock, pawing-down leg)','calves/tibialis anterior and quadriceps')

# --- batch 9 ---
F='Muscle highlights are FLAT solid colour tints (not realistic skinned anatomy).'
FM=F+' Keep his white t-shirt and grey shorts visible.'
FF=F+' Keep her blue top and black leggings visible.'
add('new-003','male','Band good morning','standing on the middle of a long resistance band loop with feet hip-width apart, the top of the band looped behind his neck across the upper back/shoulders, hands holding the band at the shoulders',
    'standing tall, knees slightly bent, band taut from feet to shoulders',
    'hinged forward at the hips with a flat back until the torso is nearly parallel to the floor, knees still slightly bent, hips pushed back, band stretched - clearly different from panel 1',
    'gluteus maximus (buttock) and erector spinae (lower back muscles along the spine)','adductor magnus (inner thigh) and hamstrings (back of thigh)', FM)
add('new-008','male','Belt squat','standing on the two raised platforms of a belt-squat machine, a padded hip belt around his hips attached by a chain to the weight below between his feet, hands resting lightly on the machine handles',
    'standing tall with legs straight, the hip belt chain taut',
    'squatted down until the thighs are about parallel to the floor, torso upright, belt and weight lowered with him - clearly lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FM)
add('gap-y001','female','Boat pose (navasana)','seated on an exercise mat, no equipment',
    'seated upright with knees bent and feet flat on the mat, hands lightly behind the knees',
    'balancing on her sitting bones, torso leaning back slightly with a long straight spine, both legs lifted straight up to about 45 degrees making a V shape with the torso, arms extended forward parallel to the floor beside the knees - clearly different from panel 1',
    'rectus abdominis (front of stomach) and hip flexors (front of hip)','erector spinae (lower back) and quadriceps (front thigh)', FF)
add('new-014','male','Standing straight-arm cable pullover','standing facing a high cable pulley with a straight bar attachment, feet hip-width, slight forward hip hinge, arms straight',
    'arms straight and raised up in front at about head height holding the bar, cable taut from the high pulley',
    'arms still straight, the bar pulled down in an arc to touch the front of his thighs - clearly lower than panel 1',
    'latissimus dorsi (side of the upper back under the armpit)', None, FM)
add('gap-y002','female','Chair pose (utkatasana)','standing, feet together, no equipment',
    'standing tall with feet together and arms by her sides',
    'knees bent into a half squat with hips pushed back as if sitting into a chair, torso leaning slightly forward, both arms raised straight overhead in line with the ears - clearly lower than panel 1',
    'quadriceps (front thigh) and gluteus maximus','hip flexors (front of hip) and erector spinae (lower back)', FF)
add('new-019','female','Clockface mini squat','standing on her LEFT leg only on the floor, bodyweight, arms out for balance',
    'balanced on the left leg in a small single-leg squat, right foot lightly tapping the floor directly in FRONT of her (12 o\'clock)',
    'still on the left leg in the small single-leg squat, the right foot now reaching out to tap the floor directly out to her RIGHT SIDE (3 o\'clock) - clearly a different foot position from panel 1',
    'quadriceps and gluteus maximus of the standing leg','adductor magnus (inner thigh) and soleus (calf) of the standing leg', FF)
add('new-027','female','Deep squat walk with rotation','bodyweight, plain floor, CAMERA side-on so she travels left to right',
    'in a low squat (hips near knee height) with hands together in front of the chest, facing forward',
    'still in the low squat, she has taken one step forward (right foot ahead) and rotated her torso and arms to her right toward the camera - visibly moved forward and rotated compared with panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FF)
add('new-031','male','Dumbbell man-maker','plain floor, a hexagonal dumbbell in each hand',
    'in a high plank with both hands on the dumbbells on the floor, rowing the right dumbbell up to the ribs',
    'standing tall after the clean, both dumbbells pressed straight overhead with arms fully extended - clearly a completely different position from panel 1',
    'chest (pectoralis major)','front shoulders (anterior deltoid) and triceps', FM)

# --- batch 10 ---
G=' Both panels must carry the muscle overlay. No frames or borders around the panels, no logos or marks on the clothing.'
add('gap-n005','female','Explosive star jump','bodyweight, plain floor',
    'crouched in a quarter squat with feet together and arms down by her sides, ready to jump',
    'mid-air, both feet clearly off the floor with a shadow below, arms and legs spread wide out to the sides in a star / X shape - clearly different from panel 1',
    'quadriceps (front thigh) and gluteus maximus', None, FF+G)
add('new-032','male','Dumbbell split squat','static split stance on the floor (one foot forward, one foot back, both stay down), a dumbbell hanging in each hand at his sides',
    'standing tall in the split stance, legs nearly straight, back heel raised',
    'both knees bent to about 90 degrees, back knee lowered to just above the floor, torso upright, dumbbells still at his sides - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the front leg','adductor magnus (inner thigh) and soleus (calf) of the front leg', FM+G)
add('new-037','male','Front-rack dumbbell reverse lunge','standing, holding a dumbbell in each hand resting on the front of his shoulders, elbows pointing forward',
    'standing tall, feet hip-width, dumbbells racked at the shoulders',
    'his right leg has stepped BACK into a lunge: back knee lowered toward the floor, front (left) knee bent 90 degrees, torso upright, dumbbells still at the shoulders - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the front leg','adductor magnus (inner thigh) and soleus (calf) of the front leg', FM+G)
add('new-044','male','Half-kneeling landmine press','one end of an Olympic barbell anchored in a landmine pivot on the floor in front of him, the other end held in his right hand; half-kneeling with the right knee down and left foot forward',
    'half-kneeling, holding the end of the bar at his right shoulder with the elbow bent',
    'the bar end pressed up and forward with the right arm fully extended, torso upright and still half-kneeling - clearly different from panel 1',
    'front shoulder (anterior deltoid) of the pressing arm','upper chest (clavicular pectoralis) and triceps of the pressing arm', FM+G)
add('new-052','male','Kettlebell gorilla row','feet wide, straddling two kettlebells on the floor between his feet, hips hinged back, back flat and nearly parallel to the floor',
    'hinged over in the wide stance, both hands holding the two kettlebell handles resting on the floor',
    'still hinged over, his right hand rows its kettlebell up to the side of his ribs with the elbow pointing up, the left hand stays on the other kettlebell on the floor - clearly different from panel 1',
    'latissimus dorsi and middle/lower trapezius (upper back) of the rowing side','rear shoulder (posterior deltoid) and teres major', FM+G)
add('new-054','male','Kneeling band chest expansion','kneeling upright on a mat, a resistance band anchored at chest height to a post in front of him, holding one end in each hand',
    'kneeling tall, both straight arms reaching forward at shoulder height holding the band handles',
    'both straight arms pulled back and open out to the sides behind the line of his body at shoulder height, band stretched, chest open - clearly different from panel 1',
    'rear shoulders (posterior deltoids)','rhomboids and middle/lower trapezius (between the shoulder blades)', FM+G)
add('new-056','female','Lateral squat and reach walk','bodyweight, plain floor, CAMERA from the front so the sideways travel reads left to right',
    'standing tall with feet together on the left side of the panel, arms by her sides',
    'stepped wide sideways to her left into a deep squat with feet wide apart, reaching both arms forward and out at shoulder height - she has visibly moved sideways compared with panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FF+G)
add('new-114','female','Patrick step-down','standing on top of a low plyo box/step (about 20 cm) on her right leg, CAMERA side-on',
    'standing tall on the box on her right leg, left leg straight and hanging just beside the front edge of the box',
    'right knee bending forward over the toes so the body lowers until the left heel lightly touches the floor in front of the box, hips level - clearly lower than panel 1',
    'quadriceps and gluteus maximus of the standing (right) leg','adductor magnus (inner thigh) and soleus (calf) of the standing leg', FF+G)

# --- batch 11 ---
L=' Her torso is shown clearly from the side (not foreshortened) so her feminine chest and waist read through the blue top.'
add('new-071','female','Plank to chaturanga','on an exercise mat, hands under shoulders, body in one straight line',
    'straight-arm high plank, arms fully extended, body straight from head to heels',
    'lowered into chaturanga: elbows bent to 90 degrees and hugging close to the ribs pointing back, body still straight and hovering a few centimetres above the mat - clearly lower than panel 1',
    'rectus abdominis (front of stomach)','obliques and transverse abdominis (side of waist)', FF+G+L)
add('new-085','female','Pilates roll up','lying on her back on an exercise mat, legs straight together on the mat',
    'lying flat on her back with both straight arms reaching up toward the ceiling over her chest',
    'curled all the way up and forward into a seated forward fold, spine rounded in a C-curve, arms reaching forward past her toes, legs still straight on the mat - clearly different from panel 1',
    'rectus abdominis (front of stomach)', None, FF+G+L)
add('new-087','female','Pilates saw','seated tall on an exercise mat, legs straight and spread wider than hip width, arms extended out to the sides at shoulder height',
    'seated tall with arms out to the sides in a T, torso facing forward',
    'torso rotated to her right and folded forward, the left hand reaching past the outside of the right foot (little finger sawing toward the little toe), the right arm reaching back behind her - clearly different from panel 1',
    'rectus abdominis (front of stomach)', None, FF+G+L)
add('gap-n025','female','Pilates seal','seated on an exercise mat, knees bent and opened wide, hands threaded between the legs holding the outsides of the ankles, feet lifted off the mat, balancing on the sitting bones in a rounded C-curve',
    'balancing on her sitting bones with feet off the mat, soles of the feet together',
    'rolled back onto her upper back and shoulders (not the neck), hips lifted, still holding the ankles with the feet up in the air above her - clearly different from panel 1',
    'rectus abdominis (front of stomach)', None, FF+G+L)
add('new-090','female','Seated hamstring reach','seated on an exercise mat with both legs straight out in front, together, no strap',
    'seated tall with a straight back, hands resting on the thighs',
    'hinged forward from the hips with a long back, both arms reaching forward toward the toes, fingertips near the feet, legs straight - clearly folded forward compared with panel 1',
    'hamstrings (back of the thighs, being stretched)', None, FF+G)
add('new-093','female','Side lunge (lateral lunge)','bodyweight, plain floor, CAMERA from the front, hands clasped in front of the chest',
    'standing tall with feet together',
    'stepped wide out to her right: right knee bent deeply with hips pushed back over the right foot, left leg straight with the foot flat, torso upright, hands clasped in front - clearly different from panel 1',
    'quadriceps and gluteus maximus of the bent leg','adductor magnus (inner thigh) and soleus (calf)', FF+G)
add('new-099','female','Single straight leg lower','lying on her back on an exercise mat, arms flat by her sides, lower back pressed to the mat',
    'left leg flat and straight on the mat, right leg held straight up vertical toward the ceiling',
    'left leg still flat on the mat, the straight right leg lowered down to hover just above the mat - clearly lower than panel 1',
    'rectus abdominis (front of stomach)', None, FF+G+L)
add('new-124','female','Sit-up with rotation to the outside of the leg','lying on her back on an exercise mat, knees bent, feet flat',
    'lying flat with knees bent, arms reaching up over her chest',
    'sat all the way up and rotated her torso to the left, both hands reaching past the OUTSIDE of her left knee - clearly different from panel 1',
    'rectus abdominis (front of stomach)','hip flexors (iliopsoas) and tensor fasciae latae (front/outer hip)', FF+G+L)

# --- batch 12 (final) ---
S['new-098']['setup']='standing on his LEFT leg only, the right knee lifted to hip height, holding ONE dumbbell in his RIGHT hand only (left hand empty, resting on the hip)'
S['new-098']['primary']='front of the RIGHT shoulder (anterior deltoid of the arm holding the dumbbell) - the left shoulder has NO red'
S['new-098']['secondary']='right upper chest (clavicular pectoralis) and right triceps only'
add('new-105','female','Squat with sky reach','bodyweight, feet shoulder-width apart',
    'bottom of a bodyweight squat, thighs parallel to the floor, arms reaching forward at shoulder height',
    'standing fully upright, up on her toes, both straight arms reaching straight up overhead toward the sky - clearly different from panel 1',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FF+G)
add('new-109','male','Standing dumbbell press with march','standing on his left leg, holding one dumbbell in his RIGHT hand only',
    'standing on both feet, the dumbbell held at the right shoulder with the elbow bent below it',
    'right knee marched up to hip height while the right arm presses the dumbbell straight overhead - clearly different from panel 1',
    'front of the RIGHT shoulder (anterior deltoid of the pressing arm) only','right upper chest (clavicular pectoralis) and right triceps', FM+G)
add('new-116','female','Step-up jump','a sturdy plyo box about knee height, CAMERA side-on',
    'right foot planted flat on top of the box, left foot on the floor, knees bent, arms swung back, ready to drive up',
    'driving explosively off the right leg into the air above the box, both feet off the box with the left knee driven up, arms swung up - clearly airborne above the box',
    'quadriceps (front thigh) and gluteus maximus','adductor magnus (inner thigh) and soleus (calf)', FF+G)
add('gap-n027','female','Table top heel taps','lying on her back on an exercise mat, arms flat by her sides, lower back pressed to the mat',
    'both legs lifted into table-top: hips and knees bent at 90 degrees, shins parallel to the floor, feet together in the air',
    'keeping the 90-degree knee bend, the right foot lowered so the toes tap the mat while the left leg stays in table-top - clearly different from panel 1',
    'rectus abdominis (front of stomach)', None, FF+G+L)
add('gap-y025','female','Warrior 2 to Reverse Warrior','feet in a wide stance (about 1.2 m), front (right) foot pointing right, back foot turned in, front knee bent 90 degrees over the ankle, back leg straight, CAMERA from the front',
    'Warrior 2: torso upright between the legs, both arms extended out to the sides at shoulder height, gaze over the right hand',
    'Reverse Warrior: same legs, torso arched back toward the back leg, left hand sliding down the back (left) leg, right arm reaching up and over the head - clearly different from panel 1',
    'quadriceps of the front (bent) leg and gluteus medius/maximus', None, FF+G)
add('extra-battle-ropes','male','Battle ropes alternating waves','athletic half-squat stance, knees bent, a thick heavy battle rope anchored to a post in front of him, gripping one rope end in each hand',
    'right hand raised to shoulder height and left hand down by the hip, waves visible travelling along the ropes toward the anchor',
    'arms switched: left hand raised to shoulder height and right hand down by the hip, the waves in the ropes reversed - clearly different arm positions from panel 1',
    'front shoulders (anterior deltoids) and forearms (grip)', None, FM+G)
json.dump(S, open('gen_w1_specs.json','w'), indent=1)
print(len(S))
