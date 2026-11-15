// "The main character is on screen" signal for cold start.
//
// Home's live 3D character (Arena -> CharacterStage) is the first thing a
// user waits for. Anything else that does heavy character work on Home -
// the Unlocks rail asks for up to 6 preview renders, each a composeCharacter
// (often loading GLBs the player doesn't own yet), outfit fitting, a render
// on a second WebGL context and a PNG encode - must not start until that
// character has drawn its first frame, or it competes with it on the main
// thread and the character "spawns late". iOS WKWebView has no
// requestIdleCallback, so the old idle-wait fell back to a flat 300 ms
// timer and fired straight into the middle of the Arena's own load.
let ready = false;
const waiters: (() => void)[] = [];

export function markArenaReady() {
  if (ready) return;
  ready = true;
  waiters.splice(0).forEach((f) => f());
}

// Resolves once the character has drawn, or after `timeoutMs` as a safety
// net (e.g. no WebGL, or a load error) so dependants never wait forever.
export function whenArenaReady(timeoutMs = 5000): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => {
    const t = setTimeout(resolve, timeoutMs);
    waiters.push(() => {
      clearTimeout(t);
      resolve();
    });
  });
}
