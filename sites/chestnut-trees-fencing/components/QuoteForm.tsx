"use client";

import { useState, type FormEvent } from "react";

const PHONE = "07790163439";
const PHONE_DISPLAY = "07790 163439";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [smsHref, setSmsHref] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const postcode = String(fd.get("postcode") ?? "").trim();
    const jobType = String(fd.get("job_type") ?? "").trim();
    const details = String(fd.get("details") ?? "").trim();

    if (!name || !phone || !postcode || !jobType || !details) return;

    const text = [
      "Quote request for Chestnut Trees & Fencing",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Postcode: ${postcode}`,
      `Work: ${jobType}`,
      `Details: ${details}`,
    ].join("\n");

    setSummary(text);
    setSmsHref(`sms:${PHONE}?body=${encodeURIComponent(text.slice(0, 320))}`);
    setSubmitted(true);
  }

  return (
    <div data-section-id="quote-form" data-od-id="quote-form">
      <form className="form-grid" id="quote-form" onSubmit={onSubmit} noValidate aria-label="Quote request form">
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input className="input" id="name" name="name" type="text" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input className="input" id="phone" name="phone" type="tel" autoComplete="tel" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="postcode">Postcode</label>
          <input className="input" id="postcode" name="postcode" type="text" autoComplete="postal-code" required />
        </div>
        <div className="field">
          <label htmlFor="job_type">Type of work</label>
          <select className="select" id="job_type" name="job_type" required defaultValue="">
            <option value="">Select work type</option>
            <option value="Tree felling or reduction">Tree felling or reduction</option>
            <option value="Tree removal">Tree removal</option>
            <option value="Hedge trimming">Hedge trimming</option>
            <option value="Fencing">Fencing</option>
            <option value="Building work">Building work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="details">Tell us about the job</label>
          <textarea className="textarea" id="details" name="details" required />
        </div>
        {!submitted ? (
          <button className="btn btn-primary" type="submit">
            Prepare quote request
          </button>
        ) : null}
        <p className="form-note">
          With no business email on file, the form copies your details so you can call or text Dan with the summary.
        </p>
        <p className={`form-success${submitted ? " is-visible" : ""}`} id="form-success" role="status">
          {submitted
            ? "Your summary is ready below. Text Dan with these details or call if you prefer to talk through the job."
            : null}
        </p>
        {submitted ? (
          <>
            <pre className="form-summary" aria-label="Quote request summary">
              {summary}
            </pre>
            <a className="btn btn-secondary" href={smsHref}>
              Text summary to <span className="num">{PHONE_DISPLAY}</span>
            </a>
          </>
        ) : null}
      </form>
    </div>
  );
}
