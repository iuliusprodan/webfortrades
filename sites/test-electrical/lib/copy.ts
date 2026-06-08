import { brief, ownerName, areaLabel } from "./data";

export function heroHeadline(): string {
  return "Sparks done quietly.";
}

export function heroSub(): string {
  return `Domestic electrical work across Cambridgeshire — fuse boards, EV chargers, rewires, the lot. Run by ${ownerName()}, ${brief.years_trading} years on the road around Cambridge, Ely and the villages.`;
}

export function reviewThemes(): string[] {
  return [
    "Tidy, fair price",
    "Explains everything",
    "Highly recommend",
    "Professional from quote to finish",
    ...brief.service_area.slice(0, 3),
  ];
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/ev charger|same week/.test(t)) return "EV charger fitted same week — tidy and explained.";
  if (/tripping|circuit|couldn't find/.test(t)) return "Found the fault two others missed.";
  if (/rewire|professional/.test(t)) return "Professional from quote to finish.";
  if (/fair|price/.test(t)) return "Fair price, explained everything.";
  if (/recommend/.test(t)) return "The kind you keep the number for.";
  return "Straight talk, solid finish.";
}

export function photoCaption(index: number): string {
  const service = brief.services[index % brief.services.length];
  const place = brief.service_area[index % brief.service_area.length];
  return `No. ${String(index + 1).padStart(2, "0")} — ${service} · ${place}`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/fuse|board/.test(t))
    return "RCBO upgrades and full board swaps across Cambridge terraces and new builds. Certificates issued on the day.";
  if (/ev|charger/.test(t))
    return "Home and driveway installs with the right cable run and load check. OZEV paperwork where it applies.";
  if (/rewir/.test(t))
    return "Whole-house and partial rewires planned around how you actually live in the place. 1930s housing a speciality.";
  if (/fault/.test(t))
    return "Tripping circuits, dead sockets, nuisance RCD trips — diagnosed on the first visit, plain English on the fix.";
  if (/eicr|safety/.test(t))
    return "Landlord and pre-sale reports with clear remedial lists. No scare tactics, just what's required.";
  if (/outdoor|garden|light/.test(t))
    return "Deck lights, path markers, security floods — RCD-protected, weatherproofed, properly tested.";
  return `Straightforward ${title.toLowerCase()} for homes across ${areaLabel()} and nearby.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/ev/.test(t)) return ["Driveway", "Garage", "Load survey"];
  if (/fuse|board/.test(t)) return ["RCBO", "Surge protection", "EICR remedials"];
  if (/rewir/.test(t)) return ["Partial", "Full house", "Certificates"];
  if (/eicr/.test(t)) return ["Landlord", "Pre-sale", "Remedials"];
  if (/light/.test(t)) return ["Garden", "Security", "Mood lighting"];
  if (/fault/.test(t)) return ["Same-week", "Diagnostics", "Repairs"];
  return ["Domestic", "Cambridge", "Ely"];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  return [
    `Most of the work through this van is repeat business or a name passed at the school gates — quietly, on jobs done well. The Google reviews for ${brief.business_name} say the same things: tidy, fair, explained properly.`,
    `I'm ${owner}. One van, no call-centre, no rotating subcontractors. If I scuff a skirting board or leave a cable route I'd be embarrassed by, I come back and put it right.`,
    `${brief.years_trading} years around Cambridge, Histon, Trumpington and out to Ely. I quote after I've seen the job — or clear photos for smaller pieces — and the figure on the phone is the figure on the invoice.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.join(", ");
  return [
    {
      q: "What areas do you cover?",
      a: `Cambridge and the surrounding towns — ${areas}, plus most of CB1, CB2, CB3 and CB4. Bit further out? Ring and ask.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `Sole trader. It's ${owner}. Same person on the phone, at the door, and signing the certificate.`,
    },
    {
      q: "Do you install EV chargers?",
      a: "Yes — home and driveway, with the right cable route and load check. OZEV grant paperwork where you're eligible.",
    },
    {
      q: "Do you give written quotes?",
      a: "Always. Site visit or photos for smaller jobs, then a clear price in writing. No day-rate surprises at the end.",
    },
    {
      q: "How do I book you in?",
      a: `Call ${brief.phone}. Fastest way to know if it's a quick fix or a proper job. Most slots inside a fortnight.`,
    },
  ];
}
