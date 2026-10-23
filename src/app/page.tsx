"use client";

import { useMemo, useState } from "react";

type AssetStatus = "Available" | "Assigned" | "Maintenance" | "Retired";
type FilterStatus = "All" | AssetStatus;

type Asset = {
  id: string;
  name: string;
  category: string;
  serial: string;
  department: string;
  custodian: string;
  location: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  status: AssetStatus;
};

const initialAssets: Asset[] = [
  {
    id: "AST-0001",
    name: "Dell Latitude 5440",
    category: "Computer",
    serial: "DL-5440-001",
    department: "Information Technology",
    custodian: "James Mwangi",
    location: "Main Office · Floor 2",
    condition: "Excellent",
    status: "Assigned",
  },
  {
    id: "AST-0002",
    name: "HP LaserJet Pro",
    category: "Printer",
    serial: "HP-LJ-2084",
    department: "Finance",
    custodian: "Mary Wanjiku",
    location: "Finance Office",
    condition: "Good",
    status: "Assigned",
  },
  {
    id: "AST-0003",
    name: "Lenovo ThinkPad E14",
    category: "Computer",
    serial: "LN-E14-0182",
    department: "Information Technology",
    custodian: "Unassigned",
    location: "IT Store",
    condition: "Good",
    status: "Available",
  },
  {
    id: "AST-0004",
    name: "Epson Projector EB-X06",
    category: "Presentation",
    serial: "EP-X06-7721",
    department: "Administration",
    custodian: "Peter Otieno",
    location: "Conference Room",
    condition: "Fair",
    status: "Maintenance",
  },
  {
    id: "AST-0005",
    name: "Office Workstation",
    category: "Computer",
    serial: "WS-2024-035",
    department: "Human Resources",
    custodian: "Grace Akinyi",
    location: "HR Office",
    condition: "Good",
    status: "Assigned",
  },
  {
    id: "AST-0006",
    name: "Canon ImageRunner",
    category: "Printer",
    serial: "CN-IR-4500",
    department: "Finance",
    custodian: "Unassigned",
    location: "Equipment Store",
    condition: "Poor",
    status: "Retired",
  },
];

const activities = [
  {
    icon: "↔",
    title: "Custody transfer awaiting acknowledgement",
    detail: "Dell Latitude 5440 · AST-0001",
    time: "12 min ago",
    type: "transfer",
  },
  {
    icon: "✓",
    title: "Inspection approaching its due date",
    detail: "Epson Projector EB-X06 · AST-0004",
    time: "48 min ago",
    type: "inspection",
  },
  {
    icon: "+",
    title: "Asset record registered",
    detail: "Office Workstation · AST-0005",
    time: "2 hours ago",
    type: "registered",
  },
  {
    icon: "⚒",
    title: "Maintenance case requires attention",
    detail: "Epson Projector EB-X06 · AST-0004",
    time: "3 hours ago",
    type: "maintenance",
  },
];

const navGroups = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", icon: "▦" },
      { label: "Asset Register", icon: "▤" },
      { label: "Custody & Transfers", icon: "⇄", count: "4" },
      { label: "Inspections", icon: "☑", count: "3" },
      { label: "Maintenance", icon: "⚒", count: "2" },
      { label: "Retirement & Disposal", icon: "▱" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "People & Departments", icon: "♙" },
      { label: "Reports", icon: "▥" },
      { label: "Audit Trail", icon: "◷" },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ label: "Settings", icon: "⚙" }],
  },
];

function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: Asset["condition"] }) {
  return (
    <span className={`condition condition-${condition.toLowerCase()}`}>
      {condition}
    </span>
  );
}

function Icon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`icon ${className}`}>{children}</span>;
}

