"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { TitleSlugFields } from "@/components/admin/TitleSlugFields";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Record<string, unknown> | null>(null);
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");

  useEffect(() => {
    fetch(`/api/admin/recipes/${params.id as string}`)
      .then((r) => r.json())
      .then(({ recipe }) => {
        const data = recipe as Record<string, unknown> | null;
        if (data) {
          setRecipe(data);
          const ingredients = (data.ingredients as { name: string; productId?: string; amount: string }[]) ?? [];
          setIngredientsText(
            ingredients
              .map((i) => {
                let line = i.name;
                if (i.productId) line = `[${i.productId}] ${line}`;
                if (i.amount) line += ` — ${i.amount}`;
                return line;
              })
              .join("\n")
          );
          setStepsText((data.steps as string[])?.join("\n") ?? "");
        }
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const ingredients = ingredientsText
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^\[(.+?)\]\s*(.+?)\s*—\s*(.+)$/);
        if (match) return { name: match[2], productId: match[1], amount: match[3] };
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

    const res = await fetch(`/api/admin/recipes/${params.id as string}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      toast(result.error ?? "Could not update recipe.", "error");
      setLoading(false);
      return;
    }

    router.push("/admin/recipes");
    router.refresh();
  }

  if (!recipe) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Edit recipe</h2>
        <a
          href={`/recipes/${recipe.slug}`}
          target="_blank"
          className="text-xs font-medium text-brand hover:underline"
        >
          View on site →
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TitleSlugFields titleDefault={recipe.title as string} slugDefault={recipe.slug as string} />

        <div className="grid grid-cols-4 gap-4">
          <Field label="Time" name="time" defaultValue={recipe.time as string} />
          <Field label="Serves" name="serves" type="number" defaultValue={String(recipe.serves)} />
          <SelectField label="Level" name="level" value={recipe.level as string} options={[
            { value: "Easy", label: "Easy" },
            { value: "Medium", label: "Medium" },
            { value: "Hard", label: "Hard" },
          ]} />
          <Field label="Emoji" name="emoji" defaultValue={recipe.emoji as string} />
        </div>

        <Field label="BG color" name="bg_color" defaultValue={recipe.bg_color as string} />

        <Field label="Intro" name="intro" defaultValue={recipe.intro as string} />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Ingredients</span>
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Steps</span>
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
            {loading ? "Saving..." : "Update recipe"}
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

function SelectField({ label, name, options, value }: {
  label: string; name: string; options: { value: string; label: string }[]; value?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select name={name} defaultValue={value}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
