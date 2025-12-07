import React from 'react';

const StatCard = ({ label, value, color }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex flex-col items-center space-y-2">
        <div 
          className="text-3xl font-bold"
          style={{ color }}
        >
          {value || 0}
        </div>
        <div className="text-white/70 text-sm font-medium text-center">
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
