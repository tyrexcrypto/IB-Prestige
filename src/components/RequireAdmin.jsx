import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "./AdminLayout";

const ADMIN_UID = "d18f58e1-1fc0-4138-ba13-0dda15c55979";

function RequireAdmin({ children }) {
  const [status, setStatus] = useState("checking");
  const location = useLocation();

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
      subscription.unsubscribe();
    };
  }, []);

  if (status === "checking") {
    return <p role="status">Checking admin access...</p>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default RequireAdmin;
