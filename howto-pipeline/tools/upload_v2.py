"""Upload every finished how-to image (build/uploads.json from build_lookup.py) to the Supabase
`exercise-howto` bucket under v2/<variantId>.jpg - NEW paths only, so the live app (which reads the
lookup JSON shipped in its build) is unaffected until a new build ships.

The service-role key is fetched with the Management API token from somax-app/.env, kept in memory only,
never printed or written to disk.
  python3 upload_v2.py            # dry run (counts, sizes)
  python3 upload_v2.py --go       # upload (skips files already uploaded, per build/uploaded.json)
"""
import io, json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EH = os.path.join(ROOT, "exercise-howto")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "somax-app", ".env")) if "=" in l and not l.startswith("#"))
url = env["VITE_SUPABASE_URL"].strip("\"'")
ref = url.split("//")[1].split(".")[0]

def jpg(path):
    im = Image.open(path).convert("RGB")
    im.thumbnail((860, 2000), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "JPEG", quality=84, optimize=True)
    return b.getvalue()

uploads = json.load(open(os.path.join(EH, "build", "uploads.json")))
done_path = os.path.join(EH, "build", "uploaded.json")
done = set(json.load(open(done_path))) if os.path.exists(done_path) else set()
todo = [(v, d) for v, d in uploads if v not in done]
print(f"{len(uploads)} images, {len(todo)} not yet uploaded")
if "--go" not in sys.argv:
    sys.exit(0)

tok = env["SUPABASE_ACCESS_TOKEN"].strip("\"'")
req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/api-keys?reveal=true", headers={"Authorization": f"Bearer {tok}"})
keys = json.load(urllib.request.urlopen(req))
srv = next(k["api_key"] for k in keys if k.get("name") == "service_role" or k.get("type") == "secret")
for vid, folder in todo:
    data = jpg(os.path.join(EH, "images", folder, f"{vid}.png"))
    r = urllib.request.Request(f"{url}/storage/v1/object/exercise-howto/v2/{vid}.jpg", data=data, method="POST",
                               headers={"Authorization": f"Bearer {srv}", "apikey": srv, "Content-Type": "image/jpeg", "x-upsert": "true"})
    urllib.request.urlopen(r).read()
    done.add(vid)
    json.dump(sorted(done), open(done_path, "w"))
print("uploaded", len(todo))
