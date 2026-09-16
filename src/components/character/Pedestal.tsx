import { useEffect, useMemo } from 'react';
import { buildPedestal, disposeGroup } from '../../lib/characterBuilder';
import { tierFor } from '../../lib/character';

export function Pedestal({ level }: { level: number }) {
  const tierName = tierFor(level).name;
  const pedestal = useMemo(() => buildPedestal(level), [tierName]);
  useEffect(() => () => disposeGroup(pedestal), [pedestal]);
  return <primitive object={pedestal} />;
}
