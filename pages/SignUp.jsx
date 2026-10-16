import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

import { EyeIconOpen, EyeIconClose } from "../src/components/icons/EyeIcons";

function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
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
    setSubmitSuccess("");
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) throw error;

      if (data.session) {
        setSubmitSuccess("Your account has been created. You can now sign in.");
      } else {
        setSubmitSuccess(
          "Your account has been created. Please check your email for a confirmation link before signing in.",
        );
      }

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSubmitError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="container auth-container">
          <div className="auth-header">
            <h2>Create your account</h2>
            <p>
              Join IB Prestige to manage your account, wishlist, and orders.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
                required
              />
              {errors.fullName && (
                <p id="fullName-error" className="field-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="signup-email">EMAIL ADDRESS</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "signup-email-error" : undefined
                }
                required
              />
              {errors.email && (
                <p id="signup-email-error" className="field-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="signup-password">PASSWORD</label>
              <div className="password-wrapper">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "signup-password-error" : undefined
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
                <p id="signup-password-error" className="field-error">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <EyeIconClose /> : <EyeIconOpen />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="field-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {submitError && (
              <div className="form-error" role="alert">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <p className="form-success" role="status">
                {submitSuccess}
              </p>
            )}

            <div className="button-container">
              <button
                type="submit"
                className="btn primary-btn auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/signin" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignUp;
