import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, CircleHelp, Clock3, LayoutDashboard, List, Pencil, Plus, Trash2, X, Play, Menu } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const STATUSES = ["Pending", "In Progress", "Completed"];

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-CA");
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Pending");
  const [filter, setFilter] = useState("All Tasks");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  async function loadTasks() {
    try {
      setError("");
      const data = await request("/tasks");
      setTasks(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTasks(); }, []);

  const counts = useMemo(() => ({
    Pending: tasks.filter(t => t.status === "Pending").length,
    "In Progress": tasks.filter(t => t.status === "In Progress").length,
    Completed: tasks.filter(t => t.status === "Completed").length
  }), [tasks]);

  const visibleTasks = useMemo(() => {
    if (activePage === "Add Task") return tasks;
    return filter === "All Tasks" ? tasks : tasks.filter(task => task.status === filter);
  }, [tasks, filter, activePage]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const created = await request("/tasks", { method: "POST", body: JSON.stringify({ title: title.trim(), status }) });
      setTasks(current => [created, ...current]);
      setTitle("");
      setStatus("Pending");
      setActivePage("Dashboard");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(id, nextStatus) {
    try {
      const updated = await request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setTasks(current => current.map(task => task._id === id ? updated : task));
    } catch (err) { setError(err.message); }
  }

  function beginEdit(task) {
    setEditingId(task._id);
    setEditingTitle(task.title);
  }

  async function saveEdit(id) {
    if (!editingTitle.trim()) return;
    try {
      const updated = await request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ title: editingTitle.trim() }) });
      setTasks(current => current.map(task => task._id === id ? updated : task));
      setEditingId(null);
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await request(`/tasks/${id}`, { method: "DELETE" });
      setTasks(current => current.filter(task => task._id !== id));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Check size={19} strokeWidth={3} /></span><span>TaskManager</span></div>
        <nav>
          <button className={activePage === "Dashboard" ? "nav-item active" : "nav-item"} onClick={() => { setActivePage("Dashboard"); setMobileMenu(false); }}><LayoutDashboard size={16}/>Dashboard</button>
          <button className={activePage === "Add Task" ? "nav-item active" : "nav-item"} onClick={() => { setActivePage("Add Task"); setMobileMenu(false); }}><Plus size={16}/>Add Task</button>
          <button className={activePage === "All Tasks" ? "nav-item active" : "nav-item"} onClick={() => { setActivePage("All Tasks"); setFilter("All Tasks"); setMobileMenu(false); }}><List size={16}/>All Tasks</button>
        </nav>
        <div className="sidebar-footer">Plan · Track · Complete</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Menu size={20}/></button>
          <span className="workspace">Project Workspace</span>
          <div className="user"><span className="avatar">H</span><span>Harshu</span></div>
        </header>

        <div className="content">
          {activePage === "Dashboard" && <>
            <div className="page-heading">
              <div><h1>Dashboard</h1><p>Track your tasks and stay productive!</p></div>
              <button className="primary-btn top-add" onClick={() => setActivePage("Add Task")}><Plus size={15}/> Add New Task</button>
            </div>

            <section className="stats-grid">
              <StatCard label="Pending" count={counts.Pending} icon={<Clock3 size={21}/>} tone="yellow"/>
              <StatCard label="In Progress" count={counts["In Progress"]} icon={<Play size={20} fill="currentColor"/>} tone="blue"/>
              <StatCard label="Completed" count={counts.Completed} icon={<Check size={22}/>} tone="green"/>
            </section>

            <TaskForm title={title} setTitle={setTitle} status={status} setStatus={setStatus} onSubmit={addTask} busy={busy}/>
            <TaskTable tasks={visibleTasks} filter={filter} setFilter={setFilter} editingId={editingId} editingTitle={editingTitle} setEditingTitle={setEditingTitle} beginEdit={beginEdit} saveEdit={saveEdit} cancelEdit={() => setEditingId(null)} changeStatus={changeStatus} deleteTask={deleteTask} loading={loading}/>
          </>}

          {activePage === "Add Task" && <div className="single-page"><TaskForm title={title} setTitle={setTitle} status={status} setStatus={setStatus} onSubmit={addTask} busy={busy}/></div>}

          {activePage === "All Tasks" && <div className="single-page"><TaskTable tasks={visibleTasks} filter={filter} setFilter={setFilter} editingId={editingId} editingTitle={editingTitle} setEditingTitle={setEditingTitle} beginEdit={beginEdit} saveEdit={saveEdit} cancelEdit={() => setEditingId(null)} changeStatus={changeStatus} deleteTask={deleteTask} loading={loading}/></div>}

          {error && <div className="error-banner"><CircleHelp size={16}/>{error}<button onClick={() => setError("")}><X size={15}/></button></div>}
          <footer className="page-footer">TaskManager · Plan your work. Complete your goals.</footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, count, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{count}</strong><small>{count === 1 ? "task" : "tasks"}</small></div></div>;
}

