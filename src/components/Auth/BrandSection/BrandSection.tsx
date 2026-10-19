const stats = [
  {
    value: "2026",
    label: "Founded",
  },
  {
    value: "100",
    label: "Clients",
  },
  {
    value: "50+",
    label: "PARTNER COMPANIES",
  },
  {
    value: "5",
    label: "BRANCHES",
  },
  {
    value: "20",
    label: "COURSES AVAILABLE",
  },
];

function BrandSection() {
  return (
    <div>
      <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
        NotFacebook Posts
      </h1>
      <p className="mt-4 text-2xl font-medium leading-snug text-slate-800">
        Connnect with friends around you on NotFacebook
      </p>

      <div className="brand-card">
        <p className="brand-label">About NotFacebook</p>

        <p className="brand-title">Your Ultimate NotFacebook Community</p>

        <p className="brand-description">
          Welcome to Notfacebook, a place for people to discover each other,
          discuss, share memories, and connect with other friends from around
          the world.
        </p>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BrandSection