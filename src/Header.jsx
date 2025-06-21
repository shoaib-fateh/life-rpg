import React from "react";

const Header = ({
  level,
  coins,
  hp,
  maxHp,
  mana,
  maxMana,
  xp,
  maxXP,
  setShowInventoryModal,
  setShowShopModal,
  badges,
}) => {
  // Progress bar style function
  const progressBarStyle = (value, max) => ({
    width: `${(value / max) * 100}%`,
    height: "20px",
    backgroundColor:
      value === max ? "#00ff00" : value < max * 0.3 ? "#ff0000" : "#ffff00",
    borderRadius: "5px",
    transition: "width 0.3s ease-in-out",
  });

  return (
    <header className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-purple-400">🧠 Void</h1>
            <div className="ml-2 flex space-x-1">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-700 px-2 py-1 rounded-full animate-pulse"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <p>
            Level: {level} • 🪙{coins}
          </p>
          <div className="flex space-x-4 mt-2">
            <div>
              <span className="mr-2">
                HP •{" "}
                <span className="text-sm text-gray-300">
                  {hp}/{maxHp}
                </span>
              </span>
              <div className="w-32 bg-gray-700 h-2 rounded overflow-hidden">
                <div
                  className="!bg-red-500 h-2 rounded transition-all duration-300"
                  style={progressBarStyle(hp, maxHp)}
                ></div>
              </div>
            </div>
            <div>
              <span className="mr-2">
                MA •{" "}
                <span className="text-sm text-gray-300">
                  {mana}/{maxMana}
                </span>
              </span>
              <div className="w-32 bg-gray-700 h-2 rounded overflow-hidden">
                <div
                  className="!bg-purple-700 h-2 rounded transition-all duration-300"
                  style={progressBarStyle(mana, maxMana)}
                ></div>
              </div>
            </div>
          </div>
          <span className="mt-3">
            XP •{" "}
            <span className="text-sm text-gray-300">
              {xp}/{maxXP}
            </span>
          </span>
          <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
            <div
              className="!bg-green-500 h-2 rounded transition-all duration-300"
              style={progressBarStyle(xp, maxXP)}
            ></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setShowInventoryModal(true)}
            className="bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-400 transition"
          >
            Inventory
          </button>
          <button
            onClick={() => level >= 4 && setShowShopModal(true)}
            className={`px-3 py-1 rounded text-sm transition ${
              level >= 4
                ? "bg-yellow-600 hover:bg-yellow-500"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            disabled={level < 4}
          >
            🛒 Store
            {level < 4 && (
              <span className="ml-2 text-xs"> (Locked until Lvl 4)</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
