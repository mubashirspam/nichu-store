import XLSX from "xlsx";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, "../public");
mkdirSync(outputDir, { recursive: true });

// ─── HELPER ──────────────────────────────────────────────────────
function style(ws, range, opts) {
  // xlsx community edition doesn't support styles natively,
  // but we set column widths and structure for usability
}

function col(letter, row) {
  return `${letter}${row}`;
}

// ─── CREATE WORKBOOK ─────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// ===================== SHEET 1: Dashboard ========================
const dashData = [
  ["🏋️ ULTIMATE FITNESS TRACKER — WEEKLY DASHBOARD"],
  [""],
  ["Day", "Workout", "Duration (min)", "Calories Burned", "Calories Eaten", "Protein (g)", "Carbs (g)", "Fat (g)", "Water (L)", "Sleep (hrs)", "Weight (kg)", "Steps", "Notes"],
  ["Monday", "Chest & Triceps", 60, 450, 2200, 150, 220, 70, 3.2, 7.5, 75.2, 8500, ""],
  ["Tuesday", "Back & Biceps", 55, 420, 2100, 145, 210, 65, 2.8, 6.8, 75.1, 7200, ""],
  ["Wednesday", "Legs & Glutes", 65, 500, 2350, 160, 240, 75, 3.5, 8.0, 75.0, 9100, ""],
  ["Thursday", "Shoulders & Abs", 50, 380, 2150, 140, 200, 68, 3.0, 7.2, 74.9, 6800, ""],
  ["Friday", "Cardio & HIIT", 45, 550, 2000, 130, 180, 60, 2.5, 6.5, 74.8, 12000, ""],
  ["Saturday", "Full Body", 70, 480, 2400, 155, 250, 80, 3.8, 8.5, 74.9, 10500, ""],
  ["Sunday", "Rest / Stretching", 20, 150, 1900, 120, 190, 55, 2.0, 9.0, 74.7, 5000, "Active recovery"],
  [""],
  ["WEEKLY TOTALS", "", 365, 2930, 15100, 1000, 1490, 473, 20.8, 53.5, "", 59100, ""],
  ["DAILY AVERAGE", "", 52.1, 418.6, 2157.1, 142.9, 212.9, 67.6, 3.0, 7.6, "", 8442.9, ""],
  [""],
  ["🎯 WEEKLY GOALS"],
  ["Metric", "Target", "Actual", "Status"],
  ["Workout Sessions", 6, 6, "✅ Achieved"],
  ["Avg Calories Eaten", 2200, 2157, "✅ On Track"],
  ["Avg Protein (g)", 140, 143, "✅ Achieved"],
  ["Avg Water (L)", 3.0, 3.0, "✅ On Track"],
  ["Avg Sleep (hrs)", 7.5, 7.6, "✅ Achieved"],
  ["Weight Goal (kg)", 74.5, 74.7, "🔄 Almost There"],
  ["Steps/Day", 8000, 8443, "✅ Achieved"],
];

