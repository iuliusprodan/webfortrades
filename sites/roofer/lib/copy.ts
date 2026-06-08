import { brief, ownerName, areaLabel } from "./data";

export function heroHeadline(): string {
  return "Roofs built to last.";
}

export function heroSub(): string {
  return `Repairs, re-roofs, flat roofing and storm damage across Sheffield and South Yorkshire. ${ownerName()} has ${brief.years_trading} years on the ladders, fixed prices where it counts, and emergency call-out when the weather turns.`;
}

export function reviewThemes(): string[] {
  return [
    "Fixed properly",
    "Fair fixed price",
    "No mess left",
    "Turned up on time",
    ...brief.service_area.slice(0, 3),
  ];
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/leak|storm|scaffold|two days/.test(t)) return "Storm leak fixed. Scaffold up. Two days.";
  if (/re-roof|terrace|ridge|fixed price/.test(t)) return "Full re-roof. Ridge line spot on.";
  if (/fascia|gutter|cleaned up|proper/.test(t)) return "Fascias replaced. Proper cleanup.";
  if (/mess/.test(t)) return "Fixed right. No mess left.";
  return "Solid roof work. Straight price.";
}

export function photoCaption(index: number): string {
  const service = brief.services[index % brief.services.length];
  const place = brief.service_area[index % brief.service_area.length];
  return `No. ${String(index + 1).padStart(2, "0")} - ${service} · ${place}`;
}

export function heroFocalCaption(): string {
  return `Re-roof / ${areaLabel()} terrace`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/repair/.test(t))
    return "Slipped slates, failed valleys, leaking flashings and storm damage patched properly. Scaffold when height demands it, not a ladder and a hope.";
  if (/re-roof|new roof/.test(t))
    return "Full strip, breathable membrane, battens checked, new covering to spec. Fixed price agreed before scaffold goes up. Ridge, hips and verges finished clean.";
  if (/flat|epdm/.test(t))
    return "Felt, EPDM and liquid systems for extensions, garages and dormers. Falls corrected, boards replaced where rotten, details sealed at parapets and outlets.";
  if (/chimney|lead/.test(t))
    return "Lead flashings, chimney stacks repointed, pots rebedded. Lead dressed and welded where joints fail, not bodged with sealant.";
  if (/gutter|fascia|soffit/.test(t))
    return "uPVC or timber fascias, soffits and rainwater goods replaced in one run. Old rotten timber out, new lines set true before the roof edge is signed off.";
  if (/storm|emergency/.test(t))
    return "Tarpaulins, temporary covers and permanent fixes after high winds. Emergency slots for active leaks. Photos help for a fast first assessment.";
  return `Reliable ${title.toLowerCase()} for homes across ${areaLabel()} and South Yorkshire.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/repair/.test(t)) return ["Scaffold safe", "Storm slots", "Written quote"];
  if (/re-roof/.test(t)) return ["Fixed price", "Breathable membrane", "Ridge detail"];
  if (/flat|epdm/.test(t)) return ["EPDM", "Board replacement", "Parapet detail"];
  if (/chimney|lead/.test(t)) return ["Lead work", "Repointing", "Stack repair"];
  if (/gutter|fascia/.test(t)) return ["uPVC or timber", "Rainwater", "Soffits"];
  if (/storm/.test(t)) return ["24h call-out", "Tarp cover", "Insurance photos"];
  return ["Sheffield", "S Yorkshire", "Domestic"];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  return [
    `Most calls start with water where it should not be. A slate in the garden, a stain on the bedroom ceiling, a ridge that moved in the last blow. My job is to get up there, find the failure, and fix it so it stays fixed.`,
    `I'm ${owner}. On the roof myself, scaffold booked when the job needs it, site cleared before I leave. No crew you have never met, no sales patter. That is how you keep work in Sheffield for ${brief.years_trading} years.`,
    `I quote after I have seen the roof, or clear photos for smaller repairs. Storm work is priced honestly before I set off. The figure we agree is the figure on the invoice.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.join(", ");
  return [
    {
      q: "What areas do you cover?",
      a: `Sheffield and South Yorkshire: ${areas}, plus most S postcodes. Bit further out? Ring and ask.`,
    },
    {
      q: "Do you offer emergency call-outs?",
      a: "Yes. Active leaks and storm damage get priority slots. Call and I will tell you honestly how fast I can get there with scaffold or a temporary cover.",
    },
    {
      q: "Do you give written quotes?",
      a: "Always. Roof inspection or photos for smaller jobs, then a clear price in writing. Full re-roofs are fixed-price once we have agreed the spec.",
    },
    {
      q: "Do you use scaffold?",
      a: "When the height or the job demands it, yes. No balancing on a ladder across three slates. Safety and a proper finish go together.",
    },
    {
      q: "How long does a re-roof take?",
      a: "A typical terrace is often three to five days weather permitting. I will give you a realistic timeline on the quote, not a vague promise.",
    },
    {
      q: "How do I book you in?",
      a: `Call ${brief.phone}. Fastest way to know if it is a patch or a full re-roof. Most routine jobs inside two weeks, storm damage when I can.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `Sole trader. It's ${owner}. Same person on the phone, on the scaffold, and signing the paperwork.`,
    },
  ];
}
