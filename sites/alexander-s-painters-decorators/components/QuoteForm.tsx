"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form
      className="quote-form"
      id="quote"
      onSubmit={onSubmit}
      noValidate
      aria-label="Quote request form"
    >
      <div className="field">
        <label htmlFor="quote-name">Your name</label>
        <input
          className="input"
          type="text"
          id="quote-name"
          name="name"
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="quote-phone">Phone number</label>
        <input
          className="input"
          type="tel"
          id="quote-phone"
          name="phone"
          autoComplete="tel"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="quote-message">Tell us about the rooms</label>
        <textarea
          className="textarea"
          id="quote-message"
          name="message"
          required
          placeholder="e.g. box room wallpaper removal and full redecoration"
        />
      </div>
      <button className="btn btn--primary" type="submit">
        Send quote request
      </button>
      {submitted ? (
        <p className="quote-form-notice" role="status">
          Thanks. This preview form is not connected yet. Please call 07944 444082 for the quickest response.
        </p>
      ) : (
        <p className="meta">This form is for your convenience. Call 07944 444082 for the quickest response.</p>
      )}
    </form>
  );
}
