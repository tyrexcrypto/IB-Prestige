import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";
import { EyeIconOpen, EyeIconClose } from "../src/components/icons/EyeIcons";

const ADMIN_UID = "d18f58e1-1fc0-4138-ba13-0dda15c55979";

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("We couldn't retrieve your account. Please try again.");
      }

      if (data.user.id === ADMIN_UID) {
        navigate("/admin/products", { replace: true });
        return;
      }

      const requestedPath = location.state?.from?.pathname;

      // Do not redirect ordinary customers into admin routes.
      const safePath =
        requestedPath && !requestedPath.startsWith("/admin")
          ? requestedPath
          : "/";

      navigate(safePath, { replace: true });
    } catch (error) {
      setSubmitError(
        error.message || "Unable to sign in. Please check your details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container container">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your account, wishlist, and orders.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="signin-email">EMAIL ADDRESS</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "signin-email-error" : undefined
                }
                required
              />
              {errors.email && (
                <p id="signin-email-error" className="field-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="signin-password">PASSWORD</label>
              <div className="password-wrapper">
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "signin-password-error" : undefined
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeIconClose /> : <EyeIconOpen />}
                </button>
              </div>
              {errors.password && (
                <p id="signin-password-error" className="field-error">
                  {errors.password}
                </p>
              )}
            </div>

            {submitError && (
              <div className="form-error" role="alert">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="btn primary-btn auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="link">
              Create an account
            </Link>
          </p>
        </div>
      </section>
      <section className="graphics-section"></section>
    </main>
  );
}

export default SignIn;
