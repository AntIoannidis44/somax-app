"""v2 batch runner (Gemini Batch API, half price) - see GEN_BRIEF.md.

  python3 gen_batch.py build                 # specs_v2.json -> batch_v2.jsonl (free; lints every spec first)
  python3 gen_batch.py submit                # upload + create the batch; refuses past the AUD 60 hard budget
  python3 gen_batch.py status                # job state
  python3 gen_batch.py fetch                 # download results -> attempts_v2/<id>_b1.png, cost check
State lives in batch_state.json. Nothing here touches manifest / app / Supabase.
"""
import base64, json, os, sys, time, urllib.request

from gen_v2 import HERE, KEY, MODEL, IDENTITY, build_prompt, lint_spec  # noqa: F401

BATCH_PRICE = 0.071              # USD per 2K image incl. input + thinking tokens, Batch API (measured 2026-11-18: ~$0.069 + margin); GST added via AUD conversion
# Owner's HARD budget for the whole v2 run: AUD 60. Converted with a deliberately
# pessimistic rate so a weaker AUD can't push real spend over it.
# Owner 2026-11-18 (after the -$80 bill): the ONLY money left is AUD 19, and no more will be added.
HARD_BUDGET_AUD = 19.0
BUDGET_EPOCH = 2   # only jobs from this epoch count against HARD_BUDGET_AUD
AUD_PER_USD_PESSIMISTIC = 1.55 * 1.10   # incl. 10% GST
HARD_BUDGET_USD = round(HARD_BUDGET_AUD / AUD_PER_USD_PESSIMISTIC, 2)   # 38.71
TAKES = ("a",)                   # owner 2026-11-18: ONE attempt each; only images that fail review get a 2nd attempt (retry batch). Max 2 attempts per image.
SPECS = os.path.join(HERE, "specs_v2.json")
JSONL = os.path.join(HERE, "batch_v2.jsonl")
STATE = os.path.join(HERE, "batch_state.json")
OUT = os.path.join(HERE, "attempts_v2")
API = "https://generativelanguage.googleapis.com"


def _req(url, data=None, headers=None, method=None, raw=False):
    h = {"x-goog-api-key": KEY}
    h.update(headers or {})
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    with urllib.request.urlopen(r, timeout=600) as resp:
        body = resp.read()
        return (body, resp.headers) if raw else json.loads(body or b"{}")


def build():
    specs = json.load(open(SPECS))
    bad = {s["variantId"]: lint_spec(s) for s in specs if lint_spec(s)}
    if bad:
        sys.exit("SPECS REJECTED (nothing built):\n" + json.dumps(bad, indent=1))
    ids = [s["variantId"] for s in specs]
    if len(ids) != len(set(ids)):
        sys.exit("duplicate variantIds in specs_v2.json")
    refs = {g: base64.b64encode(open(os.path.join(HERE, f"ref_{g}.png"), "rb").read()).decode() for g in ("female", "male")}
    with open(JSONL, "w") as f:
        for s in specs:
          for take in TAKES:
            req = {"contents": [{"role": "user", "parts": [
                        {"inline_data": {"mime_type": "image/png", "data": refs[s["gender"]]}},
                        {"text": build_prompt(s)}]}],
                   "generationConfig": {"responseModalities": ["IMAGE"], "candidateCount": 1,
                                        "imageConfig": {"imageSize": "2K"}}}
            f.write(json.dumps({"key": f"{s['variantId']}#{take}", "request": req}) + "\n")
    n = len(specs) * len(TAKES)
    print(f"built {n} requests ({len(specs)} images x {len(TAKES)} takes) -> {JSONL} ({os.path.getsize(JSONL)/1e6:.1f} MB); "
          f"expected ${n*BATCH_PRICE:.2f} USD of hard budget ${HARD_BUDGET_USD} USD (AUD {HARD_BUDGET_AUD})")


def _spent():
    st = json.load(open(STATE)) if os.path.exists(STATE) else {"jobs": []}
    return st, sum(j["expectedUSD"] for j in st["jobs"] if j.get("epoch") == BUDGET_EPOCH)