export default function Home() {
  const [assets, setAssets] = useState(initialAssets);
  const [activePage, setActivePage] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetCategory, setNewAssetCategory] = useState("Computer");
  const [newAssetDepartment, setNewAssetDepartment] = useState("Information Technology");
  const [notice, setNotice] = useState("");

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          asset.id,
          asset.name,
          asset.category,
          asset.serial,
          asset.department,
          asset.custodian,
          asset.location,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesStatus =
        statusFilter === "All" || asset.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [assets, query, statusFilter]);

  const counts = useMemo(
    () => ({
      total: assets.length,
      assigned: assets.filter((asset) => asset.status === "Assigned").length,
      available: assets.filter((asset) => asset.status === "Available").length,
      maintenance: assets.filter((asset) => asset.status === "Maintenance").length,
      retired: assets.filter((asset) => asset.status === "Retired").length,
    }),
    [assets],
  );

  function navigate(label: string) {
    setActivePage(label);
    setMobileMenu(false);
    setNotice("");
    setQuery("");
    setStatusFilter("All");
  }

  function addAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextNumber =
      Math.max(0, ...assets.map((asset) => Number(asset.id.replace("AST-", "")))) + 1;

    const asset: Asset = {
      id: `AST-${String(nextNumber).padStart(4, "0")}`,
      name: newAssetName.trim(),
      category: newAssetCategory,
      serial: "Not recorded",
      department: newAssetDepartment,
      custodian: "Unassigned",
      location: "Not recorded",
      condition: "Good",
      status: "Available",
    };

    setAssets((current) => [asset, ...current]);
    setShowAddAsset(false);
    setNewAssetName("");
    setNewAssetCategory("Computer");
    setNewAssetDepartment("Information Technology");
    setActivePage("Asset Register");
    setStatusFilter("All");
    setQuery("");
    setNotice(`${asset.name} was added to the local demo register.`);
  }

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    Dashboard: {
      title: "Dashboard",
      subtitle: "A clear view of your organization's asset operations.",
    },
    "Asset Register": {
      title: "Asset Register",
      subtitle: "Search, review and manage registered organizational assets.",
    },
    "Custody & Transfers": {
      title: "Custody & Transfers",
      subtitle: "Track asset ownership, assignments and transfer requests.",
    },
    Inspections: {
      title: "Inspections",
      subtitle: "Monitor asset condition, inspection schedules and findings.",
    },
    Maintenance: {
      title: "Maintenance",
      subtitle: "Track repairs, service cases and equipment availability.",
    },
    "Retirement & Disposal": {
      title: "Retirement & Disposal",
      subtitle: "Manage asset retirement assessments and disposal workflows.",
    },
    "People & Departments": {
      title: "People & Departments",
      subtitle: "Review the people and departments responsible for assets.",
    },
    Reports: {
      title: "Reports",
      subtitle: "Review inventory, custody, condition and operational reporting.",
    },
    "Audit Trail": {
      title: "Audit Trail",
      subtitle: "Review a traceable history of important asset activities.",
    },
    Settings: {
      title: "Settings",
      subtitle: "Configure the organization and its asset management policies.",
    },
  };

  const pageInfo = pageTitles[activePage] ?? pageTitles.Dashboard;

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => navigate("Dashboard")}>
          <span className="brand-mark">
            <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M20 3.5 34 9v10.2c0 8.4-5.8 14.2-14 17.3C11.8 33.4 6 27.6 6 19.2V9L20 3.5Z"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="m20 11 8 4.3v9.2L20 29l-8-4.5v-9.2L20 11Z"
                stroke="#2DD4BF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="m12 15.3 8 4.6 8-4.6M20 19.9V29" stroke="#2DD4BF" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>Asset<span>Pass</span></strong>
            <small>ASSET LIFECYCLE PLATFORM</small>
          </span>
        </button>

        <div className="workspace-selector">
          <div className="workspace-avatar">O</div>
          <div className="workspace-copy">
            <span>WORKSPACE</span>
            <strong>Organization HQ</strong>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-heading">{group.title}</div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.label)}
                  className={`nav-item ${activePage === item.label ? "nav-item-active" : ""}`}
                >
                  <Icon>{item.icon}</Icon>
                  <span className="nav-label">{item.label}</span>
                  {"count" in item && item.count && (
                    <span className="nav-count">{item.count}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need a hand?</strong>
            <p>Your asset operations, all in one place.</p>
            <button onClick={() => setNotice("Help resources will be connected in a later phase.")}>
              Explore help <span>↗</span>
            </button>
          </div>
          <div className="sidebar-version">
            <span className="version-dot" />
            Demo environment <span>v0.1</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <span className="search-symbol">⌕</span>
              <input
                aria-label="Search assets"
                placeholder="Search assets, people..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActivePage("Asset Register");
                }}
                onFocus={() => setActivePage("Asset Register")}
              />
              <kbd> / </kbd>
            </label>

            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((value) => !value)}
              >
                ♧
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  <p><span className="notice-dot amber-dot" /> 3 inspections need attention.</p>
                  <p><span className="notice-dot blue-dot" /> 4 transfers are awaiting action.</p>
                  <p className="muted-small">Demo notifications · Not live alerts</p>
                </div>
              )}
            </div>

            <div className="topbar-divider" />

            <button className="profile-button" onClick={() => setNotice("Profile and session management will be connected during authentication setup.")}>
              <span className="profile-avatar">AM</span>
              <span className="profile-copy">
                <strong>Asset Manager</strong>
                <small>Administrator</small>
              </span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="demo-banner">
            <span className="demo-banner-icon">i</span>
            <span><strong>Demo environment</strong> — All figures and records are sample data. No backend is connected.</span>
            <button onClick={() => setNotice("This dashboard currently uses in-memory demo data.")} aria-label="Demo information">Learn more ↗</button>
          </div>

          {notice && (
            <div className="inline-notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button>
            </div>
          )}

          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> ASSET OPERATIONS</div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.subtitle}</p>
            </div>
            <div className="heading-actions">
              <button className="button button-secondary" onClick={() => setNotice("Export will be implemented with authorized reporting and backend integration.")}>
                <span>↓</span> Export
              </button>
              <button className="button button-primary" onClick={() => setShowAddAsset(true)}>
                <span className="button-plus">+</span> Register asset
              </button>
            </div>
          </section>

          {activePage === "Dashboard" ? (
            <>
              <section className="metrics-grid" aria-label="Asset overview">
                <article className="metric-card metric-total">
                  <div className="metric-top">
                    <span className="metric-label">Total assets</span>
                    <span className="metric-icon navy-icon">▦</span>
                  </div>
                  <div className="metric-number">{counts.total.toLocaleString()}</div>
                  <div className="metric-footer"><span className="metric-neutral">All records</span><span>in demo register</span></div>
                  <div className="metric-accent accent-navy" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Assigned assets</span>
                    <span className="metric-icon teal-icon">↗</span>
                  </div>
                  <div className="metric-number">{counts.assigned.toLocaleString()}</div>
                  <div className="metric-footer"><span className="mini-dot dot-teal" /> With a custodian</div>
                  <div className="metric-accent accent-teal" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Available assets</span>
                    <span className="metric-icon blue-icon">✓</span>
                  </div>
                  <div className="metric-number">{counts.available.toLocaleString()}</div>
                  <div className="metric-footer"><span className="mini-dot dot-blue" /> Ready for assignment</div>
                  <div className="metric-accent accent-blue" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Under maintenance</span>
                    <span className="metric-icon amber-icon">⚒</span>
                  </div>
                  <div className="metric-number">{counts.maintenance.toLocaleString()}</div>
                  <div className="metric-footer"><span className="mini-dot dot-amber" /> Restricted from use</div>
                  <div className="metric-accent accent-amber" />
                </article>
              </section>

              <section className="operations-grid">
                <article className="panel actions-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-title">Pending actions</div>
                      <div className="panel-subtitle">Items that may require your attention</div>
                    </div>
                    <span className="action-count">9</span>
                  </div>

                  <button className="action-row" onClick={() => navigate("Custody & Transfers")}>
                    <span className="action-icon action-blue">⇄</span>
                    <span className="action-copy">
                      <strong>Custody transfers</strong>
                      <small>Awaiting recipient acknowledgement</small>
                    </span>
                    <span className="action-number">4</span>
                    <span className="row-arrow">›</span>
                  </button>

                  <button className="action-row" onClick={() => navigate("Inspections")}>
                    <span className="action-icon action-amber">☑</span>
                    <span className="action-copy">
                      <strong>Inspections due</strong>
                      <small>Review upcoming and overdue checks</small>
                    </span>
                    <span className="action-number">3</span>
                    <span className="row-arrow">›</span>
                  </button>

                  <button className="action-row" onClick={() => navigate("Maintenance")}>
                    <span className="action-icon action-red">⚒</span>
                    <span className="action-copy">
                      <strong>Maintenance cases</strong>
                      <small>Open cases requiring follow-up</small>
                    </span>
                    <span className="action-number">2</span>
                    <span className="row-arrow">›</span>
                  </button>

                  <div className="panel-footer">
                    <button className="text-link" onClick={() => navigate("Custody & Transfers")}>
                      View all pending actions <span>→</span>
                    </button>
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-title">Asset status</div>
                      <div className="panel-subtitle">Distribution across the demo register</div>
                    </div>
                    <span className="small-label">OVERVIEW</span>
                  </div>

                  <div className="distribution-total">
                    <strong>{counts.total}</strong>
                    <span>total records</span>
                  </div>

                  <div className="distribution-bar" aria-label="Asset status distribution">
                    <span className="bar-assigned" style={{ width: `${counts.total ? counts.assigned / counts.total * 100 : 0}%` }} />
                    <span className="bar-available" style={{ width: `${counts.total ? counts.available / counts.total * 100 : 0}%` }} />
                    <span className="bar-maintenance" style={{ width: `${counts.total ? counts.maintenance / counts.total * 100 : 0}%` }} />
                    <span className="bar-retired" style={{ width: `${counts.total ? counts.retired / counts.total * 100 : 0}%` }} />
                  </div>

                  <div className="legend-list">
                    {[
                      { label: "Assigned", value: counts.assigned, className: "legend-assigned", status: "Assigned" as FilterStatus },
                      { label: "Available", value: counts.available, className: "legend-available", status: "Available" as FilterStatus },
                      { label: "Maintenance", value: counts.maintenance, className: "legend-maintenance", status: "Maintenance" as FilterStatus },
                      { label: "Retired", value: counts.retired, className: "legend-retired", status: "Retired" as FilterStatus },
                    ].map((item) => (
                      <button
                        className="legend-row"
                        key={item.label}
                        onClick={() => {
                          setStatusFilter(item.status);
                          setActivePage("Asset Register");
                          setQuery("");
                        }}
                      >
                        <span className={`legend-marker ${item.className}`} />
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <span className="legend-percent">{counts.total ? Math.round(item.value / counts.total * 100) : 0}%</span>
                      </button>
                    ))}
                  </div>
                  <div className="distribution-note">Select a status to view matching assets.</div>
                </article>
              </section>

              <section className="panel register-panel">
                <div className="panel-heading register-heading">
                  <div>
                    <div className="panel-title">Recent assets</div>
                    <div className="panel-subtitle">A snapshot of your asset register</div>
                  </div>
                  <button className="text-link" onClick={() => navigate("Asset Register")}>
                    View asset register <span>→</span>
                  </button>
                </div>
                <AssetTable assets={assets.slice(0, 4)} />
              </section>

              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <div className="panel-title">Recent activity</div>
                    <div className="panel-subtitle">Illustrative events from the demo environment</div>
                  </div>
                  <button className="text-link" onClick={() => navigate("Audit Trail")}>
                    View audit trail <span>→</span>
                  </button>
                </div>
                <div className="activity-list">
                  {activities.map((activity) => (
                    <div className="activity-row" key={activity.title}>
                      <span className={`activity-icon activity-${activity.type}`}>{activity.icon}</span>
                      <div className="activity-copy">
                        <strong>{activity.title}</strong>
                        <span>{activity.detail}</span>
                      </div>
                      <time>{activity.time}</time>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="panel register-panel full-register">
              <div className="panel-heading register-heading">
                <div>
                  <div className="panel-title">
                    {activePage === "Asset Register" ? "All registered assets" : pageInfo.title}
                  </div>
                  <div className="panel-subtitle">
                    {activePage === "Asset Register"
                      ? `${filteredAssets.length} matching demo records`
                      : "This module is represented in the navigation. Its operational workflows will be implemented in subsequent steps."}
                  </div>
                </div>
                {activePage === "Asset Register" && (
                  <button className="button button-primary button-small" onClick={() => setShowAddAsset(true)}>
                    + Register asset
                  </button>
                )}
              </div>

              {activePage === "Asset Register" ? (
                <>
                  <div className="register-toolbar">
                    <label className="table-search">
                      <span>⌕</span>
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name, ID, serial or department..."
                        aria-label="Filter asset register"
                      />
                    </label>
                    <select
                      className="status-select"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
                      aria-label="Filter by asset status"
                    >
                      <option value="All">All statuses</option>
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <AssetTable assets={filteredAssets} />
                  {filteredAssets.length === 0 && (
                    <div className="empty-state">
                      <span>⌕</span>
                      <strong>No matching assets</strong>
                      <p>Try another search term or change the status filter.</p>
                      <button className="text-link" onClick={() => { setQuery(""); setStatusFilter("All"); }}>
                        Clear filters
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="module-placeholder">
                  <span className="placeholder-symbol">◇</span>
                  <h2>{pageInfo.title}</h2>
                  <p>
                    This module is planned for the AssetPass interface. It is not connected
                    to a backend, and no operational actions are being processed here yet.
                  </p>
                  <button className="button button-secondary" onClick={() => navigate("Dashboard")}>
                    Return to dashboard
                  </button>
                </div>
              )}
            </section>
          )}

          <footer className="page-footer">
            <span>AssetPass <span className="footer-separator">·</span> Asset Lifecycle & Custody Management</span>
            <span><span className="footer-status-dot" /> Demo mode <span className="footer-separator">·</span> Backend not connected</span>
          </footer>
        </div>
      </main>

      {showAddAsset && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowAddAsset(false);
        }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-asset-title">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">ASSET REGISTER</span>
                <h2 id="add-asset-title">Register a demo asset</h2>
                <p>Create a local sample record to explore the interface.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAddAsset(false)} aria-label="Close dialog">×</button>
            </div>

            <form onSubmit={addAsset}>
              <label className="form-field">
                <span>Asset name <b>*</b></span>
                <input
                  required
                  autoFocus
                  maxLength={100}
                  value={newAssetName}
                  onChange={(event) => setNewAssetName(event.target.value)}
                  placeholder="e.g. Dell Latitude 5450"
                />
              </label>

              <label className="form-field">
                <span>Category <b>*</b></span>
                <select required value={newAssetCategory} onChange={(event) => setNewAssetCategory(event.target.value)}>
                  <option>Computer</option>
                  <option>Printer</option>
                  <option>Presentation</option>
                  <option>Furniture</option>
                  <option>Vehicle</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="form-field">
                <span>Department <b>*</b></span>
                <select required value={newAssetDepartment} onChange={(event) => setNewAssetDepartment(event.target.value)}>
                  <option>Information Technology</option>
                  <option>Finance</option>
                  <option>Administration</option>
                  <option>Human Resources</option>
                  <option>Operations</option>
                </select>
              </label>

              <div className="modal-demo-note">
                <span>i</span>
                This record exists only in browser memory. It will not be saved to a server.
              </div>

              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={() => setShowAddAsset(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">Create demo record</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function AssetTable({ assets }: { assets: Asset[] }) {
  return (
    <div className="table-scroll">
      <table className="asset-table">
        <thead>
          <tr>
            <th>ASSET</th>
            <th>ASSET ID</th>
            <th>DEPARTMENT</th>
            <th>CUSTODIAN</th>
            <th>CONDITION</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <div className="asset-name-cell">
                  <span className={`asset-thumbnail ${asset.category.toLowerCase() === "computer" ? "thumb-computer" : asset.category.toLowerCase() === "printer" ? "thumb-printer" : "thumb-other"}`}>
                    {asset.category === "Computer" ? "▣" : asset.category === "Printer" ? "▤" : "◇"}
                  </span>
                  <span className="asset-name-copy">
                    <strong>{asset.name}</strong>
                    <small>{asset.category}</small>
                  </span>
                </div>
              </td>
              <td><span className="asset-id">{asset.id}</span></td>
              <td><span className="department-name">{asset.department}</span></td>
              <td><span className={asset.custodian === "Unassigned" ? "unassigned" : "custodian-name"}>{asset.custodian}</span></td>
              <td><ConditionBadge condition={asset.condition} /></td>
              <td><StatusBadge status={asset.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
