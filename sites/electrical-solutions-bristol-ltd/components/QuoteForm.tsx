"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nextInvalid: Record<string, boolean> = {};
    let valid = true;

    form
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]")
      .forEach((field) => {
        if (!field.value.trim()) {
          nextInvalid[field.name] = true;
          valid = false;
        }
      });

    const details = form.querySelector<HTMLTextAreaElement>('[name="details"]');
    if (details && details.value.trim().length < 10) {
      nextInvalid.details = true;
      valid = false;
    }

    setInvalid(nextInvalid);
    // Presentational only: no network, no submit to the business.
    if (valid) {
      setSubmitted(true);
      form.reset();
    }
  }

  function clearError(name: string, value: string) {
    if (value.trim() && invalid[name]) {
      setInvalid((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <form
      className="quote-form"
      data-section-id="quote-form"
      onSubmit={onSubmit}
      noValidate
      aria-label="Quote request form"
    >
      {submitted ? (
        <div className="form-success" role="status">
          Thanks, your job details are ready to send to Lawrence.
        </div>
      ) : null}

      <div className={`form-row${invalid.name ? " has-error" : ""}`}>
        <label htmlFor="name">Your name</label>
        <input type="text" id="name" name="name" autoComplete="name" required
          onChange={(e) => clearError("name", e.target.value)} />
        {invalid.name ? <p className="field-error">Please enter your name.</p> : null}
      </div>

      <div className={`form-row${invalid.phone ? " has-error" : ""}`}>
        <label htmlFor="phone">Phone number</label>
        <input type="tel" id="phone" name="phone" autoComplete="tel" required
          onChange={(e) => clearError("phone", e.target.value)} />
        {invalid.phone ? <p className="field-error">Please enter a phone number.</p> : null}
      </div>

      <div className="form-row">
        <label htmlFor="email">Email (optional)</label>
        <input type="email" id="email" name="email" autoComplete="email" />
      </div>

      <div className="form-row">
        <label htmlFor="postcode">Postcode</label>
        <input type="text" id="postcode" name="postcode" autoComplete="postal-code"
          placeholder="e.g. BS16" />
      </div>

      <div className={`form-row${invalid.jobtype ? " has-error" : ""}`}>
        <label htmlFor="jobtype">Job type</label>
        <select id="jobtype" name="jobtype" required defaultValue=""
          onChange={(e) => clearError("jobtype", e.target.value)}>
          <option value="">Select a job type</option>
          <option value="lighting">Lighting design</option>
          <option value="rewire">Rewire</option>
          <option value="consumer-unit">Consumer unit</option>
          <option value="fault-finding">Fault-finding</option>
          <option value="other">Other</option>
        </select>
        {invalid.jobtype ? <p className="field-error">Please choose a job type.</p> : null}
      </div>

      <div className={`form-row${invalid.details ? " has-error" : ""}`}>
        <label htmlFor="details">Details</label>
        <textarea id="details" name="details" rows={4} required
          placeholder="What you're after, the room or job, and roughly when."
          onChange={(e) => clearError("details", e.target.value)} />
        {invalid.details ? <p className="field-error">Please add a few details about the job.</p> : null}
      </div>

      <button type="submit" className="btn btn-primary">Send job details</button>
    </form>
  );
}
