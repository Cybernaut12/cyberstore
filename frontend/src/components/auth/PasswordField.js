import React, { useState } from "react";

function PasswordField({
  label = "Password",
  value,
  onChange,
  error,
  helperText,
  name,
  id,
  required,
  autoComplete,
  placeholder,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label ? <label className="label" htmlFor={id}>{label}</label> : null}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="input pr-16"
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-900"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {!error && helperText ? <p className="helper">{helperText}</p> : null}
    </div>
  );
}

export default PasswordField;
