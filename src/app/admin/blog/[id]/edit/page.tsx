"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [bodyText, setBodyText] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("blog_posts").select("*").eq("id", params.id as string).single().then(({ data: raw }) => {
      const data = raw as Record<string, unknown> | null;
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

    const supabase = createClient();
    const { error } = await supabase.from("blog_posts").update(data as never).eq("id", params.id as string);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  if (!post) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-dark mb-6">Edit post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" name="title" defaultValue={post.title as string} required />
          <Field label="Slug" name="slug" defaultValue={post.slug as string} required />
        </div>

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
