import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoggingIn(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoggingIn(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.user.id !== "d18f58e1-1fc0-4138-ba13-0dda15c55979") {
      await supabase.auth.signOut();
      setErrorMessage("This Account Is Not Authorized To Manage Products.");
      return;
    }
    navigate("/admin/products/new");
  }

  return (
    <main className="admin-log-in container">
      <h1>IB Prestige Admin</h1>

      <p>Sign in to manage your product catalogue.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {errorMessage && (
          <p role="alert" style={{ color: "red" }}>
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Logging In..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}

export default AdminLogin;
