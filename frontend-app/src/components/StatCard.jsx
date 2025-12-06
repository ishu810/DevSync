const StatCard = ({ label, value, color }) => (
  <div className="p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-md">
    <p className="text-sm opacity-70">{label}</p>
    <h3 style={{ color }} className="text-2xl font-bold mt-1">
      {value}
    </h3>
  </div>
);
export default StatCard