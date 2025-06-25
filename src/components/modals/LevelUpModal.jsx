const LevelUpModal = ({ level }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"></div>
      <div className="relative bg-gradient-to-r from-purple-600/30 to-blue-500/30 border border-white/20 rounded-xl p-8 shadow-2xl max-w-md w-full text-center backdrop-blur-xl animate-pop-in">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-2">LEVEL UP!</h2>
        <p className="text-5xl font-bold text-yellow-400 mb-6">{level}</p>
        <p className="text-purple-200">You've grown stronger! Max HP and Mana increased.</p>
      </div>
    </div>
  );
};

export default LevelUpModal;
