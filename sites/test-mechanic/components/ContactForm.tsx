"use client";

import { useState } from "react";

interface ContactFormProps {
  ownerName: string;
  phone: string | null;
  services: string[];
}

export function ContactForm({ ownerName, phone, services }: ContactFormProps) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const tel = String(fd.get("phone") ?? "");
    const postcode = String(fd.get("postcode") ?? "");
    const job = String(fd.get("job") ?? "");
    const details = String(fd.get("details") ?? "");

    const body = [
      `Name: ${name}`,
      `Phone: ${tel}`,
      postcode ? `Postcode: ${postcode}` : null,
      job ? `Job: ${job}` : null,
      details ? `Details: ${details}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (phone) {
      const smsBody = encodeURIComponent(body.slice(0, 300));
      window.location.href = `sms:${phone.replace(/\s/g, "")}?body=${smsBody}`;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="card p-6 text-muted-fg">
        Message ready. If your phone didn&apos;t open, call {phone ?? ownerName} directly.
        Quickest is still the phone.
      </p>
    );
  }

  return (
    <form className="card p-6" onSubmit={handleSubmit} data-testid="contact-form">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        Job request form
      </p>
      <label className="block text-sm">
        Your name
        <input
          required
          name="name"
          autoComplete="name"
          className="focus-ring mt-1 w-full border border-border bg-background px-3 py-3 text-foreground"
        />
      </label>
      <label className="mt-4 block text-sm">
        Phone
        <input
          required
          name="phone"
          type="tel"
          autoComplete="tel"
          className="focus-ring mt-1 w-full border border-border bg-background px-3 py-3 text-foreground"
        />
      </label>
      <label className="mt-4 block text-sm">
        Postcode
        <input
          name="postcode"
          autoComplete="postal-code"
          className="focus-ring mt-1 w-full border border-border bg-background px-3 py-3 text-foreground"
        />
      </label>
      {services.length ? (
        <label className="mt-4 block text-sm">
          What&apos;s the job?
          <select
            name="job"
            className="focus-ring mt-1 w-full border border-border bg-background px-3 py-3 text-foreground"
          >
            <option value="">Pick the closest match</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="other">Something else</option>
          </select>
        </label>
      ) : null}
      <label className="mt-4 block text-sm">
        A few details
        <textarea
          name="details"
          rows={4}
          className="focus-ring mt-1 w-full border border-border bg-background px-3 py-3 text-foreground"
        />
      </label>
      <button type="submit" className="btn-primary focus-ring mt-6 min-h-tap w-full">
        Send to {ownerName}
      </button>
    </form>
  );
}
