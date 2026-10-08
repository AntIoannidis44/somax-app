import { registerPlugin, Capacitor } from '@capacitor/core';

export interface LocationSuggestion {
  title: string;
  subtitle: string;
}

interface LocationSearchPlugin {
  search(options: { query: string }): Promise<{ results: LocationSuggestion[] }>;
}

const LocationSearch = registerPlugin<LocationSearchPlugin>('LocationSearch');

// Apple's own free, on-device place/suburb autocomplete (MKLocalSearchCompleter) -
// no API key, no per-call cost. Web has no equivalent here, so it just comes
// back empty there rather than erroring the composer.
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (Capacitor.getPlatform() !== 'ios' || !query.trim()) return [];
  const { results } = await LocationSearch.search({ query });
  return results;
}
