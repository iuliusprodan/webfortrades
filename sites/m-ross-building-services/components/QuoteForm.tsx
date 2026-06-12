"use client";

import { useState, type FormEvent } from "react";

const phone = "07760 104629";
const phoneTel = "07760104629";

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
      className="form-card"
      id="quote"
      data-section-id="quote-form"
      data-od-id="quote-form"
    >
      <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>Request a quote</h3>
      <form id="quote-form-el" onSubmit={onSubmit} noValidate aria-label="Quote request form">
        <div className="form-grid">
          <div className="form-row-2">
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input
                className={`input${invalid.name ? " is-invalid" : ""}`}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                onChange={(e) => onInput("name", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                className={`input${invalid.phone ? " is-invalid" : ""}`}
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                onChange={(e) => onInput("phone", e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="postcode">Postcode</label>
            <input
              className="input"
              id="postcode"
              name="postcode"
              type="text"
              autoComplete="postal-code"
            />
          </div>
          <div className="field">
            <label htmlFor="job-type">Type of work</label>
            <select id="job-type" name="job-type" defaultValue="">
              <option value="">Select work type</option>
              <option value="roof">Full roof or roofing repair</option>
              <option value="weatherproof">Weatherproofing or firewall repair</option>
              <option value="exterior">Rendering, gutters or exterior finishing</option>
              <option value="other">Other (describe below)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="message">Describe the job</label>
            <textarea
              className={`textarea${invalid.message ? " is-invalid" : ""}`}
              id="message"
              name="message"
              required
              onChange={(e) => onInput("message", e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Send quote request
          </button>
          <p className="meta" style={{ marginTop: "4px" }}>
            This form prepares your details. Call or WhatsApp for the fastest response.
          </p>
          <p className={`form-success${submitted ? " visible" : ""}`} id="form-success" role="status">
            Thank you. Your details are ready. Call {phone} or message on WhatsApp for the fastest response.
          </p>
          <p className="meta">
            Prefer to talk? Call <a href={`tel:${phoneTel}`}>{phone}</a> or{" "}
            <a href="https://wa.me/447760104629">WhatsApp</a>.
          </p>
        </div>
      </form>
    </div>
  );
}
