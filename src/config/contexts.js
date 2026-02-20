export const CONTEXTS = [
  { id: "morning" },
  { id: "afternoon" },
  { id: "evening" },
  { id: "night" },
  { id: "after_custody_transition" },
  { id: "after_bio_parent_contact" },
  { id: "after_discipline_moment" },
  { id: "during_shared_activity" },
  { id: "at_mealtime" },
  { id: "at_bedtime" },
  { id: "weekend" },
  { id: "school_day" },
  { id: "holiday_special_occasion" },
  { id: "after_argument_with_partner" },
];

// Maps old string-based context values to new IDs for migration
export const CONTEXT_MIGRATION = {
  "Morning": "morning",
  "Afternoon": "afternoon",
  "Evening": "evening",
  "Night": "night",
  "After custody transition": "after_custody_transition",
  "After bio-parent contact": "after_bio_parent_contact",
  "After discipline moment": "after_discipline_moment",
  "During shared activity": "during_shared_activity",
  "At mealtime": "at_mealtime",
  "At bedtime": "at_bedtime",
  "Weekend": "weekend",
  "School day": "school_day",
  "Holiday / special occasion": "holiday_special_occasion",
  "After argument with partner": "after_argument_with_partner",
};
