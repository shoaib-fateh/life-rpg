import React from "react";

const TabNavigation = ({ tabNames, activeTab, setActiveTab }) => (
  <div className="flex space-x-2">
    {Object.entries(tabNames).map(([key, name]) => (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
          activeTab === key
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {name}
      </button>
    ))}
  </div>
);

export default TabNavigation;
