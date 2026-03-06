import React from "react";

function StatusPill({ status = "pending", children }) {
  const s = String(status).toLowerCase();

  const map = {
    approved: "status-approved",
    paid: "status-paid",
    pending: "status-pending",
    rejected: "status-rejected",
    unpaid: "status-unpaid",
    delivered: "status-delivered",
  };

  return <span className={`status-pill ${map[s] || "status-pending"}`}>{children || status}</span>;
}

export default StatusPill;
