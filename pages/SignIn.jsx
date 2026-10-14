import { useState } from "react";

import { Link } from "react-router-dom";

function SignIn() {
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
      // Supabase sign-in will go here.
      // Example:
      // const { data, error } =
      //   await supabase.auth.signInWithPassword({
      //     email: formData.email,
      //     password: formData.password,
      //   });
      //
      // if (error) throw error;
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
        <div className="auth-container">
          <div className="auth-header">
            <p className="eyebrow">IB PRESTIGE</p>

            <h1>Welcome back</h1>

            <p>Sign in to access your account, wishlist, and orders.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}

            <div className="form-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />

              {errors.email && (
                <p id="email-error" className="field-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="form-field">
              {/* 
                <div className="field-header">  </div>
              */}

              <label htmlFor="password">Password</label>

              {/*  <Link to="/forgot-password">Forgot password?</Link> */}

              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p id="password-error" className="field-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* GENERAL ERROR */}

            {submitError && (
              <div className="form-error" role="alert">
                {submitError}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="btn primary-btn auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignIn;
