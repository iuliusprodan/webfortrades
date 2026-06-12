import {
  brief,
  design,
  hasKnownOwner,
  hasContactName,
  contactName,
  ownerName,
  callLabelEntity,
  primaryTrade,
  areaLabel,
} from "./data";

export function heroQuoteLabel(): string {
  return "Get a free quote";
}

export function heroCallLabel(): string {
  const entity = callLabelEntity();
  return brief.phone ? `Call ${entity} - ${brief.phone}` : `Call ${entity}`;
}

export function mobileQuoteLabel(): string {
  return "Get quote";
}

export function mobileCallLabel(): string {
  return `Call ${callLabelEntity()}`;
}

export function midPageCtaAfterWork(): string {
  return "Need this sorted? Get a free quote.";
}

export function midPageCtaAfterServices(): string {
  return "Want a price before booking? Get a quote.";
}

export function midPageCtaAfterFaq(): string {
  return `Prefer to talk it through? Call ${callLabelEntity()}.`;
}

export function heroHeadline(): string {
  const custom = (design as { heroHeadline?: string }).heroHeadline?.trim();
  if (custom) return custom;

  const trade = design.trade;
  const blob = [brief.business_name, ...brief.services].join(" ").toLowerCase();
  const isPlumbing = /plumb|bathroom|leak|tap|toilet|pipe|radiator|heating/.test(blob);
  if (trade === "industrial-mechanic") return "Workshop on wheels.";
  if (/heat|boiler/.test(blob) && /heat|heating/.test(brief.business_name.toLowerCase())) {
    return "Heating you can trust.";
  }
  if (isPlumbing) return "Local plumber. Clear quotes.";
  if (trade === "warm-heating") return "Heating sorted properly.";
  return "Sparks done quietly.";
}

export function heroSub(): string {
  const area = areaLabel();
  const trade = primaryTrade().toLowerCase();
  if (hasKnownOwner()) {
    const owner = ownerName();
    return `${trade.charAt(0).toUpperCase() + trade.slice(1)} across ${area}, run by ${owner}. Straight quotes, tidy finishes, and a phone that gets answered.`;
  }
  return `${brief.business_name} covers ${area} with straight quotes, tidy finishes, and a phone that gets answered.`;
}

export function ownerNoteTitle(): string {
  if (hasKnownOwner()) return `A note from ${ownerName()}`;
  if (hasContactName()) return `A note from ${contactName()}`;
  const blob = [brief.business_name, ...brief.services].join(" ").toLowerCase();
  if (/plumb|bathroom|leak|tap|toilet/.test(blob)) return "A note from the plumber";
  return `A note from ${brief.business_name}`;
}

export function ownerNoteLabel(): string {
  if (hasKnownOwner()) return `${ownerName()}, owner`;
  if (hasContactName()) return contactName()!;
  const blob = [brief.business_name, ...brief.services].join(" ").toLowerCase();
  if (/plumb|bathroom|leak|tap|toilet/.test(blob)) return "The plumber";
  return brief.business_name;
}

export function reviewsContactMention(): string | null {
  if (!hasContactName()) return null;
  const name = contactName()!;
  const count = brief.contact_name_evidence_count ?? 0;
  if (count >= 3) {
    return `Several customers mention ${name} by name in their reviews.`;
  }
  if (count >= 2) {
    return `Customers mention ${name} by name in their reviews.`;
  }
  return null;
}

export function reviewThemes(): string[] {
  const themes: string[] = [];
  const blob = brief.reviews.map((r) => r.text.toLowerCase()).join(" ");
  if (/tidy|clean|spotless/.test(blob)) themes.push("Leaves the place spotless");
  if (/fair|price|reasonable/.test(blob)) themes.push("Fair price, no surprises");
  if (/punctual|time|reliable|reliable/.test(blob)) themes.push("Turns up when promised");
  if (/communicat|friendly/.test(blob)) themes.push("Clear communication throughout");
  if (/professional|quality|standard|finish/.test(blob)) themes.push("Work you'd photograph");
  if (/recommend|again|happy/.test(blob)) themes.push("The number people keep");
  return themes.slice(0, 5);
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/price|fair|reasonable|quote|budget/.test(t)) return "The quote on the phone is the price on the invoice.";
  if (/tidy|clean|spotless/.test(t)) return "Friendly, fair on price, leaves the place spotless.";
  if (/punctual|time|reliable/.test(t)) return "Turns up when they said they would.";
  if (/communicat/.test(t)) return "Clear communication from start to finish.";
  if (/recommend|again/.test(t)) return "The kind you keep the number for.";
  if (/professional|quality|finish|standard/.test(t)) return "Properly considered work.";
  const first = text.split(/[.!?]/)[0]?.trim();
  return first && first.length < 90 ? first + "." : "Straight talk, solid finish.";
}