function TaskForm({ title, setTitle, status, setStatus, onSubmit, busy }) {
  return <section className="panel form-panel">
    <div className="panel-heading"><h2>Add New Task</h2><p>Create a task and choose its status.</p></div>
    <form className="task-form" onSubmit={onSubmit}>
      <label className="field title-field"><span>Task Title</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title" maxLength={120}/></label>
      <label className="field status-field"><span>Status</span><select value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
      <button className="primary-btn submit-btn" disabled={busy || !title.trim()}><Plus size={15}/> {busy ? "Adding..." : "Add Task"}</button>
    </form>
  </section>;
}

function TaskTable({ tasks, filter, setFilter, editingId, editingTitle, setEditingTitle, beginEdit, saveEdit, cancelEdit, changeStatus, deleteTask, loading }) {
  return <section className="panel table-panel">
    <div className="table-heading"><div><h2>All Tasks</h2><p>Manage and update your tasks.</p></div><select aria-label="Filter tasks" className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>{["All Tasks", ...STATUSES].map(s => <option key={s}>{s}</option>)}</select></div>
    <div className="table-scroll"><table><thead><tr><th className="number-col">#</th><th>Task Title</th><th>Status</th><th>Created At</th><th className="actions-col">Actions</th></tr></thead>
      <tbody>
        {loading ? <tr><td colSpan="5" className="empty-state">Loading tasks...</td></tr> : tasks.length === 0 ? <tr><td colSpan="5" className="empty-state">No tasks found. Add a new task to get started.</td></tr> :
          tasks.map((task, index) => <tr key={task._id}>
            <td className="number-col">{index + 1}</td>
            <td className="task-title-cell">{editingId === task._id ? <div className="edit-wrap"><input autoFocus value={editingTitle} onChange={e => setEditingTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveEdit(task._id); if (e.key === "Escape") cancelEdit(); }}/><button className="icon-action save" onClick={() => saveEdit(task._id)} aria-label="Save"><Check size={15}/></button><button className="icon-action cancel" onClick={cancelEdit} aria-label="Cancel"><X size={15}/></button></div> : <span>{task.title}</span>}</td>
            <td><select className={`status-pill ${task.status.toLowerCase().replace(" ", "-")}`} value={task.status} onChange={e => changeStatus(task._id, e.target.value)} aria-label={`Status for ${task.title}`}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
            <td className="date-cell">{formatDate(task.createdAt)}</td>
            <td><div className="actions"><button className="icon-action edit" onClick={() => beginEdit(task)} aria-label="Edit task"><Pencil size={14}/></button><button className="icon-action delete" onClick={() => deleteTask(task._id)} aria-label="Delete task"><Trash2 size={14}/></button></div></td>
          </tr>)
        }
      </tbody></table></div>
    {!loading && <div className="table-bottom">Showing {tasks.length} of {tasks.length} tasks</div>}
  </section>;
}

export default App;
