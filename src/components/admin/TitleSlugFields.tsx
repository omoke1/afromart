"use client";

import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/slug";

type Props = {
  titleName?: string;
  slugName?: string;
  titleLabel?: string;
  slugLabel?: string;
  titleDefault?: string;
  slugDefault?: string;
  titleRequired?: boolean;
  slugRequired?: boolean;
  titlePlaceholder?: string;
};

export function TitleSlugFields({
  titleName = "title",
  slugName = "slug",
  titleLabel = "Title",
  slugLabel = "Slug",
  titleDefault = "",
  slugDefault = "",
  titleRequired = true,
  slugRequired = false,
  titlePlaceholder = "",
}: Props) {
  const [title, setTitle] = useState(titleDefault);
  const [slug, setSlug] = useState(slugDefault);
  const slugTouched = useRef(Boolean(slugDefault));

  // Sync when the parent loads the record being edited.
  useEffect(() => {
    setTitle(titleDefault);
    if (!slugTouched.current) {
      setSlug(slugDefault || slugify(titleDefault));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleDefault, slugDefault]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched.current) {
      setSlug(slugify(value));
    }
  }

  function onSlugChange(value: string) {
    setSlug(value);
    slugTouched.current = value.length > 0;
  }

  const inputClass =
    "w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark";

  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="block">
        <span className="block text-xs font-medium text-ink-soft mb-1.5">{titleLabel}</span>
        <input
          name={titleName}
          type="text"
          required={titleRequired}
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="block text-xs font-medium text-ink-soft mb-1.5">{slugLabel}</span>
        <input
          name={slugName}
          type="text"
          required={slugRequired}
          placeholder="auto-generated from title"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          className={inputClass}
        />
        {!slugRequired && (
          <span className="block text-[11px] text-ink-muted mt-1">
            Auto-generated from the title — edit only for a custom URL.
          </span>
        )}
      </label>
    </div>
  );
}
