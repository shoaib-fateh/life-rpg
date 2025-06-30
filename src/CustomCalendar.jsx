import React from 'react';
import { motion } from 'framer-motion';

const CustomCalendar = ({ selectedDate, onDateChange }) => {
  const months = ['Month 1', 'Month 2', 'Month 3'];
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-gray-800/50 rounded-xl p-4 border border-white/10">
      <h3 className="text-lg font-bold text-cyan-400 mb-2">Workout Calendar</h3>
      <div className="grid grid-cols-3 gap-4">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="bg-gray-700/30 p-2 rounded-lg">
            <h4 className="text-center text-purple-300 mb-2">{month}</h4>
            <div className="grid grid-cols-5 gap-1">
              {days.map((day) => (
                <motion.button
                  key={day}
                  className={`p-2 rounded-lg text-sm ${
                    selectedDate.getDate() === day && selectedDate.getMonth() === monthIndex
                      ? 'bg-purple-600/80'
                      : 'bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onDateChange(new Date(2023, monthIndex, day))}
                >
                  {day}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCalendar;