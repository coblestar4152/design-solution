import React, { useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { supabase, publicImageUrl } from "../../supabaseClient.js";
import { uploadImage, deleteImage } from "../../hooks/imageUpload.js";

const CATEGORY_OPTIONS = [
  { value: "video-design", label: "Video Editing & Graphic Design" },
  { value: "minecraft", label: "Minecraft Development" },
  { value: "discord", label: "Discord Development" }
];

const BLANK = {
  title: "",
  description: "",
  category: "video-design",
  project_link: "",
  sort_order: 0
};

export default function ManagePortfolio() {
  const { portfolio, refresh } = useSiteData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      category: p.category,
      project_link: p.project_link || "",
      sort_order: p.sort_order || 0
    });
    setExistingImagePath(p.image_path);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(BLANK);
    setExistingImagePath(null);
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file && !existingImagePath) {
      setError("Please upload an image for this project.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let image_path = existingImagePath;
      if (file) {
        if (existingImagePath) await deleteImage(existingImagePath);
        image_path = await uploadImage(file, "portfolio");
      }

      const payload = { ...form, image_path };

      if (editingId) {
        const { error: err } = await supabase
          .from("portfolio_projects")
          .update(payload)
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("portfolio_projects").insert(payload);
        if (err) throw err;
      }

      resetForm();
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete project "${p.title}"?`)) return;
    const { error: err } = await supabase.from("portfolio_projects").delete().eq("id", p.id);
    if (err) {
      alert(err.message);
      return;
    }
    if (p.image_path) await deleteImage(p.image_path);
    await refresh();
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Portfolio</h1>
        <p>Projects shown in the filterable portfolio gallery.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-panel">
        <h2>{editingId ? "Edit project" : "Add a project"}</h2>

        {(file || existingImagePath) && (
          <img
            className="image-preview"
            src={file ? URL.createObjectURL(file) : publicImageUrl(existingImagePath)}
            alt="Preview"
          />
        )}
        <div className="field">
          <label>Project image (required)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="p-title">Project title</label>
            <input
              id="p-title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="p-cat">Category</label>
            <select
              id="p-cat"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="p-desc">Description</label>
          <textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="p-link">Project link (optional)</label>
            <input
              id="p-link"
              value={form.project_link}
              onChange={(e) => setForm((f) => ({ ...f, project_link: e.target.value }))}
              placeholder="https://…"
            />
          </div>
          <div className="field">
            <label htmlFor="p-order">Sort order</label>
            <input
              id="p-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update project" : "Add project"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-panel">
        <h2>All projects ({portfolio.length})</h2>
        {portfolio.length === 0 && <div className="empty-state">No projects yet.</div>}
        {portfolio.map((p) => (
          <div className="admin-list-item" key={p.id}>
            {p.image_path && <img src={publicImageUrl(p.image_path)} alt={p.title} />}
            <div className="meta">
              <h4>{p.title}</h4>
              <p>
                {CATEGORY_OPTIONS.find((c) => c.value === p.category)?.label} — {p.description}
              </p>
            </div>
            <div className="actions">
              <button className="icon-btn" onClick={() => startEdit(p)}>
                Edit
              </button>
              <button className="icon-btn danger" onClick={() => handleDelete(p)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