def build_fix(label="retry", src_label="main"):
    """Second (final) attempt for images that failed review: send the failed render back with ONE
    targeted instruction from fixes_retry.json (edits keep what was already right)."""
    import io
    from PIL import Image
    specs = {s["variantId"]: s for s in json.load(open(SPECS))}
    fixes = json.load(open(os.path.join(HERE, "fixes_retry.json")))
    refs = {g: base64.b64encode(open(os.path.join(HERE, f"ref_{g}.png"), "rb").read()).decode() for g in ("female", "male")}
    out = os.path.join(HERE, f"batch_{label}.jsonl")
    with open(out, "w") as f:
        for vid, fix in fixes.items():
            buf = io.BytesIO()
            Image.open(os.path.join(OUT, f"{vid}_{src_label}_a.png")).convert("RGB").save(buf, "JPEG", quality=90)
            text = ("Edit this image. Keep EVERYTHING else identical - same person, outfit, camera, equipment, colours, "
                    f"background and two-panel layout - except this change: {fix} "
                    "Do not add any numbers, arrows, labels or text.")
            req = {"contents": [{"role": "user", "parts": [
                        {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}},
                        {"inline_data": {"mime_type": "image/png", "data": refs[specs[vid]["gender"]]}},
                        {"text": text}]}],
                   "generationConfig": {"responseModalities": ["IMAGE"], "candidateCount": 1, "imageConfig": {"imageSize": "2K"}}}
            f.write(json.dumps({"key": f"{vid}#a", "request": req}) + "\n")
    print(f"built {len(fixes)} fix requests -> {out} ({os.path.getsize(out)/1e6:.1f} MB); expected ${len(fixes)*BATCH_PRICE:.2f} USD")
    return out


def build_final():
    """ONE batch: the targeted fixes (batch_retry.jsonl from build_fix) + new source-based specs
    (specs_extra.json), each sent with the source's own photo/illustration as a pose reference."""
    fix = os.path.join(HERE, "batch_retry.jsonl")
    extra = json.load(open(os.path.join(HERE, "specs_extra.json")))
    bad = {s["variantId"]: lint_spec(s) for s in extra if lint_spec(s)}
    if bad:
        sys.exit("SPECS REJECTED:\n" + json.dumps(bad, indent=1))
    refs = {g: base64.b64encode(open(os.path.join(HERE, f"ref_{g}.png"), "rb").read()).decode() for g in ("female", "male")}
    out = os.path.join(HERE, "batch_final.jsonl")
    with open(out, "w") as f:
        for line in open(fix):
            f.write(line)
        for sp in extra:
            parts = [{"inline_data": {"mime_type": "image/png", "data": refs[sp["gender"]]}}]
            text = build_prompt(sp)
            if sp.get("poseRef"):
                pose = base64.b64encode(open(os.path.join(HERE, sp["poseRef"]), "rb").read()).decode()
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": pose}})
                text += (" POSE REFERENCE: the SECOND image is a real photo or illustration of this exact exercise ("
                         + sp["poseRefNote"] + "). Copy that body position exactly, but draw it as the character from the FIRST image "
                         "in our clean 3D style on our plain light-grey background - do not copy the reference's person, room, clothes, logos or text.")
            parts.append({"text": text})
            req = {"contents": [{"role": "user", "parts": parts}],
                   "generationConfig": {"responseModalities": ["IMAGE"], "candidateCount": 1, "imageConfig": {"imageSize": "2K"}}}
            f.write(json.dumps({"key": f"{sp['variantId']}#a", "request": req}) + "\n")
    n = sum(1 for _ in open(out))
    print(f"built {n} requests -> {out}; US${n*BATCH_PRICE:.2f} (~AUD {n*BATCH_PRICE*AUD_PER_USD_PESSIMISTIC:.2f} incl GST); cap AUD {HARD_BUDGET_AUD}")


