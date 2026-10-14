import { useState } from "react";

import { Link } from "react-router-dom";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));

    // Remove the error for this field as soon as the user edits it.

    setErrors((previous) => ({
      ...previous,

      [name]: "",
    }));

    setSubmitError("");
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }

    setIsSubmitting(true);

    try {
      // Supabase signup will go here.
      // Example:
      // const { data, error } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       full_name: formData.fullName,
      //     },
      //   },
      // });
      // if (error) throw error;
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
        <div className="auth-container">
          <div className="auth-header">
            <p className="eyebrow">IB PRESTIGE</p>

            <h1>Create your account</h1>

            <p>
              Join IB Prestige to manage your account, wishlist, and orders.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* FULL NAME */}

            <div className="form-field">
              <span>
                <label htmlFor="fullName">FULL NAME</label>
              </span>

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
              />

              {errors.fullName && (
                <p id="fullName-error" className="field-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div className="form-field">
              <label htmlFor="email">EMAIL ADDRESS</label>

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
              <label htmlFor="password">PASSWORD</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}

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
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
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
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="field-error">
                  {errors.confirmPassword}
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
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignUp;
