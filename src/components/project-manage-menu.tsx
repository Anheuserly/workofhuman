"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Trash2, X, Loader2, Save } from "lucide-react";

export function ProjectManageMenu({
  projectSlug,
  initialTitle,
  initialDescription,
  creatorUsername,
}: {
  projectSlug: string;
  initialTitle: string;
  initialDescription?: string;
  creatorUsername: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || "Failed to update creation.");
      }

      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this creation?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectSlug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete creation.");
      }

      router.push(`/@${creatorUsername}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete project.");
      setDeleting(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="grid size-8 place-items-center rounded-full border border-[#ded9cf] bg-white text-[#6f6a61] hover:text-[#151515] hover:border-[#151515] transition cursor-pointer shadow-xs"
        title="Creator options"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-[#ded9cf] bg-white p-1.5 shadow-xl animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
            >
              <Edit size={14} className="text-[#0f766e]" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleDelete();
              }}
              disabled={deleting}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              {deleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete Creation
            </button>
          </div>
        </>
      )}

      {/* Edit Creation Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="surface p-6 sm:p-8 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-3">
              <h3 className="text-base font-bold text-[#151515]">Edit Creation Details</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[#8c857b] hover:text-[#151515] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#151515] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-2.5 text-xs text-[#151515] focus:border-[#0f766e] focus:bg-white focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151515] mb-1">
                  Description / Project Narrative
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-2.5 text-xs text-[#151515] focus:border-[#0f766e] focus:bg-white focus:outline-none transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded9cf]">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="button-secondary !px-4 !py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || saving}
                  className="button-primary !px-4 !py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
