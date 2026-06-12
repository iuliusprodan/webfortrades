"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="quote-form-wrap">
      <div className="quote-form-intro">
        <p className="section-label">Request a quote</p>
        <h2>Tell us about your job</h2>
        <p>
          This preview form is not connected yet. For urgent leaks or heating faults, call{" "}
          <a href="tel:07788488486">07788 488486</a>.
        </p>
      </div>

      <form className="quote-form" onSubmit={onSubmit} noValidate>
        <div className="quote-form-grid">
          <label className="quote-field">
            <span>Your name</span>
            <input type="text" name="name" autoComplete="name" required />
          </label>
          <label className="quote-field">
            <span>Phone</span>
            <input type="tel" name="phone" autoComplete="tel" required />
          </label>
          <label className="quote-field quote-field-full">
            <span>Postcode</span>
            <input type="text" name="postcode" autoComplete="postal-code" required />
          </label>
          <label className="quote-field quote-field-full">
            <span>What do you need help with?</span>
            <select name="job_type" required defaultValue="">
              <option value="" disabled>
                Choose an option
              </option>
              <option value="bathroom">Bathroom work</option>
              <option value="heating">Boiler or heating</option>
              <option value="leak">Leak or urgent repair</option>
              <option value="taps">Taps, toilets or shower</option>
              <option value="gas">Gas work</option>
              <option value="general">General plumbing</option>
            </select>
          </label>
          <label className="quote-field quote-field-full">
            <span>A few details</span>
            <textarea name="details" rows={4} placeholder="Describe the job and any timing preferences" />
          </label>
        </div>

        <div className="quote-form-actions">
          <button type="submit" className="btn btn-primary">
            Send quote request
          </button>
        </div>

        {submitted ? (
          <p className="quote-form-notice" role="status">
            Thanks. This preview form is not connected yet. Please call 07788 488486 to speak with Nick directly.
          </p>
        ) : null}
      </form>
    </div>
  );
}
