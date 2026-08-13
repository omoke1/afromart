"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { TitleSlugFields } from "@/components/admin/TitleSlugFields";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [bodyText, setBodyText] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${params.id as string}`)
      .then((r) => r.json())
      .then(({ post }) => {
        const data = post as Record<string, unknown> | null;
        if (data) {
          setPost(data);
          setBodyText((data.body as string[])?.join("\n") ?? "");
        }
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = bodyText.split("\n").filter(Boolean);

    const data = {
      slug: (form.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
      title: form.get("title") as string,
      excerpt: form.get("excerpt") as string,
      category: form.get("category") as string,
      read_time: form.get("read_time") as string,
      emoji: form.get("emoji") as string,
      bg_color: form.get("bg_color") as string,
      author: form.get("author") as string,
      date: form.get("date") as string,
      body,
    };

    const res = await fetch(`/api/admin/blog/${params.id as string}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      toast(result.error ?? "Could not update post.", "error");
      setLoading(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  if (!post) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Edit post</h2>
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          className="text-xs font-medium text-brand hover:underline"
        >
          View on site →
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TitleSlugFields titleDefault={post.title as string} slugDefault={post.slug as string} />

        <div className="grid grid-cols-3 gap-4">
          <SelectField label="Category" name="category" value={post.category as string} required options={[
            { value: "Recipes", label: "Recipes" },
            { value: "Community", label: "Community" },
            { value: "Ingredients", label: "Ingredients" },
            { value: "Tips", label: "Tips" },
          ]} />
          <Field label="Author" name="author" defaultValue={post.author as string} required />
          <Field label="Date" name="date" defaultValue={post.date as string} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Read time" name="read_time" defaultValue={post.read_time as string} />
          <Field label="Emoji" name="emoji" defaultValue={post.emoji as string} />
          <Field label="BG color" name="bg_color" defaultValue={post.bg_color as string} />
        </div>

        <Field label="Excerpt" name="excerpt" defaultValue={post.excerpt as string} />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Body</span>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={8}
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
            {loading ? "Saving..." : "Update post"}
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

function SelectField({ label, name, required, options, value }: {
  label: string; name: string; required?: boolean; options: { value: string; label: string }[]; value?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select name={name} required={required} defaultValue={value}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
