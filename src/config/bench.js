export const BENCH = {
  ages: {
    "0-4": { t: "3\u20136 years", note: "Young children are generally more accepting but may develop resistance as they understand family dynamics." },
    "5-9": { t: "5\u20138 years", note: "School-age children have established bonds and may feel torn between loyalty to their biological parent and acceptance of you." },
    "10-13": { t: "7\u201312 years", note: "Pre-teens and early teens face the hardest adjustment. Identity formation plus loyalty conflicts create intense resistance." },
    "14-17": { t: "May extend into adulthood", note: "Teenagers are developmentally separating from ALL parents. Adding a new one at this stage is exceptionally challenging. Progress often only becomes visible when they're adults." },
  },
  custody: {
    full: "Living together full-time creates more friction but also more opportunities for small positive interactions.",
    "50-50": "Regular transitions can trigger loyalty conflicts each time. But consistent presence normalizes the relationship.",
    weekends: "Limited time means each interaction carries more weight \u2014 both positive and negative. Slower overall progress.",
    other: "Irregular or infrequent contact makes relationship-building significantly harder.",
  },
  loyalty: {
    none: "No visible loyalty conflict is a significant advantage. Progress may be faster than typical benchmarks.",
    mild: "Some tension is normal. The child may feel conflicted but isn't actively pressured to reject you.",
    strong: "Active loyalty conflict is the single biggest predictor of slower integration. This is the hardest variable, and it's not something you control.",
    unknown: "Not being sure is common. Watch for signs: does the child seem conflicted after visits with the other parent?",
  },
  outcomes: [
    { l: "Warm acceptance", d: "Genuine affection, seeks your company, introduces you as family.", p: "15\u201320%", c: "#7EB8A2" },
    { l: "Comfortable relationship", d: "Easy coexistence, shared activities, mutual respect.", p: "30\u201335%", c: "#8BAED4" },
    { l: "Respectful distance", d: "Polite, cooperative, but not close. A realistic and valid success state.", p: "25\u201330%", c: "#9DB8C7" },
    { l: "Cordial coexistence", d: "Functional household, minimal friction, limited emotional connection.", p: "15\u201320%", c: "#C9A0A0" },
    { l: "Ongoing difficulty", d: "Continued resistance that may soften in adulthood \u2014 or may not.", p: "5\u201310%", c: "#D4796B" },
  ],
};