export function photoCaption(index: number): string {
  const photo = brief.photos[index];
  if (photo?.caption?.trim()) return photo.caption.trim();
  const service = brief.services[index % brief.services.length] ?? primaryTrade();
  const area = areaLabel();
  return `${service} · ${area}`;
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  const area = areaLabel();
  if (/general plumbing|plumbing repair/.test(t)) {
    return `Leaks, loose fittings, noisy pipework and small repairs around ${area} homes. Clear quote before work starts.`;
  }
  if (/bathroom/.test(t)) return `Pipework, showers, basins and bathroom refits planned properly and finished cleanly.`;
  if (/heating|radiator/.test(t)) return `Radiators, valves and heating pipework checked, repaired or replaced with the system left tidy.`;
  if (/leak|pipe/.test(t)) return `Track down leaks, repair pipework and leave access panels neat where work was needed.`;
  if (/tap|toilet|shower/.test(t)) return `Running taps, weak showers and toilet faults sorted without dragging the job out.`;
  if (/commercial/.test(t)) return `Small shops, offices and rental properties. Minimal disruption and clear paperwork.`;
  if (/rewir/.test(t)) return "Planned around how the property is actually used. Certificates on completion.";
  if (/light/.test(t)) return "Specified for the room, not just the floor plan. Tested before we leave.";
  if (/boiler|heat/.test(t)) return "Quoted plainly, fitted cleanly, warranty paperwork handed over.";
  if (/brake|servic/.test(t)) return "Diagnosed on the drive or in the car park. Parts locked in before we roll up.";
  if (/fault|repair/.test(t)) return "Found properly on the first visit. Plain English on what failed and what it costs.";
  return `Straightforward ${title.toLowerCase()} for homes and businesses across ${area}.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/general plumbing|plumbing repair/.test(t)) return ["Emergency leaks", "Pipe repairs", "Home callouts"];
  if (/bathroom/.test(t)) return ["Refits", "Showers", "Basins"];
  if (/heating|radiator/.test(t)) return ["Radiators", "Valves", "Pipework"];
  if (/leak|pipe/.test(t)) return ["Leak detection", "Copper repairs", "Access made good"];
  if (/tap|toilet|shower/.test(t)) return ["Taps", "Toilets", "Showers"];
  if (/commercial/.test(t)) return ["Shops", "Offices", "Landlords"];
  if (/light/.test(t)) return ["Interior", "Garden", "Mood lighting"];
  if (/socket|switch/.test(t)) return ["USB", "Outdoor", "Spurs"];
  if (/boiler/.test(t)) return ["Combi swaps", "Servicing", "Warranty"];
  if (/brake/.test(t)) return ["Pads", "Discs", "Calipers"];
  return ["Repairs", "Installations", areaLabel()];
}

export function ownerNoteParagraphs(): string[] {
  const themes = reviewThemes();
  const themeLine =
    themes.length > 0
      ? `Reviews mention the same things: ${themes.map((t) => t.toLowerCase()).join(", ")}.`
      : "Most calls start with something small that needs sorting properly.";

  if (hasKnownOwner()) {
    const owner = ownerName();
    return [
      `Half the calls we take are from someone who has already had a quote that did not sit right. Different price at the end, or a mess left behind. ${brief.business_name} is ${owner}, one trade, one standard.`,
      themeLine,
      `We quote after seeing the job, or clear photos for smaller pieces. Same person on the phone and at the door. If something is not right after we have gone, we come back and put it right.`,
    ];
  }

  if (hasContactName()) {
    const name = contactName()!;
    const area = areaLabel();
    return [
      `Customers regularly mention ${name} by name in reviews, with comments highlighting tidy work, clear communication and reliable help across ${area}.`,
      themeLine,
      `${brief.business_name} quotes after seeing the job, or clear photos for smaller pieces. Straight price, tidy finish, and the same team from first call to last tidy-up.`,
    ];
  }

  return [
    `Most calls start with something small that needs sorting properly. A drip, a bathroom that never quite worked, or pipework that should have been fixed the first time.`,
    themeLine,
    `${brief.business_name} quotes after seeing the job, or clear photos for smaller pieces. Straight price, tidy finish, and the same team from first call to last tidy-up.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const areas = brief.service_area.slice(0, 6).join(", ") || areaLabel();
  let who: string;
  if (hasKnownOwner()) {
    who = `${ownerName()}. Same person quoting, doing the work, and sending the invoice.`;
  } else if (hasContactName()) {
    who = `${brief.business_name}. Same team quoting, doing the work, and sending the invoice. Customers often mention ${contactName()} by name in reviews.`;
  } else {
    who = `${brief.business_name}. Same team quoting, doing the work, and sending the invoice.`;
  }

  return [
    {
      q: "What areas do you cover?",
      a: `Based around ${areaLabel()}. Regular work in ${areas}. Not sure? Ring and ask. If it is sensible, we will likely say yes.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: who,
    },
    {
      q: "Do you give written quotes?",
      a: "Yes. After a quick look at the job you get a clear price. No vague day-rates, no extras sprung at the end.",
    },
    {
      q: "How do I book you in?",
      a: brief.phone
        ? `Call ${brief.phone}. Fastest way to know if it is a quick fix or a proper job.`
        : "Use the form below. We will come back the next working day.",
    },
  ];
}

export function aboutParagraph(): string {
  const areas = brief.service_area.slice(0, 4).join(", ") || areaLabel();
  if (hasKnownOwner()) {
    return `${brief.business_name} is run by ${ownerName()}, ${primaryTrade().toLowerCase()} work across ${areas}. Turn up when we said we would. Finish to a standard worth photographing. Leave the place tidier than we found it.`;
  }
  return `${brief.business_name} handles ${primaryTrade().toLowerCase()} work across ${areas}. Turn up when we said we would. Finish to a standard worth photographing. Leave the place tidier than we found it.`;
}

export function contactIntro(): string {
  if (hasKnownOwner()) {
    return `Quickest is the phone. Otherwise leave a few lines. ${ownerName()} picks these up between jobs.`;
  }
  if (hasContactName()) {
    return `Quickest is the phone. Otherwise leave a few lines and the team will come back between jobs.`;
  }
  return "Quickest is the phone. Otherwise leave a few lines and the team will come back between jobs.";
}

export function formSubmitLabel(): string {
  if (hasKnownOwner()) return `Send to ${ownerName()}`;
  return `Send to ${brief.business_name}`;
}

export function serviceAreaIntro(): string {
  return `Typical coverage around ${areaLabel()}. Ask if you are just outside the list.`;
}
