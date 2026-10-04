const STATUSES = ["Planning", "In Progress", "On Hold", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];
const $ = id => document.getElementById(id);
let projects = [], editingId = null, deletingId = null;

// ---- Toasts (one helper for every alert: toast(message, "success" | "error")) ----
function toast(message, type = "success") {
  let host = $("toasts");
  if (!host) {
    host = document.createElement("div");
    host.id = "toasts";
    host.setAttribute("role", "status");
    host.setAttribute("aria-live", "polite");
    document.body.append(host);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = message;
  host.append(t);
  setTimeout(() => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 250);
  }, 3500);
}

// ---- API ------------------------------------------------------------------
async function api(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, body };
  return body;
}

async function load() {
  try {
    projects = await api("/projects");
    render();
  } catch {
    $("summary").textContent = "";
    showBanner("Couldn't load projects. Check that the server is running and refresh.");
  }
}

function showBanner(msg) {
  const b = $("banner");
  b.textContent = msg;
  b.style.display = msg ? "block" : "none";
}

// ---- List -----------------------------------------------------------------
const fmt = iso => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};
const todayIso = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`; };

const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/></svg>';
const initials = s => s.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const hue = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);

function render() {
  const q = $("search").value.trim().toLowerCase();
  const fs = $("filterStatus").value, fp = $("filterPriority").value;
  const rows = projects.filter(p =>
    (!q || p.clientName.toLowerCase().includes(q) || p.projectName.toLowerCase().includes(q)) &&
    (!fs || p.status === fs) && (!fp || p.priority === fp));

  const active = projects.filter(p => p.status !== "Completed").length;
  $("summary").textContent = `${projects.length} projects, ${active} active`;

  const list = $("list");
  list.replaceChildren();
  if (!rows.length) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = projects.length ? "No projects match these filters." : "No projects yet. Choose New project to add the first one.";
    list.append(e);
    return;
  }

  const head = document.createElement("div");
  head.className = "row head";
  head.innerHTML = "<div>Project</div><div>Status</div><div>Priority</div><div>Due date</div><div></div>";
  list.append(head);

  for (const p of rows) {
    const overdue = p.status !== "Completed" && p.dueDate < todayIso();
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="proj">
        <div class="avatar"></div>
        <div class="proj-text"><div class="title"></div><div class="client"></div><div class="desc"></div></div>
      </div>
      <div><span class="chip s-${p.status.replace(" ", "")}"></span></div>
      <div><span class="prio p-${p.priority}"></span></div>
      <div class="due"></div>
      <div class="actions">
        <button class="icon" data-act="edit" aria-label="Edit project" title="Edit">${ICON_EDIT}</button>
        <button class="icon del" data-act="del" aria-label="Delete project" title="Delete">${ICON_DEL}</button>
      </div>`;
    const h = hue(p.clientName);
    const av = row.querySelector(".avatar");
    av.textContent = initials(p.clientName);
    av.style.setProperty("--h", h);
    row.querySelector(".title").textContent = p.projectName;
    row.querySelector(".client").textContent = p.clientName;
    row.querySelector(".desc").textContent = p.description || "";
    row.querySelector(".chip").textContent = p.status;
    row.querySelector(".prio").textContent = p.priority;
    const due = row.querySelector(".due");
    due.textContent = fmt(p.dueDate);
    if (overdue) {
      const tag = document.createElement("span");
      tag.className = "tag-overdue";
      tag.textContent = "Overdue";
      due.append(tag);
    }
    row.querySelector('[data-act="edit"]').onclick = () => openForm(p);
    row.querySelector('[data-act="del"]').onclick = () => openDelete(p);
    list.append(row);
  }
}

// ---- Create / edit --------------------------------------------------------
const fields = ["clientName", "projectName", "description", "status", "priority", "startDate", "dueDate"];

