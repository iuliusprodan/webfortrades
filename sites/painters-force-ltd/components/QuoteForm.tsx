"use client";

import { useState, type FormEvent } from "react";

const phone = "07849 279308";
const phoneTel = "07849279308";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nextInvalid: Record<string, boolean> = {};
    let valid = true;

    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]").forEach((field) => {
      if (!field.value.trim()) {
        nextInvalid[field.name] = true;
        valid = false;
      }
    });

    setInvalid(nextInvalid);
    if (valid) {
      setSubmitted(true);
    }
  }

  function onInput(name: string, value: string) {
    if (value.trim() && invalid[name]) {
      setInvalid((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <div
      className="quote-form reveal"
      id="quote"
      data-section-id="quote-form"
      data-od-id="quote-form"
    >
      <h3>Request a quote</h3>
      <p style={{ fontSize: "0.9375rem", color: "var(--muted-on-dark)", marginBottom: "1.25rem" }}>
        Tell us about the rooms, surfaces or premises you need painting. This form is for enquiries only.
      </p>
      <form id="quote-form-el" onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Your name</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            required
            className={invalid.name ? "is-invalid" : undefined}
            onChange={(e) => onInput("name", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            required
            className={invalid.phone ? "is-invalid" : undefined}
            onChange={(e) => onInput("phone", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Tell us about the job</label>
          <textarea
            id="message"
            name="message"
            required
            className={invalid.message ? "is-invalid" : undefined}
            onChange={(e) => onInput("message", e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--primary">
          Send enquiry
        </button>
        <p
          className={`form-success${submitted ? " is-visible" : ""}`}
          id="form-success"
          role="status"
        >
          Thank you. Your enquiry is ready to send. Call {phone} if you prefer to talk through the job.
        </p>
        <p className="form-note">
          Prefer to talk? Call <a href={`tel:${phoneTel}`}>{phone}</a> instead.
        </p>
      </form>
    </div>
  );
}
