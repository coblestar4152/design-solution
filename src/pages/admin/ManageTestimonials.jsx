import React, { useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { supabase, publicImageUrl } from "../../supabaseClient.js";
import { uploadImage, deleteImage } from "../../hooks/imageUpload.js";

const BLANK = { name: "", role: "", content: "", rating: 5, sort_order: 0 };

export default function ManageTestimonials() {
  const { testimonials, refresh } = useSiteData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [existingAvatarPath, setExistingAvatarPath] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(t) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role || "",
      content: t.content,
      rating: t.rating || 5,
      sort_order: t.sort_order || 0
    });
    setExistingAvatarPath(t.avatar_path);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(BLANK);
    setExistingAvatarPath(null);
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let avatar_path = existingAvatarPath;
      if (file) {
        if (existingAvatarPath) await deleteImage(existingAvatarPath);
        avatar_path = await uploadImage(file, "testimonials");
      }

      const payload = { ...form, avatar_path };

      if (editingId) {
        const { error: err } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("testimonials").insert(payload);
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

  async function handleDelete(t) {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    const { error: err } = await supabase.from("testimonials").delete().eq("id", t.id);
    if (err) {
      alert(err.message);
      return;
    }
    if (t.avatar_path) await deleteImage(t.avatar_path);
    await refresh();
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Testimonials</h1>
        <p>Client quotes shown on the homepage.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-panel">
        <h2>{editingId ? "Edit testimonial" : "Add a testimonial"}</h2>

        {(file || existingAvatarPath) && (
          <img
            className="image-preview"
            style={{ borderRadius: "50%", width: 80, height: 80 }}
            src={file ? URL.createObjectURL(file) : publicImageUrl(existingAvatarPath)}
            alt="Avatar preview"
          />
        )}
        <div className="field">
          <label>Avatar image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-name">Client name</label>
            <input
              id="t-name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="t-role">Role / company (optional)</label>
            <input
              id="t-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="t-content">Testimonial</label>
          <textarea
            id="t-content"
            required
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-rating">Rating (1–5)</label>
            <input
              id="t-rating"
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            />
          </div>
          <div className="field">
            <label htmlFor="t-order">Sort order</label>
            <input
              id="t-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update testimonial" : "Add testimonial"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-panel">
        <h2>All testimonials ({testimonials.length})</h2>
        {testimonials.length === 0 && <div className="empty-state">No testimonials yet.</div>}
        {testimonials.map((t) => (
          <div className="admin-list-item" key={t.id}>
            {t.avatar_path && (
              <img
                style={{ borderRadius: "50%" }}
                src={publicImageUrl(t.avatar_path)}
                alt={t.name}
              />
            )}
            <div className="meta">
              <h4>
                {t.name} {t.role ? `— ${t.role}` : ""}
              </h4>
              <p>{t.content}</p>
            </div>
            <div className="actions">
              <button className="icon-btn" onClick={() => startEdit(t)}>
                Edit
              </button>
              <button className="icon-btn danger" onClick={() => handleDelete(t)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
