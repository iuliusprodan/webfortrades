import { brief, design, ownerName, primaryTrade, areaLabel } from "./data";

export function heroHeadline(): string {
  const trade = design.trade;
  if (trade === "industrial-mechanic") return "Workshop on wheels.";
  if (trade === "warm-heating") return "Heating done right, no surprises.";
  return "Sparks done quietly.";
}

export function heroSub(): string {
  const owner = ownerName();
  const area = areaLabel();
  const trade = primaryTrade().toLowerCase();
  return `${trade.charAt(0).toUpperCase() + trade.slice(1)} across ${area} — run by ${owner}. Straight quotes, tidy finishes, and a phone that gets answered.`;
}

export function reviewThemes(): string[] {
  const themes: string[] = [];
  const blob = brief.reviews.map((r) => r.text.toLowerCase()).join(" ");
  if (/tidy|clean|spotless/.test(blob)) themes.push("Leaves the place spotless");
  if (/fair|price|reasonable/.test(blob)) themes.push("Fair price, no surprises");
  if (/punctual|time|reliable/.test(blob)) themes.push("Turns up when promised");
  if (/professional|quality|standard/.test(blob)) themes.push("Work you'd photograph");
  if (/recommend|again|happy/.test(blob)) themes.push("The number people keep");
  return themes.slice(0, 5);
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/price|fair|reasonable|quote/.test(t)) return "The quote on the phone is the price on the invoice.";
  if (/tidy|clean|spotless/.test(t)) return "Friendly, fair on price, leaves the place spotless.";
  if (/punctual|time|reliable/.test(t)) return "Turns up when they said they would.";
  if (/recommend|again/.test(t)) return "The kind you keep the number for.";
  if (/professional|quality/.test(t)) return "Properly considered work.";
  const first = text.split(/[.!?]/)[0]?.trim();
  return first && first.length < 90 ? first + "." : "Straight talk, solid finish.";
}

export function photoCaption(index: number): string {
  const service = brief.services[index % brief.services.length] ?? primaryTrade();
  const place = brief.service_area[index % brief.service_area.length] ?? areaLabel();
  return `No. ${String(index + 1).padStart(2, "0")} — ${service} · ${place}`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/rewir/.test(t)) return "Planned around how the property is actually used. Certificates on completion.";
  if (/light/.test(t)) return "Specified for the room, not just the floor plan. Tested before we leave.";
  if (/boiler|heat/.test(t)) return "Quoted plainly, fitted cleanly, warranty paperwork handed over.";
  if (/brake|servic/.test(t)) return "Diagnosed on the drive or in the car park. Parts locked in before we roll up.";
  if (/fault|repair/.test(t)) return "Found properly on the first visit. Plain English on what failed and what it costs.";
  return `Straightforward ${title.toLowerCase()} for homes and businesses across ${areaLabel()}.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/light/.test(t)) return ["Interior", "Garden", "Mood lighting"];
  if (/socket|switch/.test(t)) return ["USB", "Outdoor", "Spurs"];
  if (/boiler/.test(t)) return ["Combi swaps", "Servicing", "Warranty"];
  if (/brake/.test(t)) return ["Pads", "Discs", "Calipers"];
  return ["Domestic", "Commercial", areaLabel()];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  const themes = reviewThemes();
  const themeLine =
    themes.length > 0
      ? `The reviews mention the same things: ${themes.map((t) => t.toLowerCase()).join(", ")}.`
      : "Most jobs come from a name passed on, not an advert.";

  return [
    `Half the calls I take are from someone who's already had a quote that didn't sit right. Different price at the end, or a mess left behind. ${brief.business_name} is ${owner} — one trade, one standard.`,
    themeLine,
    `I quote after I've seen the job — or clear photos for smaller pieces. Same person on the phone and at the door. If something isn't right after I've gone, I come back and put it right.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.slice(0, 6).join(", ") || areaLabel();
  const items = [
    {
      q: "What areas do you cover?",
      a: `Based around ${areaLabel()}. Regular work in ${areas}. Not sure? Ring and ask — if it's sensible, I'll likely say yes.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `It's ${owner}. Same person quoting, doing the work, and sending the invoice.`,
    },
    {
      q: "Do you give written quotes?",
      a: "Yes. After a quick look at the job you get a clear price. No vague day-rates, no extras sprung at the end.",
    },
    {
      q: "How do I book you in?",
      a: brief.phone
        ? `Call ${brief.phone}. Fastest way to know if it's a quick fix or a proper job.`
        : "Use the form below — I'll come back the next working day.",
    },
  ];
  return items;
}
