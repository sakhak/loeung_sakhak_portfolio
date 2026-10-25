import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContentEditor from "./ContentEditor.jsx";
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from "./models/siteContent.js";
import { normalizeProjectImage } from "./models/projects.js";

const emptyProject = {
  category: "Full-stack",
  tech: "",
  link: "",
  github: "",
  title_en: "",
  title_km: "",
  description_en: "",
  description_km: "",
};

function getErrorMessage(response, data) {
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return `Request failed (${response.status})`;
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [guestbookMessages, setGuestbookMessages] = useState([]);
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [form, setForm] = useState(emptyProject);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("admin_token")));
  const [saving, setSaving] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(getErrorMessage(response, data));
    return data;
  }, [token]);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await request("/api/projects");
      setProjects(data.map(normalizeProjectImage));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([
      request("/api/projects"),
      request("/api/content"),
      request("/api/admin/guestbook"),
    ])
      .then(([projectData, contentData, guestbookData]) => {
        if (!active) return;
        setProjects(projectData.map(normalizeProjectImage));
        setGuestbookMessages(guestbookData);
        const savedContent = mergeSiteContent(DEFAULT_SITE_CONTENT, contentData.content);
        setContent({
          ...savedContent,
          profile: {
            ...savedContent.profile,
            photo: contentData.content?.profile?.photo || "",
          },
        });
        setError("");
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token, request]);

  async function approveGuestbookMessage(message) {
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/guestbook/${message.id}/approve`, { method: "POST" });
      setGuestbookMessages((current) => current.map((item) => (
        item.id === message.id ? { ...item, approved: true } : item
      )));
      setNotice("Guestbook message approved and published.");
    } catch (approveError) {
      setError(approveError.message);
    }
  }

  async function deleteGuestbookMessage(message) {
    if (!window.confirm(`Delete the guestbook message from ${message.name}?`)) return;
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/guestbook/${message.id}`, { method: "DELETE" });
      setGuestbookMessages((current) => current.filter((item) => item.id !== message.id));
      setNotice("Guestbook message deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function saveContent(event) {
    event.preventDefault();
    setContentSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await request("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setContent(mergeSiteContent(DEFAULT_SITE_CONTENT, result.content));
      setNotice("Website content updated.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setContentSaving(false);
    }
  }

  async function uploadProfileImage() {
    if (!profileImage) return;
    setProfileImageUploading(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("image", profileImage);
      const result = await request("/api/content/profile-image", {
        method: "POST",
        body,
      });
      setContent((current) => ({
        ...current,
        profile: { ...current.profile, photo: result.photo },
      }));
      setProfileImage(null);
      setNotice("Profile photo updated.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setProfileImageUploading(false);
    }
  }

  async function uploadCv() {
    const file = cvFile;
    if (!file) return;
    setCvUploading(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("language", "shared");
      body.append("file", file);
      const result = await request("/api/content/cv", {
        method: "POST",
        body,
      });
      setContent((current) => ({
        ...current,
        profile: {
          ...current.profile,
          cv: result.url,
          cvEn: result.url,
          cvKm: result.url,
        },
      }));
      setCvFile(null);
      setNotice("Shared CV uploaded and saved.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setCvUploading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("admin_token", result.token);
      setToken(result.token);
      setPassword("");
    } catch (loginError) {
      setError(loginError.message);
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await request("/api/logout", { method: "POST" });
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      localStorage.removeItem("admin_token");
      setToken("");
      setProjects([]);
    }
  }

  function editProject(project) {
    setEditingId(project.id);
    setForm({
      category: project.category,
      tech: project.tech.join(", "),
      link: project.link || "",
      github: project.github || "",
      title_en: project.title_en,
      title_km: project.title_km || "",
      description_en: project.description_en,
      description_km: project.description_km || "",
    });
    setImage(null);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProject);
    setImage(null);
  }

  async function saveProject(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      body.append(key, key === "tech" ? JSON.stringify(value.split(",").map((item) => item.trim()).filter(Boolean)) : value);
    });
    if (image) body.append("image", image);
    if (editingId) body.append("_method", "PUT");
    try {
      await request(editingId ? `/api/projects/${editingId}` : "/api/projects", {
        method: "POST",
        body,
      });
      setNotice(editingId ? "Project updated." : "Project created.");
      resetForm();
      await loadProjects();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete “${project.title_en}”?`)) return;
    setError("");
    setNotice("");
    try {
      await request(`/api/projects/${project.id}`, { method: "DELETE" });
      setNotice("Project deleted.");
      await loadProjects();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">PORTFOLIO MANAGEMENT</p>
          <h1>Portfolio admin</h1>
          <p className="admin-subtitle">Manage your website content and projects in one place.</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/">View portfolio</Link>
          {token && <button type="button" onClick={logout}>Log out</button>}
        </div>
      </header>

      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-message admin-success" role="status">{notice}</p>}

      {!token ? (
        <form className="admin-panel admin-login" onSubmit={login}>
          <div>
            <p className="admin-eyebrow">WELCOME BACK</p>
            <h2>Sign in to manage your portfolio</h2>
            <p className="admin-muted">Use your administrator account to continue.</p>
          </div>
          <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="admin-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
      ) : (
        <>
          <nav className="admin-nav" aria-label="Admin sections">
            {[
              ["overview", "Overview"],
              ["content", "Website content"],
              ["projects", "Projects"],
              ["guestbook", "Guestbook"],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "admin-nav-item is-active" : "admin-nav-item"}
                aria-current={activeTab === tab ? "page" : undefined}
                onClick={() => setActiveTab(tab)}
              >
                {label}
                {tab === "projects" && <span className="admin-nav-count">{projects.length}</span>}
                {tab === "guestbook" && (
                  <span className="admin-nav-count">
                    {guestbookMessages.filter((message) => !message.approved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <section className="admin-overview">
              <div className="admin-welcome">
                <div>
                  <p className="admin-eyebrow">YOUR WORKSPACE</p>
                  <h2>What would you like to update?</h2>
                  <p className="admin-muted">Choose a section below. Your changes are saved to the live portfolio when you press Save.</p>
                </div>
                {loading && <span className="admin-loading">Loading your portfolio…</span>}
              </div>
              <div className="admin-shortcuts">
                <button type="button" className="admin-shortcut" onClick={() => setActiveTab("content")}>
                  <span className="admin-shortcut-icon" aria-hidden="true">Aa</span>
                  <span><strong>Website content</strong><small>Edit your profile, text, skills, and social links.</small></span>
                  <span className="admin-shortcut-arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" className="admin-shortcut" onClick={() => { resetForm(); setActiveTab("projects"); }}>
                  <span className="admin-shortcut-icon" aria-hidden="true">＋</span>
                  <span><strong>Manage projects</strong><small>{projects.length} {projects.length === 1 ? "project" : "projects"} · Add, edit, or remove portfolio work.</small></span>
                  <span className="admin-shortcut-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          )}

          {activeTab === "content" && (
            <form className="admin-panel" onSubmit={saveContent}>
              <div className="admin-form-heading">
                <div>
                  <p className="admin-eyebrow">SITE-WIDE EDITOR</p>
                  <h2>Website content</h2>
                  <p>Edit public portfolio text, profile details, skills, and social links. Clear text to hide it or delete list items. Keep {`{email}`}, {`{year}`}, and {`{name}`} placeholders in related message/footer text.</p>
                </div>
                <button type="button" className="admin-secondary" onClick={() => {
                  if (window.confirm("Restore all website content to its original defaults? This will replace your current edits.")) {
                    setContent(DEFAULT_SITE_CONTENT);
                  }
                }}>
                  Restore defaults
                </button>
              </div>
              <section className="admin-profile-photo">
                <div>
                  <p className="admin-eyebrow">PROFILE PHOTO</p>
                  <h2>Change your profile photo</h2>
                  <p className="admin-muted">Choose a JPG, PNG, or WebP image up to 5 MB. The upload is saved immediately.</p>
                </div>
                <div className="admin-profile-photo-controls">
                  <img src={content.profile.photo || "/profile.jpg"} alt="Current profile" />
                  <label>
                    Choose an image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-primary"
                    disabled={!profileImage || profileImageUploading}
                    onClick={uploadProfileImage}
                  >
                    {profileImageUploading ? "Uploading…" : "Upload profile photo"}
                  </button>
                </div>
              </section>
              <section className="admin-cv-upload">
                <div>
                  <p className="admin-eyebrow">CV FILE</p>
                  <h2>Upload your shared CV PDF</h2>
                  <p className="admin-muted">Use one PDF for both English and Khmer visitors. Upload a file up to 10 MB; it replaces the previous shared CV and saves its URL immediately.</p>
                </div>
                <div className="admin-cv-upload-list">
                  <div className="admin-cv-upload-row">
                    <div>
                      <strong>Shared CV</strong>
                      {(content.profile.cv || content.profile.cvEn || content.profile.cvKm) && (
                        <a href={content.profile.cv || content.profile.cvEn || content.profile.cvKm} target="_blank" rel="noreferrer">View current PDF</a>
                      )}
                    </div>
                    <label>
                      Choose PDF
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          event.target.value = "";
                          setCvFile(file);
                        }}
                      />
                    </label>
                    {cvFile && <small className="admin-cv-selected-file">{cvFile.name}</small>}
                    <button
                      type="button"
                      className="admin-primary"
                      disabled={!cvFile || cvUploading}
                      onClick={uploadCv}
                    >
                      {cvUploading ? "Uploading…" : "Upload CV"}
                    </button>
                  </div>
                </div>
              </section>
              <ContentEditor value={content} onChange={setContent} />
              <div className="admin-save-bar">
                <span className="admin-muted">Remember to save your edits before leaving.</span>
                <button className="admin-primary" disabled={contentSaving}>
                  {contentSaving ? "Saving…" : "Save website content"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "projects" && (
            <>
              <form className="admin-panel admin-project-form" onSubmit={saveProject}>
                <div className="admin-form-heading">
                  <div>
                    <p className="admin-eyebrow">{editingId ? "UPDATE PORTFOLIO WORK" : "ADD TO YOUR PORTFOLIO"}</p>
                    <h2>{editingId ? "Edit project" : "Add a project"}</h2>
                  </div>
                  {editingId && <button type="button" className="admin-secondary" onClick={resetForm}>Cancel edit</button>}
                </div>
                <div className="admin-fields">
                  <label>Category
                    <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                      <option>Full-stack</option><option>API</option><option>Frontend</option>
                    </select>
                  </label>
                  <label>Technologies (comma-separated)<input value={form.tech} onChange={(event) => setForm({ ...form, tech: event.target.value })} placeholder="React, Laravel, MySQL" required /></label>
                  <label>Live URL<input type="url" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} /></label>
                  <label>GitHub URL<input type="url" value={form.github} onChange={(event) => setForm({ ...form, github: event.target.value })} /></label>
                  <label className="admin-full">Project image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>
                  <label>Title — English<input value={form.title_en} onChange={(event) => setForm({ ...form, title_en: event.target.value })} required /></label>
                  <label>ចំណងជើង — ខ្មែរ<input value={form.title_km} onChange={(event) => setForm({ ...form, title_km: event.target.value })} /></label>
                  <label>Description — English<textarea value={form.description_en} onChange={(event) => setForm({ ...form, description_en: event.target.value })} required /></label>
                  <label>ការពិពណ៌នា — ខ្មែរ<textarea value={form.description_km} onChange={(event) => setForm({ ...form, description_km: event.target.value })} /></label>
                </div>
                <button className="admin-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create project"}</button>
              </form>

              <section className="admin-panel">
                <div className="admin-form-heading">
                  <div><h2>Your projects <span className="admin-heading-count">{projects.length}</span></h2><p>These projects appear in your public portfolio.</p></div>
                  <button type="button" className="admin-secondary" onClick={loadProjects}>Refresh list</button>
                </div>
                {loading && <p className="admin-muted" role="status">Loading projects…</p>}
                {!loading && projects.length === 0 && <p className="admin-empty">No projects yet. Use the form above to add your first project.</p>}
                <div className="admin-list">
                  {projects.map((project) => (
                    <article className="admin-project-row" key={project.id}>
                      {project.image ? <img src={project.image} alt="" /> : <div className="admin-project-placeholder" aria-hidden="true">▧</div>}
                      <div className="admin-project-copy">
                        <h3>{project.title_en}</h3>
                        <p>{project.title_km || "No Khmer title"}</p>
                        <small>{project.category} · {project.tech.join(", ")}</small>
                      </div>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-secondary" onClick={() => editProject(project)}>Edit</button>
                        <button type="button" className="admin-danger" onClick={() => deleteProject(project)}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "guestbook" && (
            <section className="admin-panel">
              <div className="admin-form-heading">
                <div>
                  <p className="admin-eyebrow">MESSAGE MODERATION</p>
                  <h2>Guestbook messages</h2>
                  <p>Approve messages to publish them on your portfolio, or delete messages you do not want to keep.</p>
                </div>
              </div>
              {guestbookMessages.length === 0 ? (
                <p className="admin-empty">No guestbook messages have been submitted yet.</p>
              ) : (
                <div className="admin-list">
                  {guestbookMessages.map((message) => (
                    <article className="admin-guestbook-row" key={message.id}>
                      <div className="admin-guestbook-copy">
                        <div className="admin-guestbook-heading">
                          <h3>{message.name}</h3>
                          <span className={message.approved ? "admin-status-approved" : "admin-status-pending"}>
                            {message.approved ? "Published" : "Pending approval"}
                          </span>
                        </div>
                        <p>{message.message}</p>
                        <small>{new Date(message.created_at).toLocaleString()}</small>
                      </div>
                      <div className="admin-row-actions">
                        {!message.approved && (
                          <button type="button" className="admin-primary" onClick={() => approveGuestbookMessage(message)}>
                            Approve
                          </button>
                        )}
                        <button type="button" className="admin-danger" onClick={() => deleteGuestbookMessage(message)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
