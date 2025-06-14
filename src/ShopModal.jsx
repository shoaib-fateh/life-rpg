const ShopModal = ({ show, onClose, items, coins, onBuy }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-purple-400">🛒 فروشگاه</h2>
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="bg-gray-700 bg-opacity-50 p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
                <div className="text-yellow-400 font-bold mt-1">{item.cost.toLocaleString()} سکه</div>
              </div>
              <button
                onClick={() => onBuy(item.id)}
                disabled={coins < item.cost}
                className={`btn-small ${coins >= item.cost ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600'}`}
              >
                خرید
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded mt-4 hover:bg-gray-500 transition"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default ShopModal;