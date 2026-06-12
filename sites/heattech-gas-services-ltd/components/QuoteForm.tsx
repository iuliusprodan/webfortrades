"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nextErrors: Record<string, boolean> = {};
    let valid = true;

    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]").forEach((field) => {
      if (!field.value.trim()) {
        nextErrors[field.name] = true;
        valid = false;
      }
    });

    setErrors(nextErrors);
    if (valid) {
      setSubmitted(true);
      form.reset();
      setErrors({});
    }
  }

  function onInput(name: string, value: string) {
    if (value.trim() && errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <div className="quote-form reveal" data-section-id="quote-form" data-od-id="quote-form" id="quote">
      {submitted ? (
        <div className="form-success is-visible" role="status">
          Thank you. Your request has been noted. For urgent issues, call 07506 042175.
        </div>
      ) : null}
      <form id="quote-form" onSubmit={onSubmit} noValidate>
        <div className={`form-field${errors.name ? " has-error" : ""}`}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            onChange={(e) => onInput("name", e.target.value)}
          />
          <span className="field-error">Please enter your name.</span>
        </div>
        <div className={`form-field${errors.phone ? " has-error" : ""}`}>
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            onChange={(e) => onInput("phone", e.target.value)}
          />
          <span className="field-error">Please enter a phone number.</span>
        </div>
        <div className={`form-field${errors.postcode ? " has-error" : ""}`}>
          <label htmlFor="postcode">Postcode</label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            autoComplete="postal-code"
            required
            onChange={(e) => onInput("postcode", e.target.value)}
          />
          <span className="field-error">Please enter your postcode.</span>
        </div>
        <div className={`form-field${errors.job ? " has-error" : ""}`}>
          <label htmlFor="job">What needs doing?</label>
          <textarea
            id="job"
            name="job"
            required
            onChange={(e) => onInput("job", e.target.value)}
          />
          <span className="field-error">Please describe the job.</span>
        </div>
        <button className="btn btn-light" type="submit">
          Send quote request
        </button>
      </form>
    </div>
  );
}
