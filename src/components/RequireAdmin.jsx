import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ADMIN_UID = "d18f58e1-1fc0-4138-ba13-0dda15c55979";

function RequireAdmin({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        setStatus("unauthorized");
        return;
      }

      setStatus(
        data.session.user.id === ADMIN_UID ? "authorized" : "unauthorized",
      );
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setStatus(session?.user.id === ADMIN_UID ? "authorized" : "unauthorized");
    });

    return () => {
      active = false;
      subscription.unsubscribe;
    };
  }, []);

  if (status === "checking") {
    return <p role="status">Checking Admin Access...</p>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default RequireAdmin;
