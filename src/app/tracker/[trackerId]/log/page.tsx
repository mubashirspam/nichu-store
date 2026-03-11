"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Calendar } from "lucide-react";

type TrackerType = "habit" | "workout" | "financial" | "nutrition";

interface TrackerInfo {
  trackerType: TrackerType;
  product: { name: string };
}

// ─── Habit Form ───────────────────────────────────────────────────────────────
function HabitForm({ onSubmit }: { onSubmit: (data: unknown[]) => void }) {
  const [form, setForm] = useState({
    workout: false, meditation: false, reading: false,
    water: false, sleep8: false, noJunk: false,
    waterGlasses: 0, sleepHours: 0, notes: "",
  });

  const f = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    onSubmit([today, +form.workout, +form.meditation, +form.reading,
      form.waterGlasses, form.sleepHours, +form.noJunk, form.notes]);
  };

  const toggle = (k: string) => f(k, !form[k as keyof typeof form]);

  return (
    <div className="space-y-4">
      {[
        ["workout", "Workout"],
        ["meditation", "Meditation"],
        ["reading", "Reading"],
        ["water", "8+ Glasses Water"],
        ["sleep8", "8 Hours Sleep"],
        ["noJunk", "No Junk Food"],
      ].map(([key, label]) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={Boolean(form[key as keyof typeof form])}
            onChange={() => toggle(key)}
            className="w-4 h-4 rounded accent-violet-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
      ))}

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Water Glasses
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => f("waterGlasses", Math.max(0, form.waterGlasses - 1))}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-lg flex items-center justify-center">−</button>
          <span className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">{form.waterGlasses}</span>
          <button onClick={() => f("waterGlasses", form.waterGlasses + 1)}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-lg flex items-center justify-center">+</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Sleep Hours: {form.sleepHours}h
        </label>
        <input type="range" min={0} max={12} value={form.sleepHours}
          onChange={(e) => f("sleepHours", Number(e.target.value))}
          className="w-full accent-violet-600" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)}
          rows={2} placeholder="Optional notes..."
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>

      <button onClick={submit}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
        Save to Sheet
      </button>
    </div>
  );
}

// ─── Workout Form ─────────────────────────────────────────────────────────────
function WorkoutForm({ onSubmit }: { onSubmit: (data: unknown[]) => void }) {
  const [form, setForm] = useState({ exercise: "", duration: 0, sets: 0, reps: 0, weight: 0, notes: "" });
  const f = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    onSubmit([today, form.exercise, form.duration, form.sets, form.reps, form.weight, form.notes]);
  };
  return (
    <div className="space-y-3">
      {[["exercise", "Exercise Name", "text"], ["duration", "Duration (min)", "number"],
        ["sets", "Sets", "number"], ["reps", "Reps", "number"], ["weight", "Weight (kg)", "number"]].map(([k, label, type]) => (
        <div key={k}>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
          <input type={type} value={String(form[k as keyof typeof form])} onChange={(e) => f(k, type === "number" ? Number(e.target.value) : e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      ))}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)} rows={2}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <button onClick={submit} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Save to Sheet</button>
    </div>
  );
}

// ─── Financial Form ───────────────────────────────────────────────────────────
function FinancialForm({ onSubmit }: { onSubmit: (data: unknown[]) => void }) {
  const [form, setForm] = useState({ category: "", description: "", amount: 0, type: "expense", paymentMethod: "", notes: "" });
  const f = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    onSubmit([today, form.category, form.description, form.amount, form.type, form.paymentMethod, form.notes]);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Type</label>
          <select value={form.type} onChange={(e) => f("type", e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Amount (₹)</label>
          <input type="number" value={form.amount} onChange={(e) => f("amount", Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      </div>
      {[["category", "Category"], ["description", "Description"], ["paymentMethod", "Payment Method"], ["notes", "Notes"]].map(([k, label]) => (
        <div key={k}>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
          <input type="text" value={String(form[k as keyof typeof form])} onChange={(e) => f(k, e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      ))}
      <button onClick={submit} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Save to Sheet</button>
    </div>
  );
}

// ─── Nutrition Form ───────────────────────────────────────────────────────────
function NutritionForm({ onSubmit }: { onSubmit: (data: unknown[]) => void }) {
  const [form, setForm] = useState({ meal: "breakfast", foodItem: "", calories: 0, protein: 0, carbs: 0, fat: 0, notes: "" });
  const f = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    onSubmit([today, form.meal, form.foodItem, form.calories, form.protein, form.carbs, form.fat, form.notes]);
  };
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Meal</label>
        <select value={form.meal} onChange={(e) => f("meal", e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          {["breakfast", "lunch", "dinner", "snack"].map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
        </select>
      </div>
      {[["foodItem", "Food Item", "text"], ["calories", "Calories", "number"], ["protein", "Protein (g)", "number"], ["carbs", "Carbs (g)", "number"], ["fat", "Fat (g)", "number"], ["notes", "Notes", "text"]].map(([k, label, type]) => (
        <div key={k}>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
          <input type={type} value={String(form[k as keyof typeof form])} onChange={(e) => f(k, type === "number" ? Number(e.target.value) : e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      ))}
      <button onClick={submit} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Save to Sheet</button>
    </div>
  );
}

const SHEET_NAMES: Record<TrackerType, string> = {
  habit: "Daily Log",
  workout: "Workouts",
  financial: "Transactions",
  nutrition: "Meals",
};

export default function LogPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const router = useRouter();
  const [tracker, setTracker] = useState<TrackerInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/tracker/${trackerId}`)
      .then((r) => r.json())
      .then(setTracker);
  }, [trackerId]);

  const handleSubmit = async (data: unknown[]) => {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`/api/tracker/${trackerId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          sheetName: SHEET_NAMES[tracker?.trackerType as TrackerType] || "Daily Log",
        }),
      });
      if (res.ok) {
        setResult({ success: true, message: "Saved to your sheet!" });
        setTimeout(() => router.push(`/tracker/${trackerId}`), 1500);
      } else {
        const d = await res.json();
        setResult({ success: false, message: d.error || "Failed to save" });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (!tracker) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Log Today</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 capitalize">
        {tracker.product.name} — {tracker.trackerType}
      </p>
      <div className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 mb-6">
        <Calendar size={14} /> {today}
      </div>

      {result && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm mb-4 ${result.success
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
          {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {result.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {saving && (
          <div className="flex items-center justify-center gap-2 text-sm text-violet-600 mb-4">
            <Loader2 size={16} className="animate-spin" /> Saving...
          </div>
        )}
        {tracker.trackerType === "habit" && <HabitForm onSubmit={handleSubmit} />}
        {tracker.trackerType === "workout" && <WorkoutForm onSubmit={handleSubmit} />}
        {tracker.trackerType === "financial" && <FinancialForm onSubmit={handleSubmit} />}
        {tracker.trackerType === "nutrition" && <NutritionForm onSubmit={handleSubmit} />}
      </div>
    </div>
  );
}
