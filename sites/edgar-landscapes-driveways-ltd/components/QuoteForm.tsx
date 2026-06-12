"use client";

import { useState, type FormEvent } from "react";

const PHONE = "07504 684804";
const PHONE_TEL = "07504684804";
const EMAIL = "edgar.landscapes1@gmail.com";

function buildSummary(data: {
  name: string;
  phone: string;
  postcode: string;
  job_type: string;
  details: string;
}) {
  return [
    "Quote request for Edgar Landscapes & driveways Ltd",
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Postcode: ${data.postcode}`,
    `Type of work: ${data.job_type}`,
    "",
    "Job details:",
    data.details,
  ].join("\n");
}

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [smsHref, setSmsHref] = useState("");
  const [emailHref, setEmailHref] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const postcode = String(fd.get("postcode") ?? "").trim();
    const job_type = String(fd.get("job_type") ?? "").trim();
    const details = String(fd.get("details") ?? "").trim();

    if (!name || !phone || !postcode || !job_type || !details) {
      return;
    }

    const summary = buildSummary({ name, phone, postcode, job_type, details });
    const subject = encodeURIComponent("Quote request from Edgar Landscapes website");
    const body = encodeURIComponent(summary);

    setSmsHref(`sms:${PHONE_TEL}?body=${body}`);
    setEmailHref(`mailto:${EMAIL}?subject=${subject}&body=${body}`);
    setSubmitted(true);
    e.currentTarget.reset();
  }

  return (
    <div data-section-id="quote-form" data-od-id="quote-form" id="quote">
      <form className="form-grid" onSubmit={onSubmit} noValidate aria-label="Quote request form">
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
            <option value="Garden landscaping">Garden landscaping</option>
            <option value="Driveway">Driveway</option>
            <option value="Patio or paving">Patio or paving</option>
            <option value="Building or structural work">Building or structural work</option>
            <option value="Turf or planting">Turf or planting</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="details">Tell us about the job</label>
          <textarea className="textarea" id="details" name="details" required />
        </div>
        <button className="btn btn-primary" type="submit">
          Prepare quote request
        </button>
        <p className="form-note">
          The form copies your details so you can call, text or paste them into an email to {EMAIL}.
        </p>
        {submitted ? (
          <p className="form-success is-visible" role="status">
            Your details are ready. Use the buttons below to text or email Bill with your summary.
          </p>
        ) : null}
        {submitted && smsHref ? (
          <a className="btn btn-secondary" href={smsHref}>
            Text summary to <span className="num">{PHONE}</span>
          </a>
        ) : null}
        {submitted && emailHref ? (
          <a className="btn btn-secondary" href={emailHref}>
            Email summary
          </a>
        ) : null}
      </form>
    </div>
  );
}
