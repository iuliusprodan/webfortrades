"use client";

import { useEffect, useRef, useState } from "react";

interface ContactFormProps {
  ownerName: string;
  phone: string | null;
  services: string[];
}

type PhotoPreview = { file: File; preview: string };

export function ContactForm({ ownerName, phone, services }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);

  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setPhotos((prev) => [
      ...prev,
      ...imageFiles.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

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
      photos.length ? `Photos: ${photos.length} file(s) selected` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (phone) {
      const smsBody = encodeURIComponent(body.slice(0, 300));
      window.location.href = `sms:${phone.replace(/\s/g, "")}?body=${smsBody}`;
    }
    setSent(true);
  }

  const inputClass =
    "focus-ring mt-1 w-full rounded-lg border border-border px-3 py-3";

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Your name
          <input required name="name" autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-sm">
          Email address
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Phone
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Postcode
          <input name="postcode" autoComplete="postal-code" className={inputClass} />
        </label>
      </div>

      {services.length ? (
        <label className="mt-4 block text-sm">
          What&apos;s the job?
          <select name="job" className={inputClass}>
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
        <textarea name="details" rows={4} className={inputClass} />
      </label>

      <div className="mt-4">
        <p className="text-sm">Add photos of the job (optional)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addPhotos(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`focus-ring mt-1 cursor-pointer rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
            dragOver
              ? "border-accent bg-muted"
              : "border-border bg-background hover:border-accent/50"
          }`}
        >
          <p className="text-sm text-foreground">Drop images here or tap to choose</p>
          <p className="mt-1 text-xs text-muted-fg">JPG, PNG or similar. Multiple files OK.</p>
        </div>
        {photos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, i) => (
              <li
                key={`${photo.file.name}-${i}`}
                className="rounded-lg border border-border bg-background p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt=""
                  className="aspect-square w-full rounded-md object-cover"
                />
                <p className="mt-1 truncate text-xs text-muted-fg">{photo.file.name}</p>
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="focus-ring mt-1 text-xs text-accent underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button type="submit" className="btn-primary focus-ring mt-6 min-h-tap w-full">
        Send to {ownerName}
      </button>
    </form>
  );
}
