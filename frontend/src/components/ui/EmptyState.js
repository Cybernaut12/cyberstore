import React from "react";

function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[color:var(--text-muted)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
