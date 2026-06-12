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
      <div className="form-row">
        <label htmlFor="postcode">Postcode</label>
        <input type="text" id="postcode" name="postcode" required autoComplete="postal-code" />
      </div>
      <div className="form-row">
        <label htmlFor="service">What do you need help with?</label>
        <select id="service" name="service" required defaultValue="">
          <option value="">Please select</option>
          <option value="repairs">Roof repairs</option>
          <option value="new-roof">New tiled roof</option>
          <option value="flashing">Lead flashing</option>
          <option value="chimney">Chimney work</option>
          <option value="general">General roofing</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="details">A few details</label>
        <textarea
          id="details"
          name="details"
          placeholder="Describe the job, access and any timing preferences."
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="photo">
          Attach a photo <span className="optional">(optional)</span>
        </label>
        <input type="file" id="photo" name="photo" accept="image/*" />
        <p className="file-note">A photo of the roof or leak area can help with quoting.</p>
      </div>
      <div className="form-submit">
        <button type="submit" className="btn btn--primary">
          Send quote request
        </button>
      </div>
      {submitted ? (
        <p className="quote-form-notice" role="status">
          Thanks. This preview form is not connected yet. Please call Stay Dry Roofing on{" "}
          <a href="tel:07393696585">07393 696585</a>.
        </p>
      ) : null}
    </form>
  );
}
