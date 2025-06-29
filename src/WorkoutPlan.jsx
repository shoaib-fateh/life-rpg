import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useForm } from "react-hook-form";
import { supabase } from "./App";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import confetti from "canvas-confetti";
import { gsap } from "gsap";

const WorkoutPlan = ({ 
  userId, 
  xp, 
  setXp, 
  hp, 
  setHp, 
  maxHp, 
  mana, 
  setMana, 
  maxMana,
  addNotification,
  badges,
  setBadges
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [feelings, setFeelings] = useState([]);
  const [activeTab, setActiveTab] = useState('workout');
  const [streak, setStreak] = useState(0);
  const [fitnessLevel, setFitnessLevel] = useState(1);
  const { register, handleSubmit, reset } = useForm();
  const particlesInit = async (main) => await loadFull(main);
  const workoutRef = useRef(null);
  const streakRef = useRef(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [goals, setGoals] = useState([
    { id: 1, name: "کاهش چربی بدن به ۱۶-۱۷٪", progress: 65 },
    { id: 2, name: "کاهش سایز کمر به ۸۳ سانتی‌متر", progress: 40 },
    { id: 3, name: "افزایش سایز بازو به ۳۳.۵ سانتی‌متر", progress: 55 },
    { id: 4, name: "افزایش سایز سینه به ۹۶ سانتی‌متر", progress: 50 },
  ]);

  // Workout plan structure
  const workoutPlan = {
    month1: {
      session1: [
        { id: 1, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه پیاده‌روی سریع روی تردمیل", xp: 10 },
        { id: 2, name: "اسکوات با هالتر", desc: "۳ ست × ۸-۱۰ تکرار (وزن سبک، تمرکز روی فرم)", xp: 25 },
        { id: 3, name: "پرس سینه هالتر", desc: "۳ ست × ۸-۱۰ تکرار (آروم تا سینه پایین بره)", xp: 25 },
        { id: 4, name: "لت‌پول‌داون", desc: "۳ ست × ۱۰ تکرار (آرنج کنار بدن)", xp: 20 },
        { id: 5, name: "پلانک", desc: "۳ ست × ۳۰ ثانیه", xp: 15 },
        { id: 6, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
      session2: [
        { id: 7, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه تردمیل", xp: 10 },
        { id: 8, name: "ددلیفت", desc: "۳ ست × ۶-۸ تکرار (وزن متوسط، کمر صاف)", xp: 25 },
        { id: 9, name: "نشر جانب دمبل", desc: "۳ ست × ۱۰ تکرار", xp: 20 },
        { id: 10, name: "پشت بازو سیم‌کش", desc: "۳ ست × ۱۰-۱۲ تکرار", xp: 20 },
        { id: 11, name: "کرانچ", desc: "۳ ست × ۱۵ تکرار", xp: 15 },
        { id: 12, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
    },
    month2: {
      session1: [
        { id: 13, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه تردمیل", xp: 10 },
        { id: 14, name: "اسکوات با هالتر", desc: "۴ ست × ۸-۱۰ تکرار (وزن بیشتر)", xp: 30 },
        { id: 15, name: "پرس سینه دمبل", desc: "۴ ست × ۱۰ تکرار (تنوع بیشتر)", xp: 30 },
        { id: 16, name: "زیربغل هالتر خم", desc: "۳ ست × ۸-۱۰ تکرار", xp: 25 },
        { id: 17, name: "پلانک جانبی", desc: "۳ ست × ۲۰ ثانیه هر طرف", xp: 20 },
        { id: 18, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
      session2: [
        { id: 19, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه تردمیل", xp: 10 },
        { id: 20, name: "ددلیفت", desc: "۴ ست × ۶-۸ تکرار (وزن سنگین‌تر)", xp: 30 },
        { id: 21, name: "نشر جلو دمبل", desc: "۳ ست × ۱۲ تکرار", xp: 25 },
        { id: 22, name: "پشت بازو دمبل (کیک‌بک)", desc: "۳ ست × ۱۲ تکرار", xp: 25 },
        { id: 23, name: "کوه‌نوردی", desc: "۳ ست × ۳۰ ثانیه", xp: 20 },
        { id: 24, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
    },
    month3: {
      session1: [
        { id: 25, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه تردمیل", xp: 10 },
        { id: 26, name: "سوپرست: اسکوات + لانژ", desc: "۳ ست × ۱۲ تکرار + ۳ ست × ۱۲ تکرار (۳۰ ثانیه استراحت)", xp: 35 },
        { id: 27, name: "پرس سینه دمبل", desc: "۳ ست × ۱۲ تکرار", xp: 30 },
        { id: 28, name: "پلانک", desc: "۳ ست × ۴۵ ثانیه", xp: 25 },
        { id: 29, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
      session2: [
        { id: 30, name: "گرم‌کردن", desc: "۵-۱۰ دقیقه تردمیل", xp: 10 },
        { id: 31, name: "ددلیفت", desc: "۴ ست × ۶-۸ تکرار (وزن سنگین)", xp: 35 },
        { id: 32, name: "جلو بازو دمبل", desc: "۳ ست × ۱۲ تکرار", xp: 30 },
        { id: 33, name: "کرانچ دوچرخه", desc: "۳ ست × ۲۰ تکرار", xp: 25 },
        { id: 34, name: "سردکردن", desc: "۵ دقیقه تردمیل", xp: 10 },
      ],
    },
  };

  const nutritionPlan = {
    lunch: "۳ قاچ نان + ۱ تکه سیب (۴ روز در هفته) / روزهای تمرین: ۱ تخم‌مرغ آب‌پز (۲-۳ ساعت قبل)",
    dinner: "۱-۱.۵ لیوان برنج سفید + کمی روغن / روزهای تمرین: روغن بیشتر برای ریکاوری",
    snack: "نان خشک یا سیب (در صورت گرسنگی)",
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId);
      setWorkouts(workoutData || []);

      const { data: nutritionData } = await supabase
        .from("nutrition")
        .select("*")
        .eq("user_id", userId);
      setNutrition(nutritionData || []);

      const { data: feelingsData } = await supabase
        .from("feelings")
        .select("*")
        .eq("user_id", userId);
      setFeelings(feelingsData || []);

      // Calculate streak
      if (workoutData && workoutData.length > 0) {
        const sortedDates = workoutData.map(w => new Date(w.date)).sort((a, b) => b - a);
        let currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const diffDays = Math.floor((sortedDates[i-1] - sortedDates[i]) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) currentStreak++;
          else break;
        }
        setStreak(currentStreak);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (workoutRef.current) {
      gsap.from(workoutRef.current.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [activeTab]);

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const onSubmitFeeling = async (data) => {
    const newFeeling = {
      user_id: userId,
      date: selectedDate.toISOString(),
      feeling: parseInt(data.feeling),
      notes: data.notes,
    };
    await supabase.from("feelings").insert(newFeeling);
    setFeelings([...feelings, newFeeling]);
    reset();
    
    // XP reward for tracking feelings
    setXp(xp + 10);
    setHp(Math.min(maxHp, hp + maxHp * 0.1));
    addNotification("حس و حال ثبت شد! +10 XP", "success");
  };

  const completeExercise = async (exercise) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const isCompleted = completedExercises[`${dateKey}-${exercise.id}`];
    
    if (isCompleted) {
      addNotification("این تمرین قبلاً تکمیل شده است", "warning");
      return;
    }
    
    setCompletedExercises(prev => ({
      ...prev,
      [`${dateKey}-${exercise.id}`]: true
    }));
    
    // XP reward
    setXp(xp + exercise.xp);
    setHp(Math.min(maxHp, hp + maxHp * 0.1));
    setMana(Math.min(maxMana, mana + maxMana * 0.1));
    
    // Confetti effect for completed exercise
    confetti({
      particleCount: Math.floor(exercise.xp / 5),
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
    });
    
    addNotification(`تمرین "${exercise.name}" تکمیل شد! +${exercise.xp} XP`, "success");
  };

  const completeWorkout = async () => {
    const dayWorkouts = getWorkoutsForDate(selectedDate);
    
    // Check if all exercises are completed
    const dateKey = selectedDate.toISOString().split('T')[0];
    const allCompleted = dayWorkouts.every(ex => 
      completedExercises[`${dateKey}-${ex.id}`]
    );
    
    if (!allCompleted) {
      addNotification("لطفاً تمام تمرینات را تکمیل کنید", "warning");
      return;
    }
    
    await supabase.from("workouts").insert({
      user_id: userId,
      date: selectedDate.toISOString(),
      description: "تمرین روزانه تکمیل شد",
    });
    setWorkouts([...workouts, { date: selectedDate.toISOString(), description: "تمرین روزانه تکمیل شد" }]);
    
    // XP reward
    setXp(xp + 50);
    setHp(Math.min(maxHp, hp + maxHp * 0.7));
    setMana(Math.min(maxMana, mana + maxMana * 0.7));
    
    // Confetti effect for completed workout
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
    });
    
    addNotification("تمرین روزانه تکمیل شد! +50 XP", "success");
    
    // Level up fitness if enough XP
    if (xp + 50 >= fitnessLevel * 100) {
      setFitnessLevel(fitnessLevel + 1);
      setBadges([...badges, {
        id: `fitness-level-${fitnessLevel + 1}`,
        emoji: "💪",
        badge: `سطح تناسب اندام ${fitnessLevel + 1}`
      }]);
      addNotification(`سطح تناسب اندام شما افزایش یافت! سطح ${fitnessLevel + 1}`, "level");
    }
  };

  const getWorkoutsForDate = (date) => {
    const month = Math.floor((date.getMonth() + 1) / 3) + 1;
    const day = date.getDay();
    const plan = workoutPlan[`month${month}`];
    return day === 2 || day === 4 || day === 6 ? plan.session1 : plan.session2;
  };

  const getProgressBar = (progress) => {
    return (
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mt-1">
        <motion.div 
          className="h-full bg-gradient-to-r from-green-400 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    );
  };

  const addWaterGlass = () => {
    if (waterIntake < 8) {
      setWaterIntake(waterIntake + 1);
      addNotification("یک لیوان آب اضافه شد! هیدراته بمانید", "info");
    }
  };

  const renderWorkoutTab = () => (
    <div className="space-y-6" ref={workoutRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold text-cyan-400 mb-2">تقویم تمرینی</h3>
          <Calendar 
            onChange={onDateChange} 
            value={selectedDate} 
            className="custom-calendar bg-gray-800/70 text-white rounded-lg"
          />
        </div>
        
        <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-400">تمرینات روز {selectedDate.toLocaleDateString('fa-IR')}</h3>
            <div className="flex items-center bg-purple-600/30 px-3 py-1 rounded-full text-sm">
              <span className="mr-1">🔥</span>
              <span>{streak} روز متوالی</span>
            </div>
          </div>
          
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {getWorkoutsForDate(selectedDate).map((w, i) => {
              const dateKey = selectedDate.toISOString().split('T')[0];
              const isCompleted = completedExercises[`${dateKey}-${w.id}`];
              
              return (
                <motion.li
                  key={i}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    isCompleted ? "bg-gradient-to-r from-green-900/30 to-green-800/30" : "bg-gray-700/30"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        isCompleted ? "bg-green-600/30" : "bg-purple-600/30"
                      }`}>
                        {i + 1}
                      </div>
                      <strong className={`${isCompleted ? "text-green-300" : "text-cyan-300"}`}>{w.name}:</strong>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{w.desc}</p>
                  </div>
                  <motion.button
                    className={`text-xs px-3 py-1 rounded-full ${
                      isCompleted 
                        ? "bg-gradient-to-r from-green-500 to-cyan-500" 
                        : "bg-gradient-to-r from-purple-600 to-blue-600"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => completeExercise(w)}
                  >
                    {isCompleted ? "✅ تکمیل شده" : `تکمیل (+${w.xp} XP)`}
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
          
          <motion.button
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold flex items-center justify-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={completeWorkout}
          >
            <span className="mr-2">🏆</span>
            تکمیل کل تمرین (+50 XP, 70% HP/Mana)
          </motion.button>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-purple-400 mb-4">اهداف تناسب اندام</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-cyan-300">{goal.name}</span>
                <span className="text-sm bg-purple-600/30 px-2 py-1 rounded-full">
                  {goal.progress}%
                </span>
              </div>
              {getProgressBar(goal.progress)}
              <button 
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                onClick={() => {
                  setGoals(goals.map(g => 
                    g.id === goal.id ? {...g, progress: Math.min(100, g.progress + 5)} : g
                  ));
                }}
              >
                پیشرفت +5%
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNutritionTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">برنامه تغذیه</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-xl border border-amber-500/20">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center mr-2">
                <span className="text-xl">🍽️</span>
              </div>
              <strong className="text-amber-300">ناهار</strong>
            </div>
            <p className="text-sm text-amber-200">{nutritionPlan.lunch}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-500/20">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center mr-2">
                <span className="text-xl">🌙</span>
              </div>
              <strong className="text-purple-300">شام</strong>
            </div>
            <p className="text-sm text-purple-200">{nutritionPlan.dinner}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl border border-green-500/20">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-green-600/30 flex items-center justify-center mr-2">
                <span className="text-xl">🍎</span>
              </div>
              <strong className="text-green-300">میان‌وعده</strong>
            </div>
            <p className="text-sm text-green-200">{nutritionPlan.snack}</p>
          </div>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">آب مصرفی امروز</h3>
        <div className="flex items-center justify-center mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 mx-1 rounded-full border-2 border-cyan-300/50 cursor-pointer ${
                i <= waterIntake 
                  ? "bg-gradient-to-b from-cyan-500 to-blue-600" 
                  : "bg-gray-700/30"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={addWaterGlass}
            />
          ))}
        </div>
        <p className="text-center text-gray-300">هدف: 8 لیوان در روز ({waterIntake}/8)</p>
      </div>
    </div>
  );

  const renderFeelingTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-purple-400 mb-4">ثبت حس و حال</h3>
        <form onSubmit={handleSubmit(onSubmitFeeling)} className="space-y-4">
          <div>
            <label className="block text-cyan-300 mb-2">حس و حال امروز (۱-۱۰)</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <motion.div
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 text-center"
                >
                  <input
                    type="radio"
                    id={`feeling-${num}`}
                    value={num}
                    {...register("feeling", { required: true })}
                    className="hidden"
                  />
                  <label 
                    htmlFor={`feeling-${num}`} 
                    className={`block py-2 rounded cursor-pointer ${
                      num <= 3 ? 'bg-red-900/30 hover:bg-red-900/50' :
                      num <= 6 ? 'bg-yellow-900/30 hover:bg-yellow-900/50' :
                      'bg-green-900/30 hover:bg-green-900/50'
                    }`}
                  >
                    {num}
                  </label>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-cyan-300 mb-2">یادداشت‌ها</label>
            <textarea
              placeholder="وزن، پیشرفت، افکار..."
              {...register("notes")}
              className="w-full p-3 rounded bg-gray-700/30 text-white border border-white/10 focus:border-cyan-500 transition-colors"
              rows={3}
            />
          </div>
          
          <motion.button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ثبت احساسات (+10 XP)
          </motion.button>
        </form>
      </div>
      
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-green-400 mb-4">تاریخچه احساسات</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {feelings.slice().reverse().map((f, i) => (
            <motion.div
              key={i}
              className="p-3 rounded-lg flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: f.feeling <= 3 ? 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)' :
                          f.feeling <= 6 ? 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)' :
                          'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)'
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                f.feeling <= 3 ? 'bg-red-600/30' : 
                f.feeling <= 6 ? 'bg-yellow-600/30' : 
                'bg-green-600/30'
              }`}>
                <span className="text-lg">
                  {f.feeling <= 3 ? '😞' : f.feeling <= 6 ? '😐' : '😊'}
                </span>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">{new Date(f.date).toLocaleDateString('fa-IR')}</span>
                  <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">
                    امتیاز: {f.feeling}/10
                  </span>
                </div>
                {f.notes && <p className="text-sm mt-1 text-gray-300">{f.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">پیشرفت ورزشی</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-500/20 text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">{fitnessLevel}</div>
            <div className="text-sm text-purple-200">سطح تناسب اندام</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl border border-green-500/20 text-center">
            <div className="text-3xl font-bold text-green-300 mb-1">{xp}</div>
            <div className="text-sm text-green-200">امتیاز تجربه</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl border border-red-500/20 text-center">
            <div className="text-3xl font-bold text-red-300 mb-1">{workouts.length}</div>
            <div className="text-sm text-red-200">تمرینات تکمیل شده</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-xl border border-amber-500/20 text-center">
            <div className="text-3xl font-bold text-amber-300 mb-1" ref={streakRef}>{streak}</div>
            <div className="text-sm text-amber-200">روز متوالی</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-cyan-300">پیشرفت ماهانه</span>
              <span className="text-sm">75%</span>
            </div>
            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-green-300">دستاوردهای کسب شده</span>
              <span className="text-sm">5/8</span>
            </div>
            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "62.5%" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">نشان‌های افتخار</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "شروع کننده", earned: true, emoji: "🚀" },
            { name: "تسلیم ناپذیر", earned: true, emoji: "💪" },
            { name: "فول استرک", earned: streak >= 7, emoji: "🔥" },
            { name: "حرفه‌ای تغذیه", earned: nutrition.length >= 5, emoji: "🍎" },
          ].map((badge, i) => (
            <motion.div
              key={i}
              className={`p-3 rounded-xl text-center ${
                badge.earned 
                  ? "bg-gradient-to-br from-yellow-900/30 to-amber-800/30 border border-amber-500/50"
                  : "bg-gray-700/30 border border-gray-600/50 opacity-50"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <div className={`text-sm ${badge.earned ? "text-amber-300" : "text-gray-400"}`}>
                {badge.name}
              </div>
              <div className="text-xs mt-1 text-gray-400">
                {badge.earned ? "کسب شده" : "در انتظار"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workout': return renderWorkoutTab();
      case 'nutrition': return renderNutritionTab();
      case 'feeling': return renderFeelingTab();
      case 'progress': return renderProgressTab();
      default: return renderWorkoutTab();
    }
  };

  return (
    <motion.div
      className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ boxShadow: "0 0 40px rgba(0,240,255,0.5)" }}
    >
      {/* Background Particles */}
      <Particles
        init={particlesInit}
        className="absolute inset-0 pointer-events-none opacity-20"
        options={{
          particles: {
            number: { value: 30 },
            color: { value: ["#a855f7", "#8b5cf6", "#6366f1"] },
            size: { value: 3, random: true },
            move: {
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              attract: { enable: true, rotateX: 600, rotateY: 1200 }
            },
            opacity: { value: 0.7, random: true },
            line_linked: {
              enable: true,
              distance: 120,
              color: "#c4b5fd",
              opacity: 0.3,
              width: 1
            },
          },
          interactivity: {
            events: {
              onhover: { 
                enable: true, 
                mode: "repulse",
                parallax: { enable: true, force: 20 }
              }
            }
          }
        }}
      />
      
      {/* Header */}
      <div className="relative z-10">
        <motion.h2
          className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            textShadow: [
              "0 0 10px rgba(0,240,255,0.5)",
              "0 0 20px rgba(0,240,255,0.8)",
              "0 0 10px rgba(0,240,255,0.5)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          برنامه تمرینی و تغذیه ترکیبی
        </motion.h2>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'workout', name: 'تمرینات', emoji: '💪' },
            { id: 'nutrition', name: 'تغذیه', emoji: '🍎' },
            { id: 'feeling', name: 'حس و حال', emoji: '😊' },
            { id: 'progress', name: 'پیشرفت', emoji: '📈' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center justify-center ${
                activeTab === tab.id 
                  ? "bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-400/50" 
                  : "bg-gray-800/50 border border-white/10"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl mb-1">{tab.emoji}</span>
              <span className={`text-sm ${activeTab === tab.id ? "text-cyan-300" : "text-gray-400"}`}>
                {tab.name}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  className="w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mt-1"
                  layoutId="tabIndicator"
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
    </motion.div>
  );
};

export default WorkoutPlan;