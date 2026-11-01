// Sample replies for the assistant. Swap `getMockReply` for a real AI call
// later; the chat UI only needs a string back.

export const SUGGESTED_PROMPTS = [
  "What crop is best for my location this month?",
  "Is it a good time to plant rice?",
  "How can I protect my crops from drought?",
  "Explain today's soil moisture data.",
];

type Reply = { match: RegExp; text: string };

const REPLIES: Reply[] = [
  {
    match: /best|which crop|what crop|recommend/i,
    text: "For Cabanatuan City this November, your top picks are:\n\n1. Rice (92% match): soil moisture is holding at 34% and irrigation water is available. Plant Nov 15 to Dec 31.\n2. Mung bean (88%): great right after your rice harvest. It uses leftover moisture and puts nitrogen back in the soil.\n3. Tomato (84%): cooler nights from December help the flowers set fruit.\n\nIf your plot is rain-fed with no irrigation, I'd lean toward mung bean, since rainfall is forecast 30% below normal from January.",
  },
  {
    match: /rice|palay/i,
    text: "Yes, the next 6 weeks are a good window for dry-season rice in your area.\n\n- Soil moisture: 34%, good for land preparation without extra water.\n- Temperature: 29 to 31 °C in the day, ideal for tillering.\n- Sunlight: 5.6 kWh/m² per day. Clear skies mean higher yields than the wet season.\n\nOne caution: heavy rain is possible on Tuesday. Wait until it passes before you broadcast fertilizer. Aim to transplant 18 to 21 day old seedlings between Nov 15 and Dec 31.",
  },
  {
    match: /drought|dry|water|irrigat/i,
    text: "A dry spell is forecast from January. Here's how to prepare:\n\n- Mulch: cover the soil with rice straw to keep moisture in and cut evaporation by up to 30%.\n- Plant early: get crops in by mid-December so they flower before the driest weeks.\n- Choose tough crops: mung bean and sweet potato handle dry soil far better than corn or vegetables.\n- Alternate wetting and drying (AWD) for rice: let the field dry until water is 15 cm below the surface, then re-flood. This saves about 25% of water with no yield loss.\n- Water early: irrigate before 8 AM so less water is lost to heat.",
  },
  {
    match: /soil|moisture/i,
    text: "Today's soil moisture in your area is 34%. That's measured by NASA's SMAP satellite in the top 5 cm of soil.\n\nWhat it means:\n- Below 20%: too dry, roots struggle.\n- 30 to 40%: comfortable for most crops. You're here.\n- Above 45%: waterlogged, roots can rot.\n\nIt has dropped 3% this week as the rains taper off. This is a good time to prepare land and plant, because you can use this moisture without irrigating.",
  },
  {
    match: /pest|armyworm|bug|insect/i,
    text: "Fall armyworm risk is high near you over the next 14 days.\n\n- Scout every 3 days: look for ragged holes and sawdust-like droppings in the leaf whorl.\n- Act early: young larvae are much easier to control. Neem or Bt-based sprays work well at this stage.\n- Hand-pick egg masses on the undersides of leaves.\n- Set pheromone traps at the field edges to track moth numbers.\n\nCorn and onion are most at risk right now.",
  },
];

const FALLBACK =
  "Good question. Based on the latest data for Cabanatuan City: it's 30 °C, soil moisture is 34%, and rainfall is tapering off as the dry season begins. Could you tell me which crop or field you're asking about? Then I can give you more specific advice.";

export function getMockReply(prompt: string): string {
  return REPLIES.find((r) => r.match.test(prompt))?.text ?? FALLBACK;
}
