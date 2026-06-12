"use client";

import { useState, type FormEvent } from "react";

type InvalidFields = {
  name: boolean;
  phone: boolean;
  postcode: boolean;
  problem: boolean;
};

const emptyInvalid: InvalidFields = {
  name: false,
  phone: false,
  postcode: false,
  problem: false,
};

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState<InvalidFields>(emptyInvalid);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextInvalid: InvalidFields = {
      name: !String(fd.get("name") ?? "").trim(),
      phone: !String(fd.get("phone") ?? "").trim(),
      postcode: !String(fd.get("postcode") ?? "").trim(),
      problem: !String(fd.get("problem") ?? "").trim(),
    };
    setInvalid(nextInvalid);
    if (Object.values(nextInvalid).some(Boolean)) return;
    setSubmitted(true);
  }

  return (
    <form
      className="quote-form"
      id="quote-form"
      data-od-id="quote-form"
      onSubmit={onSubmit}
      noValidate
      aria-label="Quote request form"
    >
      <div className="form-grid">
        <div className="form-row-2">
          <div className={`field${invalid.name ? " is-invalid" : ""}`}>
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" type="text" autoComplete="name" required />
            <span className="field-error" role="alert">
              Please enter your name.
            </span>
          </div>
          <div className={`field${invalid.phone ? " is-invalid" : ""}`}>
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
            <span className="field-error" role="alert">
              Please enter a phone number.
            </span>
          </div>
        </div>
        <div className={`field${invalid.postcode ? " is-invalid" : ""}`}>
          <label htmlFor="postcode">Postcode</label>
          <input id="postcode" name="postcode" type="text" autoComplete="postal-code" required />
          <span className="field-error" role="alert">
            Please enter your postcode.
          </span>
        </div>
        <div className={`field${invalid.problem ? " is-invalid" : ""}`}>
          <label htmlFor="problem">What is wrong with the door or lock?</label>
          <textarea id="problem" name="problem" required />
          <span className="field-error" role="alert">
            Please describe the problem.
          </span>
        </div>
        {!submitted ? (
          <button className="btn btn-primary" type="submit">
            Send quote request
          </button>
        ) : null}
        <p
          className={`form-status success${submitted ? " is-visible" : ""}`}
          id="form-status"
          role="status"
          aria-live="polite"
        >
          Thanks. Your enquiry has been noted. For urgent access issues or a faster response, call{" "}
          <a href="tel:07859881354" className="num">
            07859 881354
          </a>
          .
        </p>
      </div>
    </form>
  );
}
