"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="quote-form reveal is-visible" onSubmit={onSubmit} noValidate>
      <div className="form-row form-row-2">
        <div>
          <label htmlFor="name">Your name</label>
          <input type="text" id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input type="tel" id="phone" name="phone" required autoComplete="tel" />
        </div>
      </div>
      <div className="form-row form-row-2">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="postcode">Postcode</label>
          <input type="text" id="postcode" name="postcode" required autoComplete="postal-code" />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="service">What do you need help with?</label>
        <select id="service" name="service" required defaultValue="">
          <option value="">Please select</option>
          <option value="general">General plumbing repairs</option>
          <option value="boiler">Boiler repairs and servicing</option>
          <option value="heating">Heating and radiators</option>
          <option value="bathroom">Bathroom installations</option>
          <option value="emergency">Emergency callout</option>
          <option value="tap-toilet-shower">Tap, toilet or shower repair</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="details">A few details</label>
        <textarea
          id="details"
          name="details"
          placeholder="Tell us about the job, when you need it done and any access details."
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="photo">
          Attach a photo <span className="optional">(optional)</span>
        </label>
        <input type="file" id="photo" name="photo" accept="image/*" />
        <p className="file-note">A photo of the problem area can help us quote more accurately.</p>
      </div>
      <div className="form-submit">
        <button type="submit" className="btn btn-primary">
          Send quote request
        </button>
      </div>
      {submitted ? (
        <p className="file-note" role="status" style={{ marginTop: "1rem", color: "var(--navy)" }}>
          Thanks. This preview form is not connected yet. Please call or email the business directly.
        </p>
      ) : null}
    </form>
  );
}
