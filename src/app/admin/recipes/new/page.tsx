"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const ingredients = ingredientsText
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^\[(.+?)\]\s*(.+?)\s*—\s*(.+)$/);
        if (match) {
          return { name: match[2], productId: match[1], amount: match[3] };
        }
        return { name: line, amount: "" };
      });

    const steps = stepsText.split("\n").filter(Boolean);
    const serves = parseInt(form.get("serves") as string) || 4;

    const data = {
      slug: (form.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
      title: form.get("title") as string,
      time: form.get("time") as string,
      serves,
      level: form.get("level") as string,
      emoji: form.get("emoji") as string,
      bg_color: form.get("bg_color") as string,
      intro: form.get("intro") as string,
      ingredients,
      steps,
    };

    const supabase = createClient();
    const { error } = await supabase.from("recipes").insert(data as never);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/recipes");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-dark mb-6">New recipe</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" name="title" required />
          <Field label="Slug" name="slug" required />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Time" name="time" defaultValue="30m" />
          <Field label="Serves" name="serves" type="number" defaultValue="4" />
          <SelectField label="Level" name="level" options={[
            { value: "Easy", label: "Easy" },
            { value: "Medium", label: "Medium" },
            { value: "Hard", label: "Hard" },
          ]} />
          <Field label="Emoji" name="emoji" defaultValue="🍽️" />
        </div>

        <Field label="BG color" name="bg_color" defaultValue="#f4f1ea" />

        <Field label="Intro" name="intro" />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">
            Ingredients (format: [productId] name — amount, or just name — amount, or just name)
          </span>
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
            placeholder="[parboiled-rice-10kg] Parboiled long-grain rice — 750 g"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Steps (one per line)</span>
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
            required
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save recipe"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 rounded-full border border-[#e6e1d6] text-dark text-xs font-semibold hover:bg-[#f4f1ea] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}

function SelectField({ label, name, options }: {
  label: string; name: string; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select name={name}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
