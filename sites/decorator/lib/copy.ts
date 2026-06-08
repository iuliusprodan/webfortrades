import { brief, ownerName, areaLabel } from "./data";
import type { GalleryPair } from "./types";

export function heroHeadline(): string {
  return "Finish you can see in the light.";
}

export function heroSub(): string {
  return `Interior and exterior painting, wallpapering and careful prep across York. ${ownerName()} has ${brief.years_trading} years making rooms feel finished, not just painted over.`;
}

export function reviewThemes(): string[] {
  return [
    "Immaculate finish",
    "Proper prep",
    "Dust sheets everywhere",
    "Period detail",
    ...brief.service_area.slice(0, 3),
  ];
}

export function reviewHeadline(text: string): string {
  const t = text.toLowerCase();
  if (/hallway|downstairs|immaculate|dust/.test(t)) return "Whole downstairs. Immaculate hallway.";
  if (/sash|period|prep|windows/.test(t)) return "Period sash windows. Proper prep.";
  if (/wallpaper|perfectionist|feature/.test(t)) return "Tricky wallpaper. Hung perfectly.";
  if (/tidy|careful/.test(t)) return "Tidy, careful throughout.";
  return "Craft you can see close up.";
}

export function galleryFeatureCaption(): string {
  return `Featured project · Interior painting · ${brief.service_area[1] ?? "York"}`;
}

export function galleryBeforeAfterPairs(): GalleryPair[] {
  return [
    {
      title: "Hallway refresh",
      place: "Clifton",
      service: "Interior painting",
    },
    {
      title: "Period sash windows",
      place: "Fulford",
      service: "Woodwork and trim",
    },
    {
      title: "Feature wallpaper",
      place: "York",
      service: "Wallpapering",
    },
  ];
}

export function galleryDetailCaptions(): string[] {
  return [
    `Heritage cornice · ${brief.service_area[2]}`,
    `Exterior masonry · ${brief.service_area[5] ?? "Tadcaster"}`,
  ];
}

export function serviceDescription(title: string): string {
  const t = title.toLowerCase();
  if (/interior/.test(t))
    return "Walls, ceilings, woodwork and staircases. Filled, sanded, primed where it matters, then two careful coats. Furniture covered, floors protected, edges cut by hand.";
  if (/exterior/.test(t))
    return "Masonry, render, fascia and front doors. Scraped back to sound substrate, weather-appropriate systems, colour matched to period stock or your sample.";
  if (/wallpaper/.test(t))
    return "Patterned papers, murals and lining walls. Walls sized, plumb lines marked, seams rolled flat. Tricky drops around chimney breasts are where the patience shows.";
  if (/plaster|filler|prep/.test(t))
    return "Cracks chased out, blown plaster made good, filler feathered flat. The paint only looks expensive when the prep underneath is honest.";
  if (/woodwork|trim/.test(t))
    return "Skirting, architraves, doors and sash frames. Degreased, lightly abraded, undercoated, then satin or eggshell to the sheen you want.";
  if (/heritage|period/.test(t))
    return "Lime-friendly washes, traditional gloss systems and colour research for listed terraces. Finish that reads right from the pavement.";
  return `Reliable ${title.toLowerCase()} for homes across ${areaLabel()} and nearby.`;
}

export function serviceTags(title: string): string[] {
  const t = title.toLowerCase();
  if (/interior/.test(t)) return ["Dust sheets", "Cutting in", "Colour advice"];
  if (/exterior/.test(t)) return ["Scrape & sand", "Masonry paint", "Scaffold liaison"];
  if (/wallpaper/.test(t)) return ["Pattern match", "Lining paper", "Murals"];
  if (/plaster|prep/.test(t)) return ["Crack repair", "Skim patches", "Sanding"];
  if (/woodwork/.test(t)) return ["Satinwood", "Sash frames", "Doors"];
  if (/heritage/.test(t)) return ["Listed stock", "Lime wash", "Sample panels"];
  return ["York", "Written quote", "Domestic"];
}

export function ownerNoteParagraphs(): string[] {
  const owner = ownerName();
  return [
    `Most people book a decorator when the room has started to bother them. Scuffed woodwork, a colour that never quite worked, wallpaper that has peeled at the corner. My job is to make it look deliberate again, not rushed.`,
    `I'm ${owner}. On site myself, dust sheets down before a brush is opened, edges cut properly, and the place left tidy at the end of the day. That is how you keep work in York for ${brief.years_trading} years.`,
    `I quote after I have seen the surfaces, or clear photos for smaller rooms. The price we agree is the price on the invoice. No day-rate surprises halfway through a hallway.`,
  ];
}

export function faqItems(): { q: string; a: string }[] {
  const owner = ownerName();
  const areas = brief.service_area.join(", ");
  return [
    {
      q: "What areas do you cover?",
      a: `York and the surrounding villages: ${areas}, plus most YO postcodes. Bit further out? Ring and ask.`,
    },
    {
      q: "Do you move furniture and protect floors?",
      a: "Yes. Furniture shifted and covered, floors sheeted, switches masked. The aim is to leave the room usable that evening where possible.",
    },
    {
      q: "Do you supply paint or do I buy it?",
      a: "Either works. I can supply trade-grade paint at cost, or use your chosen brand if you have a specific colour card in mind.",
    },
    {
      q: "How long does a typical room take?",
      a: "A standard bedroom is often two to three days with proper prep. Hallways and woodwork take longer. I will give you a realistic timeline on the quote.",
    },
    {
      q: "Can you work on period properties?",
      a: "Yes. Sash windows, cornices and lime plaster need a lighter touch. I will advise on systems that suit the building, not just what is fastest.",
    },
    {
      q: "How do I book you in?",
      a: `Call ${brief.phone} or use the form below. Site visits for larger jobs, photos fine for a single room. Most work booked two to four weeks ahead.`,
    },
    {
      q: "Are you a sole trader or a firm?",
      a: `Sole trader. It's ${owner}. Same person measuring up, painting, and signing the paperwork.`,
    },
  ];
}
