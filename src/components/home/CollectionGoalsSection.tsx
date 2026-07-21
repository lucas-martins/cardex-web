import type { CollectionGoals } from "../../types/collectionGoals";

interface CollectionGoalsSectionProps {
  goals: CollectionGoals;
}

export function CollectionGoalsSection({
  goals,
}: CollectionGoalsSectionProps) {
  return (
    <section className="home-goals">
      <div className="home-section-header">
        <div>
          <h2>Collection goals</h2>

          <p>
            {goals.completedGoals} of {goals.totalGoals} goals completed.
          </p>
        </div>
      </div>

      <div className="home-goals-grid">
        {goals.goals.map((goal) => {
          const progressPercentage = Math.min(
            (goal.currentValue / goal.targetValue) * 100,
            100,
          );

          return (
            <article
              key={goal.code}
              className={`home-goal-card ${
                goal.completed ? "completed" : ""
              }`}
            >
              <div className="home-goal-status">
                {goal.completed ? "🏆" : "🎯"}
              </div>

              <div className="home-goal-content">
                <h3>{goal.title}</h3>

                <p>{goal.description}</p>

                <strong>
                  {goal.currentValue} / {goal.targetValue}
                </strong>

                <div className="home-goal-progress">
                  <span
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}