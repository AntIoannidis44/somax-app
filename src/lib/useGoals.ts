import { useCallback, useEffect, useState } from 'react';
import { useUserId } from './useSession';
import { fetchActiveGoal, fetchWeightLogs, type WeightGoal, type WeightLog } from './weightGoals';
import { fetchActiveFitnessGoals, type FitnessGoal } from './fitnessGoals';

// Active weight goal (+ its weigh-ins) and performance goals for the
// signed-in user - shared by Home's goals bar, Profile's Goals & schedule
// section and the full Goals & schedule screen.
export function useGoals() {
  const userId = useUserId();
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) return;
    const [wg, fg] = await Promise.all([fetchActiveGoal(userId), fetchActiveFitnessGoals(userId)]);
    setWeightGoal(wg);
    setFitnessGoals(fg);
    setWeightLogs(wg ? await fetchWeightLogs(userId, wg.id) : []);
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const latestWeight = weightGoal ? (weightLogs[0]?.weight_kg ?? weightGoal.start_weight_kg) : null;
  const count = (weightGoal ? 1 : 0) + fitnessGoals.length;

  return { userId, weightGoal, weightLogs, latestWeight, fitnessGoals, count, loaded, reload, setWeightLogs };
}
