import { WeightGoalSection } from './WeightGoalSection';
import { PerformanceGoalsSection } from './PerformanceGoalsSection';

// Full screen (see DeviceHeader's viewingGoals block for the back button),
// reached from Profile's Goals row - combines the weight goal (photo+OCR
// verified) and performance goals (distance/time/frequency, auto-verified
// from real Apple Health activity) under one place, separate from Home's
// daily checklist which resets every day and isn't this at all.
export function GoalsScreen() {
  return (
    <div className="composer-screen">
      <div className="composer-screen-body">
        <div className="section-label">Weight</div>
        <WeightGoalSection />
        <div className="section-label" style={{ marginTop: 20 }}>Performance</div>
        <PerformanceGoalsSection />
      </div>
    </div>
  );
}