def submit(jsonl=JSONL, label="main"):
    n = sum(1 for _ in open(jsonl))
    cost = n * BATCH_PRICE
    st, spent = _spent()
    if any(j["label"] == label for j in st["jobs"]):
        sys.exit(f"REFUSED: a '{label}' batch was already submitted - never submit the same batch twice")
    # Never trust a cancel: any earlier job not confirmed finished-with-its-real-count blocks submission.
    for jj in st["jobs"]:
        live = _req(f"{API}/v1beta/{jj['batch']}")
        state = live.get("metadata", {}).get("state")
        if state not in ("BATCH_STATE_SUCCEEDED", "BATCH_STATE_FAILED", "BATCH_STATE_CANCELLED", "BATCH_STATE_EXPIRED"):
            sys.exit(f"REFUSED: earlier batch {jj['label']} is still {state} - wait for it to finish")
    if spent + cost > HARD_BUDGET_USD + 1e-9:
        sys.exit(f"REFUSED: {n} requests = ${cost:.2f}; already committed ${spent:.2f}; hard budget ${HARD_BUDGET_USD} USD (AUD {HARD_BUDGET_AUD})")
    size = os.path.getsize(jsonl)
    _, hdr = _req(f"{API}/upload/v1beta/files", data=json.dumps({"file": {"display_name": "howto_v2"}}).encode(),
                  headers={"X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                           "X-Goog-Upload-Header-Content-Length": str(size),
                           "X-Goog-Upload-Header-Content-Type": "application/jsonl",
                           "Content-Type": "application/json"}, raw=True)
    up = hdr["x-goog-upload-url"]
    f = _req(up, data=open(jsonl, "rb").read(),
             headers={"Content-Length": str(size), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize"})
    fname = f["file"]["name"]
    job = _req(f"{API}/v1beta/models/{MODEL}:batchGenerateContent",
               data=json.dumps({"batch": {"display_name": "howto_v2", "input_config": {"file_name": fname}}}).encode(),
               headers={"Content-Type": "application/json"})
    st["jobs"].append({"epoch": BUDGET_EPOCH, "label": label, "batch": job["name"], "inputFile": fname, "requests": n, "expectedUSD": round(cost, 3),
                       "submittedAt": time.strftime("%Y-%m-%dT%H:%M:%S")})
    json.dump(st, open(STATE, "w"), indent=1)
    print("submitted", job["name"], f"{n} requests, expected ${cost:.2f} USD")


def _job(label):
    st, _ = _spent()
    return st, next(j for j in st["jobs"] if j["label"] == label)


def status(label="main"):
    _, j = _job(label)
    job = _req(f"{API}/v1beta/{j['batch']}")
    meta = job.get("metadata", {})
    print(json.dumps({"state": meta.get("state"), "done": job.get("done"), "stats": meta.get("batchStats")}, indent=1))
    return job


def fetch(label="main"):
    job = status(label)
    if not job.get("done"):
        sys.exit("not finished yet")
    out = (job.get("response") or {}).get("responsesFile") or job.get("metadata", {}).get("output", {}).get("responsesFile")
    body, _ = _req(f"{API}/download/v1beta/{out}:download?alt=media", raw=True)
    os.makedirs(OUT, exist_ok=True)
    got, missing, extra_images = 0, [], 0
    for line in body.decode().splitlines():
        r = json.loads(line)
        key = r.get("key")
        parts = (((r.get("response") or {}).get("candidates") or [{}])[0].get("content") or {}).get("parts", [])
        imgs = [p for p in parts if "inlineData" in p or "inline_data" in p]
        if not imgs:
            missing.append(key)
            continue
        extra_images += len(imgs) - 1          # watch for the reported multi-image over-billing
        d = imgs[0].get("inlineData") or imgs[0].get("inline_data")
        vid, take = key.split("#")
        open(os.path.join(OUT, f"{vid}_{label}_{take}.png"), "wb").write(base64.b64decode(d["data"]))
        got += 1
    st, j = _job(label)
    j.update({"fetched": got, "missing": missing, "extraImagesReturned": extra_images})
    json.dump(st, open(STATE, "w"), indent=1)
    print(f"saved {got}; missing {len(missing)}; extra images returned (billing check) {extra_images}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "build":
        build()
    elif cmd == "submit":
        submit()
    elif cmd == "build-fix":
        build_fix()
    elif cmd == "build-final":
        build_final()
    elif cmd == "submit-final":
        submit(os.path.join(HERE, "batch_final.jsonl"), "final")
    elif cmd == "submit-fix":
        submit(os.path.join(HERE, "batch_retry.jsonl"), "retry")
    elif cmd == "status":
        status(sys.argv[2] if len(sys.argv) > 2 else "main")
    elif cmd == "fetch":
        fetch(sys.argv[2] if len(sys.argv) > 2 else "main")
