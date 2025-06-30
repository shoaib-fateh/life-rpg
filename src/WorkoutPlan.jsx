import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { supabase } from "./App";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import CustomButton from "./CustomButton";
import CustomCalendar from "./CustomCalendar";

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
  setBadges,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [feelings, setFeelings] = useState([]);
  const [activeTab, setActiveTab] = useState("workout");
  const [streak, setStreak] = useState(0);
  const [fitnessLevel, setFitnessLevel] = useState(1);
  const { register, handleSubmit, reset } = useForm();
  const particlesInit = async (main) => await loadFull(main);
  const workoutRef = useRef(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [goals, setGoals] = useState([
    { id: 1, name: "Body Fat", emoji: "🔥", current: "20%", target: "16-17%" },
    { id: 2, name: "Waist Size", emoji: "📏", current: "90cm", target: "83cm" },
    { id: 3, name: "Arm Size", emoji: "💪", current: "32cm", target: "33.5cm" },
    { id: 4, name: "Chest Size", emoji: "🏋️", current: "92cm", target: "96cm" },
  ]);

  const workoutPlan = {
    month1: {
      session1: [
        { id: 1, name: "Warm-up", desc: "5-10 min fast treadmill walk", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 2, name: "Barbell Squat", desc: "3 sets x 8-10 reps (light weight, focus on form)", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 3, name: "Bench Press", desc: "3 sets x 8-10 reps (slow to chest)", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 4, name: "Lat Pulldown", desc: "3 sets x 10 reps (elbows by side)", xp: 20, image: "https://via.placeholder.com/64" },
        { id: 5, name: "Plank", desc: "3 sets x 30 sec", xp: 15, image: "https://via.placeholder.com/64" },
        { id: 6, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
      session2: [
        { id: 7, name: "Warm-up", desc: "5-10 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 8, name: "Deadlift", desc: "3 sets x 6-8 reps (medium weight, straight back)", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 9, name: "Lateral Raise", desc: "3 sets x 10 reps", xp: 20, image: "https://via.placeholder.com/64" },
        { id: 10, name: "Tricep Pushdown", desc: "3 sets x 10-12 reps", xp: 20, image: "https://via.placeholder.com/64" },
        { id: 11, name: "Crunch", desc: "3 sets x 15 reps", xp: 15, image: "https://via.placeholder.com/64" },
        { id: 12, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
    },
    month2: {
      session1: [
        { id: 13, name: "Warm-up", desc: "5-10 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 14, name: "Barbell Squat", desc: "4 sets x 8-10 reps (heavier weight)", xp: 30, image: "https://via.placeholder.com/64" },
        { id: 15, name: "Dumbbell Bench Press", desc: "4 sets x 10 reps (more variety)", xp: 30, image: "https://via.placeholder.com/64" },
        { id: 16, name: "Bent-over Row", desc: "3 sets x 8-10 reps", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 17, name: "Side Plank", desc: "3 sets x 20 sec per side", xp: 20, image: "https://via.placeholder.com/64" },
        { id: 18, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
      session2: [
        { id: 19, name: "Warm-up", desc: "5-10 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 20, name: "Deadlift", desc: "4 sets x 6-8 reps (heavier weight)", xp: 30, image: "https://via.placeholder.com/64" },
        { id: 21, name: "Front Raise", desc: "3 sets x 12 reps", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 22, name: "Tricep Kickback", desc: "3 sets x 12 reps", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 23, name: "Mountain Climber", desc: "3 sets x 30 sec", xp: 20, image: "https://via.placeholder.com/64" },
        { id: 24, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
    },
    month3: {
      session1: [
        { id: 25, name: "Warm-up", desc: "5-10 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 26, name: "Superset: Squat + Lunge", desc: "3 sets x 12 reps + 3 sets x 12 reps (30 sec rest)", xp: 35, image: "https://via.placeholder.com/64" },
        { id: 27, name: "Dumbbell Bench Press", desc: "3 sets x 12 reps", xp: 30, image: "https://via.placeholder.com/64" },
        { id: 28, name: "Plank", desc: "3 sets x 45 sec", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 29, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
      session2: [
        { id: 30, name: "Warm-up", desc: "5-10 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
        { id: 31, name: "Deadlift", desc: "4 sets x 6-8 reps (heavy weight)", xp: 35, image: "https://via.placeholder.com/64" },
        { id: 32, name: "Dumbbell Curl", desc: "3 sets x 12 reps", xp: 30, image: "https://via.placeholder.com/64" },
        { id: 33, name: "Bicycle Crunch", desc: "3 sets x 20 reps", xp: 25, image: "https://via.placeholder.com/64" },
        { id: 34, name: "Cool-down", desc: "5 min treadmill", xp: 10, image: "https://via.placeholder.com/64" },
      ],
    },
  };

  const nutritionPlan = [
    { id: 1, emoji: "🍽️", title: "Lunch", content: "3 slices of bread + 1 apple slice (4 days/week) / Workout days: 1 boiled egg (2-3 hrs before)" },
    { id: 2, emoji: "🌙", title: "Dinner", content: "1-1.5 cups white rice + some oil / Workout days: more oil for recovery" },
    { id: 3, emoji: "🍎", title: "Snack", content: "Dry bread or apple (if hungry)" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: workoutData } = await supabase.from("workouts").select("*").eq("user_id", userId);
      setWorkouts(workoutData || []);

      const { data: nutritionData } = await supabase.from("nutrition").select("*").eq("user_id", userId);
      setNutrition(nutritionData || []);

      const { data: feelingsData } = await supabase.from("feelings").select("*").eq("user_id", userId);
      setFeelings(feelingsData || []);

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

  const onDateChange = (date) => setSelectedDate(date);

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
    setXp(xp + 10);
    setHp(Math.min(maxHp, hp + maxHp * 0.1));
    addNotification("Feeling logged! +10 XP", "success");
  };

  const completeExercise = async (exercise) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const isCompleted = completedExercises[`${dateKey}-${exercise.id}`];
    if (isCompleted) {
      addNotification("This exercise is already completed", "warning");
      return;
    }
    setCompletedExercises(prev => ({ ...prev, [`${dateKey}-${exercise.id}`]: true }));
    setXp(xp + exercise.xp);
    setHp(Math.min(maxHp, hp + maxHp * 0.1));
    setMana(Math.min(maxMana, mana + maxMana * 0.1));
    confetti({ particleCount: Math.floor(exercise.xp / 5), spread: 70, origin: { y: 0.6 } });
    addNotification(`Exercise "${exercise.name}" completed!`, "success");
  };

  const completeWorkout = async () => {
    const dayWorkouts = getWorkoutsForDate(selectedDate);
    const dateKey = selectedDate.toISOString().split('T')[0];
    const allCompleted = dayWorkouts.every(ex => completedExercises[`${dateKey}-${ex.id}`]);
    if (!allCompleted) {
      addNotification("Please complete all exercises first", "warning");
      return;
    }
    await supabase.from("workouts").insert({
      user_id: userId,
      date: selectedDate.toISOString(),
      description: "Daily workout completed",
    });
    setWorkouts([...workouts, { date: selectedDate.toISOString(), description: "Daily workout completed" }]);
    setXp(xp + 50);
    setHp(Math.min(maxHp, hp + maxHp * 0.7));
    setMana(Math.min(maxMana, mana + maxMana * 0.7));
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    addNotification("Daily workout completed! +50 XP", "success");
    if (xp + 50 >= fitnessLevel * 100) {
      setFitnessLevel(fitnessLevel + 1);
      setBadges([...badges, { id: `fitness-level-${fitnessLevel + 1}`, emoji: "💪", badge: `Fitness Level ${fitnessLevel + 1}` }]);
      addNotification(`Fitness level up! Level ${fitnessLevel + 1}`, "level");
    }
  };

  const getWorkoutsForDate = (date) => {
    const month = Math.floor((date.getMonth() + 1) / 3) + 1;
    const day = date.getDay();
    const plan = workoutPlan[`month${month}`];
    return day === 2 || day === 4 || day === 6 ? plan.session1 : plan.session2;
  };

  const addWaterGlass = () => {
    if (waterIntake < 8) {
      setWaterIntake(waterIntake + 1);
      addNotification("Added a glass of water! Stay hydrated", "info");
    }
  };

  const renderWorkoutTab = () => (
    <div className="space-y-6">
      <CustomCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-green-400 mb-4">
          Exercises for {selectedDate.toLocaleDateString('en-US')}
        </h3>
        <ul className="space-y-4">
          {getWorkoutsForDate(selectedDate).map((exercise, index) => (
            <li key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center">
                <img src={exercise.image} alt={exercise.name} className="w-16 h-16 rounded-lg mr-4" />
                <div>
                  <h4 className="text-cyan-300 font-bold">{exercise.name}</h4>
                  <p className="text-sm text-gray-300">{exercise.desc}</p>
                </div>
              </div>
              <CustomButton
                variant="primary"
                onClick={() => completeExercise(exercise)}
                className="px-4 py-2"
              >
                Complete
              </CustomButton>
            </li>
          ))}
        </ul>
        <CustomButton
          variant="primary"
          onClick={completeWorkout}
          className="w-full mt-4 py-3 text-lg"
        >
          Complete Workout
        </CustomButton>
      </div>
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-purple-400 mb-4">Fitness Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              className="p-4 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-xl border border-white/10"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{goal.emoji}</span>
                <div>
                  <h4 className="font-bold text-cyan-300">{goal.name}</h4>
                  <p className="text-sm text-gray-300">Current: {goal.current} | Target: {goal.target}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNutritionTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">Nutrition Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nutritionPlan.map((item) => (
            <motion.div
              key={item.id}
              className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-xl border border-amber-500/20"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{item.emoji}</span>
                <strong className="text-amber-300">{item.title}</strong>
              </div>
              <p className="text-sm text-gray-300">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Water Intake</h3>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                className={`w-10 h-10 m-1 rounded-full border-2 flex items-center justify-center ${
                  i <= waterIntake
                    ? "bg-gradient-to-b from-cyan-500 to-blue-600 border-cyan-300"
                    : "bg-gray-700/30 border-gray-500"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={addWaterGlass}
              >
                <span>🥤</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-300">
            Goal: 8 glasses per day ({waterIntake}/8)
          </p>
        </div>
      </div>
    </div>
  );

  const renderFeelingTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-purple-400 mb-4">Log Your Feelings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-cyan-300 mb-2">How are you feeling today?</label>
            <div className="grid grid-cols-5 gap-2">
              {["😭", "😢", "😞", "😐", "🙂", "😊", "😄", "🥰", "😍", "🤩"].map((emoji, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-center"
                >
                  <input
                    type="radio"
                    id={`feeling-${index + 1}`}
                    value={index + 1}
                    {...register("feeling", { required: true })}
                    className="hidden"
                  />
                  <label
                    htmlFor={`feeling-${index + 1}`}
                    className="block py-3 rounded-lg cursor-pointer text-2xl"
                  >
                    {emoji}
                  </label>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-cyan-300 mb-2">Notes</label>
            <textarea
              placeholder="Write your thoughts..."
              {...register("notes")}
              className="w-full p-3 rounded-lg bg-gray-700/30 text-white border border-white/10 focus:border-cyan-500 transition-colors backdrop-blur-sm"
              rows={3}
            />
          </div>
          <CustomButton
            variant="primary"
            onClick={handleSubmit(onSubmitFeeling)}
            className="w-full py-3 text-lg"
          >
            Save Feelings
          </CustomButton>
        </div>
      </div>
      <div className="backdrop-blur-md bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-bold text-green-400 mb-4">Feelings History</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {feelings.slice().reverse().map((f, i) => (
            <motion.div
              key={i}
              className="p-3 rounded-lg flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background:
                  f.feeling <= 3
                    ? "linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)"
                    : f.feeling <= 6
                    ? "linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)"
                    : "linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)",
              }}
            >
              <div className="text-2xl mr-3">
                {f.feeling <= 3 ? "😞" : f.feeling <= 6 ? "😐" : "😊"}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {new Date(f.date).toLocaleDateString("en-US")}
                  </span>
                  <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">
                    Score: {f.feeling}/10
                  </span>
                </div>
                {f.notes && (
                  <p className="text-sm mt-2 text-gray-300">{f.notes}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "workout": return renderWorkoutTab();
      case "nutrition": return renderNutritionTab();
      case "feeling": return renderFeelingTab();
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
              attract: { enable: true, rotateX: 600, rotateY: 1200 },
            },
            opacity: { value: 0.7, random: true },
            line_linked: {
              enable: true,
              distance: 120,
              color: "#c4b5fd",
              opacity: 0.3,
              width: 1,
            },
          },
          interactivity: {
            events: {
              onhover: {
                enable: true,
                mode: "repulse",
                parallax: { enable: true, force: 20 },
              },
            },
          },
        }}
      />
      <div className="relative z-10">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-[linear-gradient(90deg,#a855f7,#8b5cf6,#6366f1)] tracking-tighter"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            textShadow: [
              "0 0 15px rgba(168,85,247,0.5)",
              "0 0 30px rgba(139,92,246,0.8)",
              "0 0 15px rgba(168,85,247,0.5)",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            textShadow: { duration: 3, repeat: Infinity },
          }}
        >
          Workout & Nutrition Plan
        </motion.h2>
        <div className="flex gap-2 mb-6">
          {[
            { id: "workout", name: "Workouts", emoji: "💪" },
            { id: "nutrition", name: "Nutrition", emoji: "🍎" },
            { id: "feeling", name: "Feelings", emoji: "😊" },
          ].map((tab) => (
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
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
    </motion.div>
  );
};

export default WorkoutPlan;