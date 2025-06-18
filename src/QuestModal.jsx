import React, { useState } from 'react';

const QuestModal = ({ show, onClose, onConfirm, quests = [] }) => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const description = e.target.description.value.trim();
    const difficulty = e.target.difficulty.value;
    const type = e.target.type.value;
    const is24Hour = e.target.is24Hour.checked;

    const newQuest = { name, description, difficulty, type, is24Hour, status: null, startTime: null, tasks: [] };
    setError(null);

    const attemptAddQuest = async (retryCount = 0) => {
      try {
        await onConfirm(newQuest);
        onClose();
      } catch (err) {
        if (err.code === 'resource-exhausted' && retryCount < 3) {
          setError('Quota exceeded. Retrying...');
          setTimeout(() => {
            attemptAddQuest(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s, 4s
        } else {
          setError('Failed to add quest. Please try again later or check your quota.');
        }
      }
    };

    attemptAddQuest();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-purple-400">➕ کوئست جدید</h2>
        {error && <div className="text-red-400 mb-3">{error}</div>}
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
            defaultValue="daily"
          >
            <option value="daily">روزانه</option>
            <option value="main">اصلی</option>
            <option value="subquest">ساب‌کوئست</option>
          </select>
          <div className="flex items-center mb-3">
            <input
              name="is24Hour"
              type="checkbox"
              className="mr-2"
            />
            <span className="text-white">24 ساعته</span>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-400 transition"
            >
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