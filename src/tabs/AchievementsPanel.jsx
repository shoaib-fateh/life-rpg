const AchievementsPanel = ({ achievements }) => (
  <div className="p-4 animate-fade-in">
    <h2 className="text-xl font-bold text-purple-400 mb-4 drop-shadow-glow">
      Achievements
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.length === 0 ? (
        <div className="col-span-2 text-center py-10 text-gray-400">
          No achievements earned yet
        </div>
      ) : (
        achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border ${
              achievement.type === "positive"
                ? "border-green-500 bg-green-900/20"
                : "border-red-500 bg-red-900/20"
            } backdrop-blur-md`}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{achievement.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{achievement.name}</h3>
                <p className="text-gray-300">{achievement.description}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AchievementsPanel;
