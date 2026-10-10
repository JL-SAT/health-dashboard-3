import React, { useState, useMemo } from 'react';
import HeartbeatIcon from './components/icons/HeartbeatIcon';
import BloodPressureIcon from './components/icons/BloodPressureIcon';
import AppointmentsIcon from './components/icons/AppointmentsIcon';
import CameraIcon from './components/icons/CameraIcon';
import ShareIcon from './components/icons/ShareIcon';
import ReportIcon from './components/icons/ReportIcon';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useI18n } from './i18n/index';
import { PulseTrendGraph } from './components/PulseTrendGraph';

import companionImg from './src/assets/images/portfolio_mobile_companion_1791610283074.jpg';

interface LandingPageProps {
  onGetStarted: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  theme,
  onToggleTheme,
}) => {
  const { language } = useI18n();
  const isThai = language === 'th';

  // Easy interactive blood pressure simulator for seniors and families
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(72);

  const statusInfo = useMemo(() => {
    if (systolic >= 160 || diastolic >= 100) {
      return {
        badgeText: isThai ? '🔴 สูงมาก (ต้องระวัง)' : '🔴 Very High — Please Rest',
        badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        title: isThai ? 'ความดันสูงมาก ควรพักผ่อนและแจ้งคนใกล้ชิด' : 'Blood pressure is very high today',
        advice: isThai
          ? 'ให้นั่งพักเงียบๆ หายใจลึกๆ 10-15 นาที แล้วลองวัดซ้ำ หากรู้สึกเวียนหัว แน่นหน้าอก หรือไม่ดีขึ้น ให้รีบบอกลูกหลานหรือโทรปรึกษาแพทย์ทันที'
          : 'Sit down, relax, and take deep breaths. Rest for 10-15 minutes and check again. If you feel dizzy or have chest pain, let your family or doctor know right away.',
      };
    }
    if (systolic >= 140 || diastolic >= 90) {
      return {
        badgeText: isThai ? '🟠 ค่อนข้างสูง' : '🟠 Elevated — Keep an Eye on It',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        title: isThai ? 'ความดันเริ่มสูงกว่าปกติเล็กน้อย' : 'A bit higher than normal',
        advice: isThai
          ? 'จดบันทึกไว้ในแอป อย่าลืมทานยาประจำตามที่แพทย์สั่ง ลดอาหารเค็ม ดื่มน้ำเปล่า และเตรียมแจ้งแพทย์ในการตรวจครั้งต่อไป'
          : 'Save this in your log. Remember to take prescribed medicines on time, drink clean water, eat less salty food, and mention this at your next clinic visit.',
      };
    }
    if (systolic >= 120 && diastolic < 80) {
      return {
        badgeText: isThai ? '🟡 เกณฑ์เฝ้าระวัง' : '🟡 Mildly Elevated',
        badgeBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800',
        title: isThai ? 'ความดันอยู่ในระดับเกือบปกติ' : 'Close to normal',
        advice: isThai
          ? 'ดูแลสุขภาพทั่วไป เดินออกกำลังกายเบาๆ พักผ่อนให้เพียงพอ และวัดความดันเป็นประจำสม่ำเสมอ'
          : 'Good shape overall! Keep up light daily walks, get plenty of comfortable sleep, and keep measuring regularly.',
      };
    }
    return {
      badgeText: isThai ? '🟢 ปกติ สุขภาพดี' : '🟢 Normal & Great!',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      title: isThai ? 'ค่าความดันและชีพจรอยู่ในเกณฑ์ดีมาก' : 'Great readings! Everything looks healthy',
      advice: isThai
        ? 'ร่างกายแข็งแรง สบายใจได้ครับ รักษาสุขภาพและรับประทานอาหารที่มีประโยชน์แบบนี้ต่อไป'
        : 'Your numbers look wonderful and balanced. Keep smiling, stay hydrated, and continue your healthy daily routine!',
    };
  }, [systolic, diastolic, isThai]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-50 dark:bg-neutral-950 text-stone-800 dark:text-neutral-200 font-sans transition-colors duration-200">
      {/* Embedded style to ensure no scrollbars are shown vertically or horizontally */}
      <style>{`
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      {/* =========================================================================
          TOP STICKY BAR: Compact, perfectly aligned, NO horizontal overflow
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full max-w-full bg-stone-50/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <a
            href="#top"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white shrink-0 group focus:outline-none"
          >
            <span className="text-red-500 transition-transform group-hover:scale-110">
              <HeartbeatIcon />
            </span>
            <span>Blood Buddy</span>
          </a>

          {/* Quick Nav for desktop */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-neutral-400">
            <a href="#how-it-works" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {isThai ? 'วิธีใช้งาน' : 'How It Helps'}
            </a>
            <a href="#try-checker" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {isThai ? 'ลองตรวจค่าความดัน' : 'Simple BP Checker'}
            </a>
            <a href="#mom-experience" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {isThai ? 'เรื่องจริงจากคุณแม่' : "Mom's Story & Proof"}
            </a>
            <a href="#about-project" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {isThai ? 'เกี่ยวกับ Blood Buddy' : 'About'}
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={onGetStarted}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm hover:shadow transition-all shrink-0"
            >
              {isThai ? 'เข้าสู่ระบบ' : 'Go to App'}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: Warm, simple, senior & family friendly
         ========================================================================= */}
      <section id="top" className="pt-8 pb-14 sm:pt-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Friendly Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium mb-5">
            <span>❤️</span>
            <span>
              {isThai
                ? 'ใช้งานง่ายเป็นพิเศษสำหรับผู้สูงอายุ และเปิดกว้างสำหรับทุกคน'
                : 'Thoughtfully designed for seniors — easy and accessible for everyone'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
            {isThai ? (
              <>
                จดความดันและชีพจรได้ง่ายๆ <br className="hidden sm:inline" />
                <span className="text-red-600 dark:text-red-500">ไม่ต้องกังวลเรื่องตัวเลขยากๆ</span>
              </>
            ) : (
              <>
                Track Blood Pressure & Pulse <br className="hidden sm:inline" />
                <span className="text-red-600 dark:text-red-500">Easily, Without Any Complicated Steps</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {isThai
              ? 'ออกแบบให้อ่านง่าย ตัวหนังสือใหญ่ สบายตา แค่ใช้มือถือถ่ายรูปหน้าจอเครื่องวัดความดัน แอปก็อ่านค่าให้ทันที ไม่ต้องพิมพ์เอง ลูกหลานและคุณหมอก็เปิดดูได้สบาย'
              : 'Built with big readable text and high contrast. Take a quick photo of your blood pressure monitor and it fills in automatically — no typing needed. Share easily with kids and doctors.'}
          </p>

          {/* Big Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 text-base font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isThai ? 'เข้าใช้งานแอปพลิเคชัน →' : 'Launch Application →'}
            </button>
            <a
              href="#try-checker"
              className="px-5 py-3.5 text-sm sm:text-base font-semibold text-stone-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-stone-300 dark:border-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              {isThai ? 'ทดลองดูค่าความดันจำลอง' : 'Try Simple BP Helper'}
            </a>
          </div>

          {/* 3 Quick highlights */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <p className="font-bold text-sm text-stone-900 dark:text-white">
                  {isThai ? 'ถ่ายรูปแทนพิมพ์' : 'Snap a Photo'}
                </p>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                  {isThai ? 'ถ่ายหน้าจอเครื่องวัด ความดันก็เข้าแอป' : 'Reads monitor numbers automatically'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex items-start gap-3">
              <span className="text-2xl">👓</span>
              <div>
                <p className="font-bold text-sm text-stone-900 dark:text-white">
                  {isThai ? 'ตัวหนังสือใหญ่ อ่านชัด' : 'Big & Clear Text'}
                </p>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                  {isThai ? 'สบายตา ไม่ต้องเพ่ง สีแยกสถานะชัดเจน' : 'High contrast so elders see easily'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex items-start gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="font-bold text-sm text-stone-900 dark:text-white">
                  {isThai ? 'แชร์ให้ลูกหรือหมอ' : 'Share with Family'}
                </p>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                  {isThai ? 'ส่งลิงก์ดูได้ทันที หรือพิมพ์เป็นกระดาษ' : 'One link or clean printable page'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: HOW IT HELPS (Visual & Friendly)
         ========================================================================= */}
      <section id="how-it-works" className="py-12 bg-white dark:bg-neutral-900/60 border-y border-stone-200 dark:border-neutral-800 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
              {isThai ? 'ฟังก์ชันที่ช่วยให้ชีวิตประจำวันง่ายขึ้น' : 'Features Designed for Real Everyday Life'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-neutral-400">
              {isThai
                ? 'ไม่ต้องกังวลเรื่องสมุดจดหาย หรือลืมว่าต้องถามอะไรคุณหมอ'
                : 'No more lost paper notebooks or forgetting what the doctor said'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <CameraIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {isThai ? '1. สแกนจากภาพถ่าย (AI Camera)' : '1. Photo Scan (AI Camera)'}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                  {isThai
                    ? 'ผู้สูงอายุส่วนใหญ่มือสั่นหรือสายตาไม่เอื้อต่อการกดแป้นพิมพ์ แค่ถ่ายรูปหน้าจอเครื่องวัดความดัน (เช่น Omron) ระบบจะดึงค่าบน ค่าล่าง และชีพจรใส่ตารางให้เอง'
                    : 'Typing small numbers on mobile screens can be hard for shaky fingers. Just snap a photo of the monitor LCD; AI reads systolic, diastolic, and pulse automatically.'}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <AppointmentsIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {isThai ? '2. สมุดนัดหมายพบแพทย์ (Doctor Visits)' : '2. Doctor Appointment Book'}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                  {isThai
                    ? 'ช่วยจดวันที่นัด โรงพยาบาล และชื่อคุณหมอ มีช่องให้เขียน "คำถามที่อยากถามหมอ" ไว้ล่วงหน้า และจด "คำแนะนำที่หมอบอก" พร้อมแนบรูปใบสั่งยาได้'
                    : 'Record clinic dates, hospital names, and doctors. Keep questions you want to ask in advance, and save doctor notes or prescription slips so nothing gets lost.'}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShareIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {isThai ? '3. แชร์ลิงก์ให้ลูกหลานดู (Easy Sharing)' : '3. Share with Family or Clinic'}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                  {isThai
                    ? 'สร้างลิงก์ส่งทาง LINE ให้ลูกหลานได้สบายๆ คนเปิดดูไม่ต้องสมัครสมาชิก ไม่ต้องโหลดแอป แค่คลิกก็เห็นประวัติความดันได้ทันที'
                    : 'Send a quick link via chat or messaging. Family members or doctors can open and view the log immediately without needing to sign up or install any app.'}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ReportIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {isThai ? '4. สร้างรายงานพิมพ์ไปหาหมอ (PDF Print)' : '4. Printable Medical Summary (PDF)'}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                  {isThai
                    ? 'กดปุ่มเดียว ได้ใบสรุปความดันย้อนหลังแบบกระดาษ PDF ตัวหนังสือใหญ่ คุณหมอสามารถกวาดสายตาดูแนวโน้มทั้งสัปดาห์หรือทั้งเดือนได้ใน 30 วินาที'
                    : 'Download a clean, one-page PDF summary for the week or month. Hand it directly to your doctor during consultations for instant review.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FRIENDLY INTERACTIVE BP HELPER
         ========================================================================= */}
      <section id="try-checker" className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {isThai ? 'ทดลองใช้งาน' : 'Interactive Helper'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              {isThai ? 'ทำความเข้าใจค่าความดันแบบง่ายๆ' : 'Understand Your Blood Pressure Numbers'}
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-neutral-400">
              {isThai
                ? 'ลองเลื่อนแถบตัวเลขดูครับ ว่าความดันของคุณพ่อคุณแม่อยู่ในเกณฑ์ใด'
                : 'Slide the numbers below to see clear, friendly advice for each reading'}
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 shadow-sm">
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-stone-500 dark:text-neutral-400">
                {isThai ? 'กดเลือกตัวอย่างได้เลย:' : 'Quick Examples:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSystolic(118); setDiastolic(78); setPulse(70); }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  {isThai ? '118/78 (ปกติ)' : '118/78 (Normal)'}
                </button>
                <button
                  onClick={() => { setSystolic(135); setDiastolic(86); setPulse(75); }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                >
                  {isThai ? '135/86 (เริ่มสูง)' : '135/86 (Elevated)'}
                </button>
                <button
                  onClick={() => { setSystolic(165); setDiastolic(102); setPulse(84); }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                >
                  {isThai ? '165/102 (สูงมาก)' : '165/102 (High)'}
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-semibold text-stone-800 dark:text-neutral-200">
                    {isThai ? 'ค่าตัวบน (Systolic)' : 'Upper Number (Systolic)'}
                  </span>
                  <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">
                    {systolic} <span className="text-xs font-normal text-stone-500">mmHg</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="190"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-200 dark:bg-neutral-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-semibold text-stone-800 dark:text-neutral-200">
                    {isThai ? 'ค่าตัวล่าง (Diastolic)' : 'Lower Number (Diastolic)'}
                  </span>
                  <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">
                    {diastolic} <span className="text-xs font-normal text-stone-500">mmHg</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="120"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-200 dark:bg-neutral-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-semibold text-stone-800 dark:text-neutral-200">
                    {isThai ? 'ชีพจร / อัตราเต้นหัวใจ' : 'Pulse (Heart Rate)'}
                  </span>
                  <span className="text-lg font-bold font-mono text-stone-800 dark:text-neutral-200">
                    {pulse} <span className="text-xs font-normal text-stone-500">ครั้ง/นาที</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-200 dark:bg-neutral-700 rounded-lg accent-stone-700 dark:accent-neutral-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Result Card */}
            <div className="mt-8 p-5 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.badgeBg}`}>
                  {statusInfo.badgeText}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-white">
                  {systolic} / {diastolic} <span className="text-xs font-normal text-stone-500">mmHg</span>
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-stone-900 dark:text-white">
                {statusInfo.title}
              </h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                {statusInfo.advice}
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {isThai ? 'เริ่มบันทึกค่าความดันจริงของคุณ →' : 'Start Recording in App →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: TESTIMONIAL & PROOF OF REAL USAGE (Mom's 1+ Year Experience)
         ========================================================================= */}
      <section id="mom-experience" className="py-14 bg-stone-100/70 dark:bg-neutral-900/40 border-t border-stone-200 dark:border-neutral-800 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {isThai ? 'เรื่องจริงจากผู้ใช้งานในครอบครัว' : 'Real-Life Experience · Verified Daily Usage'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              {isThai ? 'ผ่านการใช้งานจริงกว่า 1 ปีเต็ม โดยคุณแม่' : 'Tested & Loved by My Mom for Over a Year'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {isThai
                ? 'ไม่ใช่แค่ตัวอย่างทดลอง แต่เป็นระบบที่คุณแม่ใช้บันทึกความดันและชีพจรจริงทุกวันทั้งเช้าและเย็น และใช้รายงานคุณหมอทุกครั้งที่ไปตรวจ'
                : 'Not just a prototype — this is the actual system my mother has used every morning and evening to log her vitals and share records with her doctor.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Testimonial Quote Column (6 cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-5 text-stone-200/60 dark:text-neutral-800/60 text-7xl font-serif select-none pointer-events-none leading-none">
                “
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {isThai ? '✓ ผู้ใช้งานจริง 1 ปีเต็ม' : '✓ Verified 1-Year User'}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-neutral-400">
                    {isThai ? 'บันทึกเป็นประจำทุกวัน' : 'Daily Home Monitor'}
                  </span>
                </div>

                <blockquote className="text-base sm:text-lg text-stone-800 dark:text-neutral-100 font-medium leading-relaxed italic">
                  {isThai ? (
                    '“แม่ใช้ Blood Buddy มาปีกว่าแล้วค่ะ สะดวกกว่าการจดลงสมุดกระดาษเยอะมาก ไม่ต้องมานั่งเพ่งตัวเลขเล็กๆ แล้วค่อยๆ เขียน แค่ถ่ายรูปเครื่องวัดความดันก็บันทึกให้หมด เวลาไปหาหมอก็เปิดมือถือให้คุณหมอดูได้ทันที สำหรับใครที่กำลังมองหาตัวช่วยบันทึกความดันและชีพจรที่ใช้ง่าย ไม่ยุ่งยาก แนะนำเลยค่ะ ตัวนี้ตอบโจทย์จริงๆ”'
                  ) : (
                    '“I’ve been using Blood Buddy for over a year now, and it has completely replaced my old paper booklets. Taking a quick photo is so much simpler than squinting at tiny numbers and writing them down with a pen. Whenever I visit my doctor, I just open my phone or hand over the printed summary — no more forgotten notes or misplaced sheets. To anyone looking for an effortless way to keep track of their blood pressure and pulse, this is truly the one.”'
                  )}
                </blockquote>
              </div>

              {/* Attribution */}
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-sm shadow-sm">
                    Mom
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900 dark:text-white">
                      {isThai ? 'คุณแม่ (Primary User)' : 'Mom (Primary Daily User)'}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-neutral-400">
                      {isThai ? 'วัดความดันเช้า-เย็นเป็นประจำ · กรุงเทพฯ' : 'Daily Morning & Evening Logging · Bangkok'}
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    853 Readings
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-neutral-400">
                    {isThai ? 'บันทึกจริงทั้งหมด' : 'Logged to date'}
                  </p>
                </div>
              </div>
            </div>

            {/* Proof of Usage & Real Tracking Column (6 cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      {isThai ? 'สถิติการใช้งานจริงของคุณแม่' : "Mom's Real Tracking Activity"}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 dark:text-neutral-400">
                    {isThai ? 'ข้อมูลไม่ระบุตัวตน (De-identified)' : 'Anonymized Database Records'}
                  </span>
                </div>

                {/* 3 Metric counters */}
                <div className="grid grid-cols-3 gap-2 py-4">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/70 dark:border-neutral-800 text-center">
                    <p className="text-xl sm:text-2xl font-black font-mono text-red-600 dark:text-red-400">
                      853
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">
                      {isThai ? 'ครั้งที่บันทึกแล้ว' : 'Total Readings'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/70 dark:border-neutral-800 text-center">
                    <p className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-white">
                      Oct 2025
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">
                      {isThai ? 'เริ่มบันทึกครั้งแรก' : 'First Recorded'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/70 dark:border-neutral-800 text-center">
                    <p className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      12+
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">
                      {isThai ? 'เดือนต่อเนื่อง' : 'Months Consistent'}
                    </p>
                  </div>
                </div>

                {/* Real Recent Log Samples Feed */}
                <div className="space-y-2.5 mt-1">
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">
                    {isThai ? 'ตัวอย่างประวัติการวัดจริงของคุณแม่ (ค่าเสถียรในเกณฑ์ดี)' : "Sample Historical Logs from Mom's Records:"}
                  </p>

                  {/* Sample 1: Real entry from October 2025 */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        BP
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-stone-900 dark:text-white text-sm">107 / 70</span>
                          <span className="text-[11px] text-stone-500">mmHg</span>
                          <span className="text-stone-300 dark:text-neutral-700">·</span>
                          <span className="text-stone-700 dark:text-neutral-300">89 bpm</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-neutral-400">
                          {isThai ? '30 ต.ค. 2025 · บันทึกช่วงเริ่มต้นการใช้งาน' : 'Oct 30, 2025 · Early baseline measurement'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isThai ? 'ปกติ' : 'Normal'}
                    </span>
                  </div>

                  {/* Sample 2: Real typical measurement */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        BP
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-stone-900 dark:text-white text-sm">106 / 65</span>
                          <span className="text-[11px] text-stone-500">mmHg</span>
                          <span className="text-stone-300 dark:text-neutral-700">·</span>
                          <span className="text-stone-700 dark:text-neutral-300">82 bpm</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-neutral-400">
                          {isThai ? 'การวัดสม่ำเสมอประจำวัน · สแกนด้วยกล้องมือถือ' : 'Routine home check · Photo scan verified'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isThai ? 'ปกติ' : 'Normal'}
                    </span>
                  </div>

                  {/* Sample 3: Real recent entry */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-neutral-950 border border-stone-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        BP
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-stone-900 dark:text-white text-sm">110 / 74</span>
                          <span className="text-[11px] text-stone-500">mmHg</span>
                          <span className="text-stone-300 dark:text-neutral-700">·</span>
                          <span className="text-stone-700 dark:text-neutral-300">89 bpm</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-neutral-400">
                          {isThai ? 'บันทึกล่าสุด · สุขภาพหัวใจและหลอดเลือดเสถียร' : 'Recent reading · Consistent cardiovascular health'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isThai ? 'ปกติ' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-neutral-400">
                <span>{isThai ? 'เริ่มบันทึกตั้งแต่ ต.ค. 2025 · รวม 853 ครั้ง' : 'Continuous records since Oct 2025 · 853 entries'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {isThai ? '🔒 ข้อมูลปลอดภัย 100%' : '🔒 100% Privacy Safe'}
                </span>
              </div>
            </div>
          </div>

          {/* Real 12-Month Average Pulse Trend Graph */}
          <div className="mt-6">
            <PulseTrendGraph isThai={isThai} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ABOUT (Why Blood Buddy Was Created)
         ========================================================================= */}
      <section id="about-project" className="py-12 bg-white dark:bg-neutral-900/60 border-t border-stone-200 dark:border-neutral-800 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                {isThai ? 'ทำไมถึงสร้าง Blood Buddy ขึ้นมา?' : 'Why Blood Buddy Was Created'}
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-neutral-300 leading-relaxed">
                {isThai
                  ? 'เห็นคนในครอบครัวและผู้สูงอายุต้องพกสมุดจดความดันเล่มเล็กๆ ไปโรงพยาบาล แต่บ่อยครั้งลืมจด ลืมสมุด หรือจำไม่ได้ว่าคุณหมอสั่งอะไรไว้ จึงตั้งใจพัฒนาเว็บแอปนี้ขึ้นมาให้ใช้งานง่ายที่สุดสำหรับทุกคน โดยเฉพาะผู้สูงอายุ ใช้ภาพถ่ายแทนการพิมพ์ และส่งต่อข้อมูลให้คุณหมอได้สะดวก'
                  : 'I saw my elderly family members struggle with paper health booklets — lost notes, forgotten questions, and missed readings. I built Blood Buddy to solve this real daily problem with clean, accessible design so anyone can track their health comfortably.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-stone-500 dark:text-neutral-400">
                <span className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-stone-200 dark:border-neutral-700">React 19 & TypeScript</span>
                <span className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-stone-200 dark:border-neutral-700">Supabase Auth & DB</span>
                <span className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-stone-200 dark:border-neutral-700">Gemini Camera OCR</span>
                <span className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-stone-200 dark:border-neutral-700">Bilingual TH / EN</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-all whitespace-nowrap"
              >
                {isThai ? 'เข้าสู่หน้าล็อกอิน / สมัคร' : 'Login / Register'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUIET, COMPACT FOOTER
         ========================================================================= */}
      <footer className="py-8 bg-stone-100 dark:bg-neutral-950 border-t border-stone-200 dark:border-neutral-800 text-xs text-stone-500 dark:text-neutral-400 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-red-500"><HeartbeatIcon /></span>
            <span className="font-bold text-stone-800 dark:text-neutral-200">Blood Buddy</span>
            <span>·</span>
            <span>{isThai ? 'เพื่อนคู่ใจด้านสุขภาพของคุณ' : 'Your Health Companion'}</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:underline">
              {isThai ? 'วิธีใช้งาน' : 'How It Helps'}
            </a>
            <a href="#try-checker" className="hover:underline">
              {isThai ? 'จำลองค่าความดัน' : 'BP Checker'}
            </a>
            <a href="#mom-experience" className="hover:underline">
              {isThai ? 'เรื่องจริงจากคุณแม่' : "Mom's Story"}
            </a>
            <button onClick={onGetStarted} className="text-red-600 dark:text-red-400 font-bold hover:underline">
              {isThai ? 'เข้าใช้งาน' : 'Go to App'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