const wsDash = XLSX.utils.aoa_to_sheet(dashData);
wsDash["!cols"] = [
  { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
  { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 10 }, { wch: 20 },
];
wsDash["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];
XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");

// ===================== SHEET 2: Workout Log ======================
const exercises = [
  ["🏋️ WORKOUT LOG — DETAILED EXERCISE TRACKER"],
  [""],
  ["Date", "Muscle Group", "Exercise", "Set 1 (kg×reps)", "Set 2 (kg×reps)", "Set 3 (kg×reps)", "Set 4 (kg×reps)", "Rest (sec)", "RPE (1-10)", "Notes"],
  [""],
  ["--- CHEST & TRICEPS ---"],
  ["2025-01-06", "Chest", "Bench Press", "60×12", "70×10", "80×8", "80×6", 90, 8, "PR on set 3"],
  ["2025-01-06", "Chest", "Incline Dumbbell Press", "24×12", "28×10", "30×8", "", 75, 7, ""],
  ["2025-01-06", "Chest", "Cable Flyes", "15×15", "17.5×12", "20×10", "", 60, 7, ""],
  ["2025-01-06", "Triceps", "Tricep Pushdown", "25×15", "30×12", "35×10", "", 60, 7, ""],
  ["2025-01-06", "Triceps", "Overhead Extension", "20×12", "22.5×10", "25×8", "", 60, 8, ""],
  [""],
  ["--- BACK & BICEPS ---"],
  ["2025-01-07", "Back", "Deadlift", "80×10", "100×8", "120×6", "130×4", 120, 9, "Heavy day"],
  ["2025-01-07", "Back", "Lat Pulldown", "50×12", "55×10", "60×8", "", 75, 7, ""],
  ["2025-01-07", "Back", "Seated Row", "45×12", "50×10", "55×8", "", 75, 7, ""],
  ["2025-01-07", "Biceps", "Barbell Curl", "25×12", "30×10", "30×8", "", 60, 7, ""],
  ["2025-01-07", "Biceps", "Hammer Curl", "14×12", "16×10", "16×10", "", 60, 6, ""],
  [""],
  ["--- LEGS & GLUTES ---"],
  ["2025-01-08", "Legs", "Squat", "70×12", "90×10", "100×8", "110×6", 120, 9, ""],
  ["2025-01-08", "Legs", "Leg Press", "120×15", "150×12", "180×10", "", 90, 8, ""],
  ["2025-01-08", "Legs", "Romanian Deadlift", "60×12", "70×10", "80×8", "", 90, 8, ""],
  ["2025-01-08", "Glutes", "Hip Thrust", "60×15", "80×12", "100×10", "", 90, 8, ""],
  ["2025-01-08", "Legs", "Leg Extension", "40×15", "45×12", "50×10", "", 60, 7, ""],
  ["2025-01-08", "Legs", "Calf Raises", "30×20", "35×15", "40×12", "", 45, 6, ""],
  [""],
  ["--- EXERCISE DATABASE (Common Exercises) ---"],
  ["", "Chest", "Bench Press, Incline Press, Decline Press, Dumbbell Flyes, Cable Crossover, Push-ups, Chest Dips"],
  ["", "Back", "Deadlift, Lat Pulldown, Bent Over Row, Seated Row, Pull-ups, T-Bar Row, Face Pulls"],
  ["", "Shoulders", "Overhead Press, Lateral Raise, Front Raise, Rear Delt Fly, Arnold Press, Shrugs"],
  ["", "Biceps", "Barbell Curl, Dumbbell Curl, Hammer Curl, Preacher Curl, Concentration Curl"],
  ["", "Triceps", "Tricep Pushdown, Overhead Extension, Skull Crushers, Close Grip Bench, Dips"],
  ["", "Legs", "Squat, Leg Press, Lunges, Leg Curl, Leg Extension, Calf Raises, Step-ups"],
  ["", "Core", "Plank, Crunches, Russian Twist, Leg Raise, Ab Wheel, Mountain Climbers"],
  ["", "Cardio", "Running, Cycling, Rowing, Jump Rope, Swimming, HIIT, Stair Climber"],
];

const wsWorkout = XLSX.utils.aoa_to_sheet(exercises);
wsWorkout["!cols"] = [
  { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
  { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
];
wsWorkout["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
XLSX.utils.book_append_sheet(wb, wsWorkout, "Workout Log");

// ===================== SHEET 3: Nutrition Tracker =================
const nutritionData = [
  ["🍎 NUTRITION & DIET TRACKER"],
  [""],
  ["Date", "Meal", "Food Item", "Qty", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Fiber (g)"],
  [""],
  ["2025-01-06", "Breakfast", "Oats with milk", "1 bowl", 350, 15, 55, 8, 6],
  ["2025-01-06", "Breakfast", "Banana", "1 medium", 105, 1, 27, 0.4, 3],
  ["2025-01-06", "Breakfast", "Whey Protein Shake", "1 scoop", 120, 24, 3, 1, 0],
  ["2025-01-06", "Lunch", "Chicken Breast", "200g", 330, 62, 0, 7, 0],
  ["2025-01-06", "Lunch", "Brown Rice", "1 cup", 215, 5, 45, 2, 3.5],
  ["2025-01-06", "Lunch", "Mixed Vegetables", "1 cup", 80, 3, 15, 0.5, 4],
  ["2025-01-06", "Snack", "Greek Yogurt", "200g", 130, 20, 6, 3, 0],
  ["2025-01-06", "Snack", "Almonds", "30g", 170, 6, 6, 15, 3.5],
  ["2025-01-06", "Dinner", "Salmon Fillet", "150g", 280, 35, 0, 15, 0],
  ["2025-01-06", "Dinner", "Sweet Potato", "1 medium", 115, 2, 27, 0.1, 4],
  ["2025-01-06", "Dinner", "Salad with Olive Oil", "1 bowl", 150, 2, 8, 12, 3],
  [""],
  ["DAILY TOTAL", "", "", "", 2045, 175, 192, 64, 27],
  [""],
  ["--- DAILY TARGETS ---"],
  ["", "", "", "", "Calories", "Protein", "Carbs", "Fat", "Fiber"],
  ["", "", "Target", "", 2200, 150, 220, 70, 25],
  ["", "", "Actual", "", 2045, 175, 192, 64, 27],
  ["", "", "Remaining", "", 155, -25, 28, 6, -2],
  [""],
  ["--- MACRO RATIO ---"],
  ["", "", "Protein", "35%"],
  ["", "", "Carbs", "38%"],
  ["", "", "Fat", "27%"],
];

const wsNutrition = XLSX.utils.aoa_to_sheet(nutritionData);
wsNutrition["!cols"] = [
  { wch: 14 }, { wch: 12 }, { wch: 24 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
];
wsNutrition["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
XLSX.utils.book_append_sheet(wb, wsNutrition, "Nutrition");

// ===================== SHEET 4: Body Measurements =================
const bodyData = [
  ["📏 BODY MEASUREMENT TRACKER"],
  [""],
  ["Date", "Weight (kg)", "Body Fat %", "BMI", "Chest (cm)", "Waist (cm)", "Hips (cm)", "Biceps L (cm)", "Biceps R (cm)", "Thigh L (cm)", "Thigh R (cm)", "Calf L (cm)", "Calf R (cm)", "Neck (cm)", "Notes"],
  [""],
  ["2025-01-01", 78.0, 22.0, 25.1, 102, 88, 98, 34, 34.5, 58, 58.5, 38, 38, 39, "Starting measurements"],
  ["2025-01-08", 77.2, 21.5, 24.8, 102, 87, 97.5, 34.2, 34.7, 58, 58.5, 38, 38, 39, "Good first week"],
  ["2025-01-15", 76.5, 21.0, 24.6, 102.5, 86, 97, 34.5, 35, 58.2, 58.7, 38.2, 38.2, 38.5, ""],
  ["2025-01-22", 76.0, 20.5, 24.4, 103, 85.5, 96.5, 35, 35.2, 58.5, 59, 38.5, 38.5, 38.5, ""],
  ["2025-01-29", 75.2, 20.0, 24.2, 103.5, 85, 96, 35.2, 35.5, 59, 59.2, 38.5, 38.5, 38.5, ""],
  ["2025-02-05", 74.7, 19.5, 24.0, 104, 84, 95.5, 35.5, 35.8, 59, 59.5, 38.8, 38.8, 38, "4 week mark!"],
  [""],
  ["PROGRESS SUMMARY"],
  ["", "Start", "Current", "Change"],
  ["Weight (kg)", 78.0, 74.7, -3.3],
  ["Body Fat %", 22.0, 19.5, -2.5],
  ["BMI", 25.1, 24.0, -1.1],
  ["Waist (cm)", 88, 84, -4],
  ["Chest (cm)", 102, 104, 2],
  ["Biceps R (cm)", 34.5, 35.8, 1.3],
  [""],
  ["--- BMI CALCULATOR ---"],
  ["Height (cm)", 176],
  ["Weight (kg)", 74.7],
  ["BMI", 24.1],
  ["Category", "Normal weight"],
  [""],
  ["--- BODY FAT ESTIMATE (Navy Method) ---"],
  ["Neck (cm)", 38],
  ["Waist (cm)", 84],
  ["Height (cm)", 176],
  ["Est. Body Fat %", 19.2],
];

const wsBody = XLSX.utils.aoa_to_sheet(bodyData);
wsBody["!cols"] = [
  { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 22 },
];
wsBody["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }];
XLSX.utils.book_append_sheet(wb, wsBody, "Body Measurements");

// ===================== SHEET 5: Sleep & Water ====================
const sleepWaterData = [
  ["😴 SLEEP & WATER INTAKE TRACKER"],
  [""],
  ["Date", "Bedtime", "Wake Time", "Sleep (hrs)", "Quality (1-10)", "Water Glass 1", "Glass 2", "Glass 3", "Glass 4", "Glass 5", "Glass 6", "Glass 7", "Glass 8", "Total Water (L)", "Notes"],
  [""],
  ["2025-01-06", "22:30", "06:00", 7.5, 8, "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅", 3.2, "Slept well"],
  ["2025-01-07", "23:00", "06:00", 7.0, 6, "✅", "✅", "✅", "✅", "✅", "✅", "✅", "", 2.8, "Late night"],
  ["2025-01-08", "22:00", "06:00", 8.0, 9, "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅", 3.5, "Great sleep!"],
  ["2025-01-09", "22:30", "05:45", 7.25, 7, "✅", "✅", "✅", "✅", "✅", "✅", "", "", 3.0, ""],
  ["2025-01-10", "23:30", "06:00", 6.5, 5, "✅", "✅", "✅", "✅", "✅", "", "", "", 2.5, "Couldn't fall asleep"],
  ["2025-01-11", "22:00", "06:30", 8.5, 9, "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅", 3.8, "Weekend rest"],
  ["2025-01-12", "21:30", "06:30", 9.0, 10, "✅", "✅", "✅", "✅", "", "", "", "", 2.0, "Rest day"],
  [""],
  ["WEEKLY AVERAGES"],
  ["", "", "", 7.7, 7.7, "", "", "", "", "", "", "", "", 3.0, ""],
  [""],
  ["--- SLEEP GOALS ---"],
  ["Target Sleep", "7.5 hrs"],
  ["Target Water", "3.0 L"],
  ["Avg Sleep This Week", "7.7 hrs ✅"],
  ["Avg Water This Week", "3.0 L ✅"],
];

const wsSleep = XLSX.utils.aoa_to_sheet(sleepWaterData);
wsSleep["!cols"] = [
  { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
  { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
  { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 20 },
];
wsSleep["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }];
XLSX.utils.book_append_sheet(wb, wsSleep, "Sleep & Water");

// ===================== SHEET 6: Monthly Progress =================
const monthlyData = [
  ["📊 MONTHLY PROGRESS OVERVIEW"],
  [""],
  ["Week", "Avg Weight (kg)", "Avg Body Fat %", "Workouts Done", "Avg Calories", "Avg Protein (g)", "Avg Water (L)", "Avg Sleep (hrs)", "Avg Steps", "Mood (1-10)"],
  [""],
  ["Week 1 (Jan 1-7)", 77.5, 21.8, 6, 2180, 142, 2.9, 7.4, 7800, 7],
  ["Week 2 (Jan 8-14)", 76.8, 21.2, 6, 2150, 145, 3.0, 7.6, 8200, 8],
  ["Week 3 (Jan 15-21)", 76.2, 20.7, 5, 2200, 148, 3.1, 7.5, 8500, 7],
  ["Week 4 (Jan 22-28)", 75.5, 20.2, 6, 2160, 150, 3.0, 7.7, 8900, 8],
  ["Week 5 (Jan 29-Feb 4)", 74.9, 19.8, 6, 2140, 152, 3.2, 7.8, 9200, 9],
  [""],
  ["MONTHLY TOTALS / AVERAGES"],
  ["", 76.2, 20.7, 29, 2166, 147.4, 3.0, 7.6, 8520, 7.8],
  [""],
  ["--- PERSONAL RECORDS THIS MONTH ---"],
  ["Exercise", "Previous PR", "New PR", "Date"],
  ["Bench Press", "75kg × 8", "80kg × 8", "Jan 6"],
  ["Squat", "100kg × 8", "110kg × 6", "Jan 8"],
  ["Deadlift", "120kg × 6", "130kg × 4", "Jan 7"],
  ["Overhead Press", "45kg × 8", "50kg × 6", "Jan 9"],
  [""],
  ["--- NEXT MONTH GOALS ---"],
  ["Goal", "Target"],
  ["Weight", "73.5 kg"],
  ["Body Fat", "18.5%"],
  ["Bench Press", "85kg × 8"],
  ["Squat", "120kg × 6"],
  ["Daily Steps", "10,000"],
  ["Water Intake", "3.5 L/day"],
];

const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
wsMonthly["!cols"] = [
  { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
  { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
];
wsMonthly["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Progress");

// ─── WRITE FILE ──────────────────────────────────────────────────
const filePath = resolve(outputDir, "Ultimate-Fitness-Tracker.xlsx");
XLSX.writeFile(wb, filePath);
console.log(`✅ Generated: ${filePath}`);
console.log("Sheets:", wb.SheetNames.join(", "));
