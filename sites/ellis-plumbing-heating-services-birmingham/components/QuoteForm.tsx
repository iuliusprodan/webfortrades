"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div data-od-id="quote-form">
      <div
        className={`form-success${submitted ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        Thanks. Your enquiry has been noted. For a faster response, call{" "}
        <a href="tel:07854027655">07854 027655</a> or{" "}
        <a href="https://wa.me/447854027655" rel="noopener noreferrer">
          message on WhatsApp
        </a>
        .
      </div>
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
          <label htmlFor="message">Tell us about the job</label>
          <textarea id="message" name="message" required />
        </div>
        <button type="submit" className="btn btn-primary btn-dark">
          Send enquiry
        </button>
        <p className="form-note">This form is for enquiries only. Call 07854 027655 for a faster response.</p>
      </form>
    </div>
  );
}
