"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate aria-label="Quote request form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" autoComplete="name" required />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input type="tel" id="phone" name="phone" autoComplete="tel" required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" autoComplete="email" />
      </div>
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required />
      </div>
      <button type="submit" className="btn btn-primary">
        Send enquiry
      </button>
      {submitted ? (
        <p className="form-note" role="status">
          Thanks. This form is not connected yet. Please call or email Bristol Boiler Repairs directly.
        </p>
      ) : (
        <p className="form-note">Static enquiry form. Connect your own form handler or CRM to receive submissions.</p>
      )}
    </form>
  );
}
