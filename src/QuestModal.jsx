const QuestModal = ({ show, onClose, type, onConfirm }) => {
  if (!show) return null;

  const handleSubmit = e => {
    e.preventDefault();
    const name = e.target.name.value;
    const description = e.target.description.value;
    const difficulty = e.target.difficulty.value;
    const questType = e.target.type.value;
    onConfirm({ name, description, difficulty, type: questType });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-purple-400">➕ کوئست جدید</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="نام کوئست"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right text-white"
            required
          />
          <textarea
            name="description"
            placeholder="توضیحات"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right text-white"
          ></textarea>
          <select
            name="difficulty"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-white"
            defaultValue="easy"
          >
            <option value="easy">آسان</option>
            <option value="medium">متوسط</option>
            <option value="hard">سخت</option>
          </select>
          <select
            name="type"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-white"
            defaultValue={type}
          >
            <option value="daily">روزانه</option>
            <option value="main">اصلی</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-400 transition">
              افزودن
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestModal;