import React, { useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { supabase, publicImageUrl } from "../../supabaseClient.js";
import { uploadImage, deleteImage } from "../../hooks/imageUpload.js";

const BLANK = { name: "", description: "", category_id: "", sort_order: 0 };

export default function ManageServices() {
  const { services, categories, refresh } = useSiteData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(svc) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description || "",
      category_id: svc.category_id || "",
      sort_order: svc.sort_order || 0
    });
    setExistingImagePath(svc.image_path);
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
    if (!form.category_id) {
      setError("Choose a category first (add one under Categories if the list is empty).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let image_path = existingImagePath;
      if (file) {
        if (existingImagePath) await deleteImage(existingImagePath);
        image_path = await uploadImage(file, "services");
      }

      const payload = { ...form, image_path };

      if (editingId) {
        const { error: err } = await supabase.from("services").update(payload).eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("services").insert(payload);
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

  async function handleDelete(svc) {
    if (!confirm(`Delete service "${svc.name}"?`)) return;
    const { error: err } = await supabase.from("services").delete().eq("id", svc.id);
    if (err) {
      alert(err.message);
      return;
    }
    if (svc.image_path) await deleteImage(svc.image_path);
    await refresh();
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Services</h1>
        <p>Individual services shown under each category.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-panel">
        <h2>{editingId ? "Edit service" : "Add a service"}</h2>

        {(file || existingImagePath) && (
          <img
            className="image-preview"
            src={file ? URL.createObjectURL(file) : publicImageUrl(existingImagePath)}
            alt="Preview"
          />
        )}
        <div className="field">
          <label>Service image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="svc-name">Service name</label>
            <input
              id="svc-name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. YouTube Video Editing"
            />
          </div>
          <div className="field">
            <label htmlFor="svc-cat">Category</label>
            <select
              id="svc-cat"
              required
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="svc-desc">Description</label>
          <textarea
            id="svc-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="svc-order">Sort order</label>
          <input
            id="svc-order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update service" : "Add service"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-panel">
        <h2>All services ({services.length})</h2>
        {services.length === 0 && <div className="empty-state">No services yet.</div>}
        {services.map((svc) => (
          <div className="admin-list-item" key={svc.id}>
            {svc.image_path && <img src={publicImageUrl(svc.image_path)} alt={svc.name} />}
            <div className="meta">
              <h4>{svc.name}</h4>
              <p>
                {categories.find((c) => c.id === svc.category_id)?.name || "Uncategorized"} —{" "}
                {svc.description}
              </p>
            </div>
            <div className="actions">
              <button className="icon-btn" onClick={() => startEdit(svc)}>
                Edit
              </button>
              <button className="icon-btn danger" onClick={() => handleDelete(svc)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
