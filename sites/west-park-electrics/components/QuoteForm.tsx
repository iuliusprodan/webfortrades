"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate aria-label="Request a quote">
      <div className="form-field">
        <label htmlFor="name">Your name</label>
        <input type="text" id="name" name="name" autoComplete="name" required />
      </div>
      <div className="form-field">
        <label htmlFor="phone">Phone number</label>
        <input type="tel" id="phone" name="phone" autoComplete="tel" required />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email (optional)</label>
        <input type="email" id="email" name="email" autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="message">Tell us about the job</label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="e.g. extractor fan install, light fittings, cooker fitting"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Send enquiry
      </button>
      {submitted ? (
        <p className="form-note" role="status">
          Thanks. This preview form is not connected yet. Please call 07889 228995 for a faster response.
        </p>
      ) : (
        <p className="form-note">This form is for enquiries only. Call 07889 228995 for a faster response.</p>
      )}
    </form>
  );
}
