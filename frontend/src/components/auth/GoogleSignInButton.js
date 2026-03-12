import React, { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise = null;

const loadGoogleScript = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("Window unavailable"));
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
};

function GoogleSignInButton({ onCredential, onError, role = "buyer" }) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let mounted = true;

    if (!clientId) {
      setUnavailable(true);
      setLoading(false);
      return () => {};
    }

    const renderGoogleButton = async () => {
      try {
        await loadGoogleScript();
        if (!mounted) return;

        if (!window.google?.accounts?.id || !containerRef.current) {
          setUnavailable(true);
          setLoading(false);
          return;
        }

        containerRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              onErrorRef.current?.("Google sign in failed");
              return;
            }
            onCredentialRef.current?.(response.credential, role);
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });

        setLoading(false);
      } catch (error) {
        if (!mounted) return;
        setUnavailable(true);
        setLoading(false);
        onErrorRef.current?.("Google sign in is currently unavailable");
      }
    };

    renderGoogleButton();
    return () => {
      mounted = false;
    };
  }, [clientId, role]);

  if (unavailable) {
    return (
      <p className="text-xs text-[color:var(--text-muted)]">
        Google sign in is unavailable. Add `REACT_APP_GOOGLE_CLIENT_ID` to enable it.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[42px]" />
      {loading ? <p className="text-xs text-[color:var(--text-muted)]">Loading Google sign in...</p> : null}
    </div>
  );
}

export default GoogleSignInButton;
