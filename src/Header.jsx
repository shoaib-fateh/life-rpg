import React, { useEffect, useRef } from "react";
import CustomButton from "./CustomButton";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const Header = ({
  level,
  coins,
  hp,
  maxHp,
  mana,
  maxMana,
  xp,
  maxXP,
  setShowInventoryModal,
  setShowShopModal,
  badges,
}) => {
  const headerRef = useRef();
  const coinsRef = useRef();
  const xpBarRef = useRef();

  // انیمیشن‌های GSAP
  useEffect(() => {
    // انیمیشن ورودی هدر
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });

    // انیمیشن سکه‌ها
    gsap.to(coinsRef.current, {
      y: -5,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut",
    });

    // انیمیشن پالس XP بار
    gsap.to(xpBarRef.current, {
      boxShadow: "0 0 20px #10b981",
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: "power1.inOut",
    });
  }, []);

  // تابع برای ایجاد افکت موجی در نوارهای پیشرفت
  const getAnimatedGradient = (value, max, colors) => {
    const percentage = Math.min(100, (value / max) * 100);
    return `linear-gradient(90deg, 
      ${colors[0]} 0%, 
      ${colors[1]} ${percentage - 10}%, 
      ${colors[2]} ${percentage}%, 
      rgba(255,255,255,0.1) ${percentage + 5}%, 
      rgba(255,255,255,0.1) 100%)`;
  };

  return (
    <header 
      ref={headerRef}
      className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-b from-gray-900/90 to-gray-800/90 rounded-3xl p-6 mb-8 shadow-2xl border-2 border-white/10 animate-fade-in"
    >
      {/* افکت نور پس‌زمینه */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col space-y-6">
        {/* ردیف اول: عنوان و اطلاعات کاربر */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 drop-shadow-glow tracking-tight">
                VOID RPG
              </h1>
              <span className="text-xs px-2 py-1 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-full text-white font-bold border border-white/10 shadow-glow">
                Lv. {level}
              </span>
            </div>
            
            {/* نشان‌ها با افکت پارالاکس */}
            <div className="flex space-x-2 h-8">
              {badges.map((badgeObj, index) => (
                <div 
                  key={badgeObj.id}
                  className="relative"
                  style={{
                    transform: `translateY(${index % 2 === 0 ? -3 : 3}px)`
                  }}
                >
                  <span className="text-xs bg-gradient-to-br from-purple-600/90 to-blue-600/90 px-3 py-1 rounded-full animate-pulse border border-white/10 shadow-glow flex items-center">
                    <span className="mr-1">{badgeObj.emoji}</span>
                    {badgeObj.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* سکه‌ها با انیمیشن */}
          <div 
            ref={coinsRef}
            className="flex items-center space-x-2 bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 px-4 py-2 rounded-full border border-yellow-500/30 shadow-glow"
          >
            <span className="text-2xl">🪙</span>
            <span className="text-xl font-bold text-yellow-300">{coins}</span>
          </div>
        </div>

        {/* ردیف دوم: نوارهای پیشرفت با افکت موجی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* HP Progress */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-red-400 flex items-center">
                <span className="mr-2">❤️</span> HEALTH
              </span>
              <span className="text-xs font-mono text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                {Math.floor(hp)}/{Math.floor(maxHp)}
              </span>
            </div>
            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md relative">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: getAnimatedGradient(hp, maxHp, ['#ef4444', '#f87171', '#fca5a5'])
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Mana Progress */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-purple-400 flex items-center">
                <span className="mr-2">🔮</span> MANA
              </span>
              <span className="text-xs font-mono text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                {Math.floor(mana)}/{Math.floor(maxMana)}
              </span>
            </div>
            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md relative">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: getAnimatedGradient(mana, maxMana, ['#8b5cf6', '#a78bfa', '#c4b5fd'])
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-green-400 flex items-center">
                <span className="mr-2">✨</span> EXPERIENCE
              </span>
              <span className="text-xs font-mono text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                {xp}/{maxXP}
              </span>
            </div>
            <div 
              ref={xpBarRef}
              className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md relative"
            >
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: getAnimatedGradient(xp, maxXP, ['#10b981', '#34d399', '#6ee7b7'])
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* ردیف سوم: دکمه‌های تعاملی */}
        <div className="flex justify-end space-x-4 pt-2">
          <CustomButton
            variant="primary"
            onClick={() => setShowInventoryModal(true)}
            className="px-8 py-3 text-lg group"
          >
            <span className="flex items-center transform group-hover:-translate-y-0.5 transition-transform">
              <span className="mr-3 text-xl">🎒</span> 
              <span>Inventory</span>
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </span>
          </CustomButton>
          
          <CustomButton
            variant={level >= 4 ? "secondary" : "danger"}
            onClick={() => level >= 4 && setShowShopModal(true)}
            disabled={level < 4}
            className="px-8 py-3 text-lg group relative overflow-hidden"
          >
            <span className="flex items-center transform group-hover:-translate-y-0.5 transition-transform relative z-10">
              <span className="mr-3 text-xl">🛒</span> 
              {level >= 4 ? (
                <>
                  <span>Arcane Shop</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                </>
              ) : (
                <span>Unlocks at Lvl 4</span>
              )}
            </span>
            {level < 4 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            )}
          </CustomButton>
        </div>
      </div>

      {/* افکت‌های اضافی */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30"></div>
    </header>
  );
};

export default Header;