function clearErrors() {
  document.querySelectorAll("#form .field").forEach(f => { f.classList.remove("bad"); f.querySelector(".err").textContent = ""; });
  $("formBanner").style.display = "none";
}
function setError(name, msg) {
  const f = $(name).closest(".field");
  f.classList.add("bad");
  f.querySelector(".err").textContent = msg;
}

function openForm(p = null) {
  editingId = p ? p.id : null;
  clearErrors();
  $("formTitle").textContent = p ? "Edit project" : "New project";
  $("clientName").value = p?.clientName ?? "";
  $("projectName").value = p?.projectName ?? "";
  $("description").value = p?.description ?? "";
  $("status").value = p?.status ?? "Planning";
  $("priority").value = p?.priority ?? "Medium";
  $("startDate").value = p?.startDate ?? todayIso();
  $("dueDate").value = p?.dueDate ?? "";
  $("formDlg").showModal();
  $("clientName").focus();
}

function clientValidate(v) {
  const errs = {};
  if (!v.clientName.trim()) errs.clientName = "Client name is required.";
  if (!v.projectName.trim()) errs.projectName = "Project name is required.";
  if (!STATUSES.includes(v.status)) errs.status = "Choose a valid status.";
  if (!PRIORITIES.includes(v.priority)) errs.priority = "Choose a valid priority.";
  if (!v.startDate) errs.startDate = "Start date is required.";
  if (!v.dueDate) errs.dueDate = "Due date is required.";
  else if (v.startDate && v.dueDate < v.startDate) errs.dueDate = "Due date cannot be earlier than the start date.";
  return errs;
}

$("form").addEventListener("submit", async e => {
  e.preventDefault();
  clearErrors();
  const values = Object.fromEntries(fields.map(f => [f, $(f).value]));
  const errs = clientValidate(values);
  if (Object.keys(errs).length) {
    Object.entries(errs).forEach(([k, m]) => setError(k, m));
    return;
  }
  $("saveBtn").disabled = true;
  try {
    if (editingId) await api(`/projects/${editingId}`, { method: "PUT", body: JSON.stringify(values) });
    else await api("/projects", { method: "POST", body: JSON.stringify(values) });
    $("formDlg").close();
    toast(editingId ? "Project updated." : "Project created.");
    await load();
  } catch (err) {
    const serverErrors = err.body?.errors;
    if (serverErrors) {
      for (const [k, msgs] of Object.entries(serverErrors)) {
        if ($(k)) setError(k, msgs[0]);
      }
    } else {
      const fb = $("formBanner");
      fb.textContent = err.body?.detail || err.body?.title || "Couldn't save the project. Try again.";
      fb.style.display = "block";
    }
  } finally {
    $("saveBtn").disabled = false;
  }
});

// ---- Delete ---------------------------------------------------------------
function openDelete(p) {
  deletingId = p.id;
  $("delText").textContent = `"${p.projectName}" for ${p.clientName} will be removed permanently.`;
  $("delDlg").showModal();
}
$("delConfirm").onclick = async () => {
  try {
    await api(`/projects/${deletingId}`, { method: "DELETE" });
    $("delDlg").close();
    toast("Project deleted.");
    await load();
  } catch (err) {
    $("delDlg").close();
    toast(err.body?.detail || "Couldn't delete the project. Refresh and try again.", "error");
    await load();
  }
};

// ---- Wiring ---------------------------------------------------------------
for (const [id, vals] of [["status", STATUSES], ["priority", PRIORITIES], ["filterStatus", STATUSES], ["filterPriority", PRIORITIES]])
  vals.forEach(v => $(id).append(new Option(v, v)));

$("newBtn").onclick = () => openForm();
$("cancelBtn").onclick = () => $("formDlg").close();
$("delCancel").onclick = () => $("delDlg").close();
["search", "filterStatus", "filterPriority"].forEach(id => $(id).addEventListener("input", render));
load();

// ---- Theme (light / dark) ----
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $("themeBtn").setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
applyTheme(document.documentElement.dataset.theme || "light");
$("themeBtn").onclick = () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* storage unavailable: theme just won't persist */ }
};
