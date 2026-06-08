import { brief, ownerName, areaLabel } from "./data";

export function heroHeadline(): string {
  return "Plumbing you can trust.";
}

export function heroSub(): string {
  return `Emergency leaks, bathrooms, boilers and drains across Bristol. ${ownerName()} has ${brief.years_trading} years on the tools, fixed prices where it matters, and a 24-hour callout when you need it.`;
}

export function reviewThemes(): string[] {
  return [
    "Calm and clean",
    "Fair fixed price",
    "Honest advice",
    "Sorted it fast",
    ...brief.service_area.slice(0, 3),
  ];
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/burst|hour|sink/.test(t)) return "Burst pipe sorted within the hour.";
  if (/bathroom|week|fixed/.test(t)) return "Full bathroom. Fair fixed price.";
  if (/honest|upsell|boiler/.test(t)) return "Honest on the boiler. No upsell.";
  if (/calm|clean|fast/.test(t)) return "Calm, clean, fast.";
  if (/tidy/.test(t)) return "Tidy work throughout.";
  return "Straight talk, solid finish.";
}

export function photoCaption(index: number): string {
  const service = brief.services[index % brief.services.length];
  const place = brief.service_area[index % brief.service_area.length];
  return `No. ${String(index + 1).padStart(2, "0")} - ${service} · ${place}`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/emergency|leak/.test(t))
    return "Burst pipes, leaking cylinders and dripping joints. Same-day attendance across Bristol when you call before midday, 24h for true emergencies.";
  if (/bathroom/.test(t))
    return "Full bathroom refits from rip-out to tiling. One fixed price agreed upfront, one plumber on site throughout, certificates where required.";
  if (/boiler|cylinder/.test(t))
    return "Faulty valves, pressure loss, lukewarm water. Diagnosed properly before parts are ordered. No scare stories, just what the system needs.";
  if (/burst|frozen/.test(t))
    return "Frozen loft pipes and split joints in cold snaps. Thawed safely, repaired properly, lagging advice included so it does not happen twice.";
  if (/tap|toilet|shower/.test(t))
    return "Dripping taps, running toilets, weak showers. Most fixes same visit. Parts carried for common Bristol housing stock.";
  if (/drain|block/.test(t))
    return "Slow sinks, blocked WCs, gurgling stacks. Cleared with the right kit, not just a quick plunge and a hope.";
  return `Reliable ${title.toLowerCase()} for homes across ${areaLabel()} and nearby.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/emergency|leak/.test(t)) return ["24h callout", "Same-day", "Insurance paperwork"];
  if (/bathroom/.test(t)) return ["Fixed price", "Tiling", "Waste disposal"];
  if (/boiler|cylinder/.test(t)) return ["Pressure test", "Parts sourced", "G3 where needed"];
  if (/burst|frozen/.test(t)) return ["Thaw safely", "Pipe repair", "Lagging advice"];
  if (/tap|toilet|shower/.test(t)) return ["Same visit", "Common parts", "No mess"];
  if (/drain/.test(t)) return ["CCTV if needed", "Stack access", "Written quote"];
  return ["Bristol", "BS postcodes", "Domestic"];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  return [
    `Most calls start stressed. A leak under the sink, a boiler that will not stay on, a bathroom you have been putting off for two years. My job is to turn up calm, explain what is actually wrong, and fix it without the drama.`,
    `I'm ${owner}. One van, proper kit, no call-centre in the middle. If I make a mess I clean it, if something is not right I come back. That is how you get repeat work in Bristol for ${brief.years_trading} years.`,
    `I quote after I have seen the job, or clear photos for smaller pieces. Emergency rates are explained before I set off. The figure we agree is the figure on the invoice.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.join(", ");
  return [
    {
      q: "What areas do you cover?",
      a: `Bristol and the surrounding neighbourhoods: ${areas}, plus most BS1 to BS16 postcodes. Bit further out? Ring and ask.`,
    },
    {
      q: "Do you offer emergency callouts?",
      a: "Yes. True emergencies (active leaks, no hot water in winter, blocked mains) are 24h. Call and I will tell you honestly how fast I can get there.",
    },
    {
      q: "Do you give written quotes?",
      a: "Always. Site visit or photos for smaller jobs, then a clear price in writing. Bathroom refits are fixed-price once we have agreed the spec.",
    },
    {
      q: "Are you Gas Safe registered?",
      a: "For boiler and cylinder work that touches gas, yes. I will show my card on request. Purely water-side jobs do not need it.",
    },
    {
      q: "How do I book you in?",
      a: `Call ${brief.phone}. Fastest way to know if it is a quick fix or a full day. Most routine jobs inside a week, emergencies when I can.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `Sole trader. It's ${owner}. Same person on the phone, at the door, and signing the paperwork.`,
    },
  ];
}
