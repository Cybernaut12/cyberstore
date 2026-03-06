import React from "react";

function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 py-4 text-sm text-[color:var(--text-muted)]">
      <span className="loader" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
