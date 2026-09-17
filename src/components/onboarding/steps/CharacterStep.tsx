import { useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { SKIN_TONES } from '../../../data/catalog';
import { CharacterThumbnail } from '../../character/CharacterThumbnail';

export function CharacterStep() {
  const draft = useAppStore((s) => s.onbDraft);
  const setOnbCharacterBase = useAppStore((s) => s.setOnbCharacterBase);
  const setOnbCharacterSkin = useAppStore((s) => s.setOnbCharacterSkin);

  useEffect(() => {
    if (!draft.character) setOnbCharacterBase('female');
  }, [draft.character, setOnbCharacterBase]);

  if (!draft.character) return null;
  const dc = draft.character;

  return (
    <>
      <h2>Create your athlete</h2>
      <p className="lead">
        Pick a base and skin tone. Hair, outfits and gear are yours to customise in the Character studio — more
        unlocks as you level.
      </p>
      <div className="base-grid">
        <div className={`base-opt${dc.base === 'female' ? ' sel' : ''}`} onClick={() => setOnbCharacterBase('female')}>
          <div className="base-art">
            <CharacterThumbnail cfg={{ ...dc, base: 'female' }} mode="full" />
          </div>
          <div className="char-name">Female</div>
        </div>
        <div className={`base-opt${dc.base === 'male' ? ' sel' : ''}`} onClick={() => setOnbCharacterBase('male')}>
          <div className="base-art">
            <CharacterThumbnail cfg={{ ...dc, base: 'male' }} mode="full" />
          </div>
          <div className="char-name">Male</div>
        </div>
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>Complexion</label>
        <div className="swatch-row">
          {SKIN_TONES.map((c, i) => (
            <button
              key={c}
              className={`swatch${dc.skin === i ? ' sel' : ''}`}
              style={{ background: c }}
              aria-label={`Complexion ${i + 1}`}
              onClick={() => setOnbCharacterSkin(i)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
