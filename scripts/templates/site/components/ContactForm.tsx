"use client";

import { useState } from "react";

interface ContactFormProps {
  ownerName: string;
  phone: string | null;
  services: string[];
  submitLabel: string;
}

export function ContactForm({
  ownerName,
  phone,
  services,
  submitLabel,
}: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const tel = String(fd.get("phone") ?? "");
    const postcode = String(fd.get("postcode") ?? "");
    const job = String(fd.get("job") ?? "");
    const details = String(fd.get("details") ?? "");

    const body = [
      `Name: ${name}`,
      email ? `Email: ${email}` : null,
      `Phone: ${tel}`,
      postcode ? `Postcode: ${postcode}` : null,
      job ? `Job: ${job}` : null,
      details ? `Details: ${details}` : null,
      fileNames.length ? `Photos attached: ${fileNames.length}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (phone) {
      const smsBody = encodeURIComponent(body.slice(0, 300));
      window.location.href = `sms:${phone.replace(/\s/g, "")}?body=${smsBody}`;
    }
    setSent(true);
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? [...e.target.files] : [];
    setFileNames(files.map((f) => f.name));
  }

  if (sent) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-6 text-muted-fg">
        Message ready. If your phone did not open, call {phone ?? ownerName} directly.
        Quickest is still the phone.
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl border border-border bg-surface p-6"
      onSubmit={handleSubmit}
      data-testid="contact-form"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Your name
          <input
            required
            name="name"
            autoComplete="name"
            className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Phone
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
          />
        </label>
        <label className="block text-sm">
          Postcode
          <input
            name="postcode"
            autoComplete="postal-code"
            className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
          />
        </label>
      </div>
      {services.length ? (
        <label className="mt-4 block text-sm">
          What&apos;s the job?
          <select
            name="job"
            className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
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
          className="focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3"
        />
      </label>
      <label className="mt-4 block text-sm">
        Add photos of the job (optional)
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="focus-ring mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-fg"
        />
        {fileNames.length ? (
          <span className="mt-2 block text-xs text-muted-fg">
            {fileNames.length} file{fileNames.length === 1 ? "" : "s"} selected:{" "}
            {fileNames.join(", ")}
          </span>
        ) : null}
      </label>
      <button
        type="submit"
        className="focus-ring mt-6 min-h-tap w-full rounded-full bg-accent px-6 py-3 font-medium text-accent-fg"
      >
        {submitLabel}
      </button>
    </form>
  );
}
