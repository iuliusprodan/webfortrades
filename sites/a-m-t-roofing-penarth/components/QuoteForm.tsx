"use client";

import { useState, type FormEvent } from "react";

const QUOTE_EMAIL = "amtroofing@outlook.com";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const postcode = String(fd.get("postcode") ?? "").trim();
    const details = String(fd.get("details") ?? "").trim();

    const subject = encodeURIComponent("Quote request from A.M.T Roofing Penarth website");
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nPostcode: ${postcode}\n\nTell us about the roof work:\n${details}`
    );

    window.location.href = `mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <form className="form-grid" id="quote" onSubmit={onSubmit} noValidate aria-label="Quote request form">
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
        <label htmlFor="email">Email address</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="postcode">Postcode</label>
        <input className="input" id="postcode" name="postcode" type="text" autoComplete="postal-code" required />
      </div>
      <div className="field">
        <label htmlFor="details">Tell us about the roof work</label>
        <textarea className="textarea" id="details" name="details" required />
      </div>
      <button className="btn btn-primary" type="submit">
        Send quote request
      </button>
      <p className="form-note">
        This form opens your email app with your message addressed to {QUOTE_EMAIL}.
      </p>
      {submitted ? (
        <p className="form-success is-visible" role="status">
          Your email app should now be open with your quote request ready to send.
        </p>
      ) : null}
    </form>
  );
}
