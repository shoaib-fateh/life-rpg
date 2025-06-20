import React, { useState, useEffect } from "react";

const QuestModal = ({ show, onClose, onConfirm, editingQuest = null }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "easy",
    type: "daily",
    is24Hour: false,
    deadline: "",
    levelRequired: 1,
    coins: 0,
    xp: 0,
  });
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Populate form when editingQuest changes (edit mode)
  useEffect(() => {
    if (editingQuest) {
      setForm({
        name: editingQuest.name || "",
        description: editingQuest.description || "",
        difficulty: editingQuest.difficulty || "easy",
        type: editingQuest.type || "daily",
        is24Hour: !!editingQuest.is24Hour,
        deadline: editingQuest.deadline
          ? new Date(editingQuest.deadline).toISOString().slice(0, 16)
          : "",
        levelRequired: editingQuest.levelRequired || 1,
        coins: editingQuest.coins || 0,
        xp: editingQuest.xp || 0,
      });
      setError(null);
      setRetryCount(0);
    } else {
      setForm({
        name: "",
        description: "",
        difficulty: "easy",
        type: "daily",
        is24Hour: false,
        deadline: "",
        levelRequired: 1,
        coins: 0,
        xp: 0,
      });
      setError(null);
      setRetryCount(0);
    }
  }, [editingQuest, show]);

  if (!show) return null;

  // Handle input changes (controlled form)
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submit with retry logic
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      setError("نام کوئست الزامی است");
      return;
    }
    if (!form.type) {
      setError("نوع کوئست را انتخاب کنید");
      return;
    }
    if (!form.difficulty) {
      setError("سطح سختی را انتخاب کنید");
      return;
    }
    setError(null);

    // Prepare quest data for confirm
    const questToSend = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      levelRequired: Number(form.levelRequired) || 1,
      coins: Number(form.coins) || 0,
      xp: Number(form.xp) || 0,
      deadline:
        form.deadline && form.type !== "daily" && !form.is24Hour
          ? new Date(form.deadline).getTime()
          : null,
      // If is24Hour checked, make quest repeatable by design
      repeatable: form.is24Hour ? true : false,
    };

    // Retry logic
    const attemptAddQuest = (attempt = 0) => {
      onConfirm(questToSend)
        .then(() => {
          onClose();
          setRetryCount(0);
          setError(null);
        })
        .catch((err) => {
          if (err?.code === "resource-exhausted" && attempt < 3) {
            setError("محدودیت منابع! تلاش مجدد...");
            setRetryCount(attempt + 1);
            setTimeout(
              () => attemptAddQuest(attempt + 1),
              Math.pow(2, attempt) * 1000
            );
          } else {
            setError("خطا در افزودن کوئست. لطفاً بعداً دوباره امتحان کنید.");
          }
        });
    };

    attemptAddQuest(retryCount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-purple-400">
          {editingQuest ? "ویرایش کوئست" : "➕ کوئست جدید"}
        </h2>

        {error && <div className="text-red-400 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="text-white">
          <input
            name="name"
            type="text"
            placeholder="نام کوئست"
            value={form.name}
            onChange={onChange}
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right"
            required
          />

          <textarea
            name="description"
            placeholder="توضیحات"
            value={form.description}
            onChange={onChange}
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right"
          ></textarea>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={onChange}
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3"
          >
            <option value="easy">آسان</option>
            <option value="medium">متوسط</option>
            <option value="hard">سخت</option>
          </select>

          <select
            name="type"
            value={form.type}
            onChange={onChange}
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3"
          >
            <option value="daily">روزانه</option>
            <option value="main">اصلی</option>
            <option value="subquest">ساب‌کوئست</option>
          </select>

          {/* Show deadline input only if NOT daily or is24Hour is unchecked */}
          {form.type === "daily" && !form.is24Hour && (
            <input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={onChange}
              className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3"
              placeholder="Quest deadline"
            />
          )}

          <div className="flex items-center mb-3">
            <input
              name="is24Hour"
              type="checkbox"
              checked={form.is24Hour}
              onChange={onChange}
              className="mr-2"
              id="is24Hour"
            />
            <label
              htmlFor="is24Hour"
              className="text-white select-none cursor-pointer"
            >
              24 ساعته
            </label>
          </div>

          <input
            name="levelRequired"
            type="number"
            min={1}
            value={form.levelRequired}
            onChange={onChange}
            placeholder="حداقل سطح برای شروع"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right"
          />

          <input
            name="coins"
            type="number"
            min={0}
            value={form.coins}
            onChange={onChange}
            placeholder="سکه (پاداش)"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right"
          />

          <input
            name="xp"
            type="number"
            min={0}
            value={form.xp}
            onChange={onChange}
            placeholder="تجربه (XP)"
            className="w-full bg-transparent border border-gray-600 p-2 rounded mb-3 text-right"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-400 transition"
            >
              {editingQuest ? "ویرایش" : "افزودن"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                onClose();
              }}
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
