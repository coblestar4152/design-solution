import React, { useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { supabase } from "../../supabaseClient.js";

const BLANK = { name: "", description: "", sort_order: 0 };

export default function ManageCategories() {
  const { categories, services, refresh } = useSiteData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "", sort_order: cat.sort_order || 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(BLANK);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const { error: err } = await supabase
          .from("categories")
          .update({ ...form })
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("categories").insert({ ...form });
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

  async function handleDelete(cat) {
    const inUse = services.some((s) => s.category_id === cat.id);
    if (inUse) {
      alert(
        `"${cat.name}" still has services in it. Delete or reassign those services first.`
      );
      return;
    }
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from("categories").delete().eq("id", cat.id);
    if (err) {
      alert(err.message);
      return;
    }
    await refresh();
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Categories</h1>
        <p>Group services into categories shown on the homepage.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-panel">
        <h2>{editingId ? "Edit category" : "Add a category"}</h2>

        <div className="field">
          <label htmlFor="cat-name">Name</label>
          <input
            id="cat-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Video Editing & Graphic Design"
          />
        </div>

        <div className="field">
          <label htmlFor="cat-desc">Short description</label>
          <textarea
            id="cat-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="One or two sentences shown under the category title"
          />
        </div>

        <div className="field">
          <label htmlFor="cat-order">Sort order (lower shows first)</label>
          <input
            id="cat-order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update category" : "Add category"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-panel">
        <h2>All categories ({categories.length})</h2>
        {categories.length === 0 && <div className="empty-state">No categories yet.</div>}
        {categories.map((cat) => (
          <div className="admin-list-item" key={cat.id}>
            <div className="meta">
              <h4>{cat.name}</h4>
              <p>{cat.description || "No description"}</p>
            </div>
            <div className="actions">
              <button className="icon-btn" onClick={() => startEdit(cat)}>
                Edit
              </button>
              <button className="icon-btn danger" onClick={() => handleDelete(cat)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
