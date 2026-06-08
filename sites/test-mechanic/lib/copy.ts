import { brief, ownerName, areaLabel } from "./data";

export function heroHeadline(): string {
  return "Mechanic comes to you.";
}

export function heroSub(): string {
  return `Mobile diagnostics, brakes, clutches and full services at your home, work or roadside. ${ownerName()} has been running jobs across Greater Manchester for ${brief.years_trading} years. One van, one operator, no workshop queue.`;
}

export function reviewThemes(): string[] {
  return [
    "No hassle",
    "Honest and quick",
    "Fair price",
    "Kept me updated",
    ...brief.service_area.slice(0, 3),
  ];
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/brakes|hour|car park/.test(t)) return "Brakes done in the car park. One hour.";
  if (/diagnos|hundreds|honest/.test(t)) return "Found the fault. Saved the bill.";
  if (/clutch|driveway|saturday/.test(t)) return "Clutch on the driveway. Fair price.";
  if (/hassle/.test(t)) return "No hassle, no workshop wait.";
  if (/quick/.test(t)) return "Honest, quick, straight answer.";
  return "Solid work, straight talk.";
}

export function photoCaption(index: number): string {
  const service = brief.services[index % brief.services.length];
  const place = brief.service_area[index % brief.service_area.length];
  return `JOB SHEET / ${String(index + 1).padStart(4, "0")} - ${service} / ${place}`;
}

export function heroFocalCaption(): string {
  return `Brake service / ${areaLabel()}`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/diagnostic/.test(t))
    return "Fault codes read, live data checked, root cause explained before any parts are ordered. No guesswork invoices.";
  if (/brake|disc/.test(t))
    return "Pads, discs and fluid done at your location. Road-tested before you drive off. Same-day where stock allows.";
  if (/clutch/.test(t))
    return "Clutch swaps on driveways and car parks with proper stands and torque specs. Weekend slots available.";
  if (/mot/.test(t))
    return "Pre-MOT inspection with a written list of advisories and fails. Fix what matters, skip what doesn't.";
  if (/battery|alternator/.test(t))
    return "Starting and charging faults traced on site. Batteries fitted, alternators tested, earths checked.";
  if (/service|door/.test(t))
    return "Full service at your door: oil, filters, fluids, safety checks. Logbook stamped, no trip to the garage.";
  return `Mobile ${title.toLowerCase()} across ${areaLabel()} and the surrounding boroughs.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/diagnostic/.test(t)) return ["OBD scan", "Live data", "Written report"];
  if (/brake|disc/.test(t)) return ["Pads", "Discs", "Fluid bleed"];
  if (/clutch/.test(t)) return ["Driveway", "Weekend", "Road test"];
  if (/mot/.test(t)) return ["Advisories", "Fails list", "Same-week"];
  if (/battery|alternator/.test(t)) return ["Load test", "Earth check", "On-site"];
  if (/service/.test(t)) return ["Oil + filters", "Fluids", "Logbook"];
  return ["Mobile", "Manchester", "Salford"];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  return [
    `Most of my work is people who are sick of dropping a car off for three days to hear nothing back. I turn up, diagnose it properly, tell you what it costs, and do the job where you're parked.`,
    `I'm ${owner}. One van, fully tooled, no reception desk between you and the person turning the spanner. If something doesn't feel right after the job, I come back and check it.`,
    `${brief.years_trading} years around Manchester, Salford, Stockport and out to Oldham and Bury. I quote after I've seen the car or had clear photos and mileage. The price we agree is the price you pay.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.join(", ");
  return [
    {
      q: "What areas do you cover?",
      a: `Greater Manchester and the surrounding boroughs: ${areas}. Home, work car park or roadside. Bit further out? Ring and ask.`,
    },
    {
      q: "Do I need to come to a garage?",
      a: "No. That's the point. I bring tools and parts to you. Driveway, office car park, lay-by. You need a flat, level spot with a bit of room around the car.",
    },
    {
      q: "Can you do a full service on my drive?",
      a: "Yes. Oil, filters, fluids, brakes check, tyre check, lights. Logbook stamped. Allow a couple of hours and access to your bonnet.",
    },
    {
      q: "Do you give written quotes?",
      a: "Always. I inspect the car or review your photos, then send a clear price before work starts. No hidden extras at the end.",
    },
    {
      q: "How do I book you in?",
      a: `Call ${brief.phone}. Fastest way to know if it's a same-day fix or a longer job. Most slots inside a week, emergencies when I can.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `Sole trader. It's ${owner}. Same voice on the phone and the same hands under the bonnet.`,
    },
  ];
}
