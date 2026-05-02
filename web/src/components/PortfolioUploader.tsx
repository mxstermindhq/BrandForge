"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Link2, FileText } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  content_url?: string;
  client_verified?: boolean;
  client_name?: string;
  deal_id?: string;
  skills: string[];
  created_at?: string;
}

interface PortfolioUploaderProps {
  onUpload: (item: PortfolioItem) => void;
  onCancel: () => void;
}

const categories = [
  "Design",
  "Development",
  "Marketing",
  "Writing",
  "Video",
  "Photography",
  "Consulting",
  "Other",
];

export function PortfolioUploader({ onUpload, onCancel }: PortfolioUploaderProps) {
  const [item, setItem] = useState<Partial<PortfolioItem>>({
    title: "",
    description: "",
    category: "",
    skills: [],
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !item.skills?.includes(skillInput.trim())) {
      setItem({ ...item, skills: [...(item.skills || []), skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setItem({ ...item, skills: item.skills?.filter((s) => s !== skill) || [] });
  };

  const handleSubmit = useCallback(async () => {
    if (!item.title || !item.category) return;

    setUploading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) throw new Error("Not authenticated");

      let thumbnailUrl: string | undefined;

      // Upload thumbnail if provided
      if (thumbnail) {
        const fileExt = thumbnail.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("media").upload(filePath, thumbnail);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("media").getPublicUrl(filePath);
        thumbnailUrl = data.publicUrl;
      }

      const newItem: PortfolioItem = {
        title: item.title,
        description: item.description || "",
        category: item.category,
        thumbnail_url: thumbnailUrl,
        content_url: item.content_url,
        skills: item.skills || [],
        client_verified: false,
      };

      onUpload(newItem);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }, [item, thumbnail, onUpload]);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">Add Portfolio Work</h3>
        <button onClick={onCancel} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnail Upload */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-on-surface">Thumbnail</label>
        {thumbnailPreview ? (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
            <button
              onClick={() => {
                setThumbnail(null);
                setThumbnailPreview(null);
              }}
              className="absolute right-2 top-2 rounded bg-black/50 p-1 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-high transition hover:border-outline hover:bg-surface-container-highest">
            <ImageIcon className="mb-2 h-10 w-10 text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">Click to upload thumbnail</span>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-on-surface">Title</label>
        <input
          type="text"
          value={item.title}
          onChange={(e) => setItem({ ...item, title: e.target.value })}
          placeholder="e.g., E-commerce Website Redesign"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-on-surface">Category</label>
        <select
          value={item.category}
          onChange={(e) => setItem({ ...item, category: e.target.value })}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-on-surface">Description</label>
        <textarea
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
          placeholder="Describe the project, your role, and outcomes..."
          rows={4}
          className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Skills */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-on-surface">Skills Used</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill and press Enter"
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={addSkill}
            className="rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            Add
          </button>
        </div>
        {item.skills && item.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* External Link */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-on-surface">
          <Link2 className="mb-0.5 mr-1 inline h-4 w-4" />
          External Link (optional)
        </label>
        <input
          type="url"
          value={item.content_url || ""}
          onChange={(e) => setItem({ ...item, content_url: e.target.value })}
          placeholder="https://example.com/project"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!item.title || !item.category || uploading}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Add to Portfolio"}
        </button>
      </div>
    </div>
  );
}
