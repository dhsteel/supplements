// Ellie's supplement routine. Edit this file to change what shows up in the app.
//
// Each section ("slot") is a time of day. Each item is ONE line:
//   { id: 'unique-id', name: 'What it is', note: 'Small grey text', when: '...' },
//
// `when` is optional. Leave it out for every day, or use:
//   'iron'    iron days only (alternates with zinc)
//   'zinc'    zinc days only
//   'gym'     only when Gym day is switched on
//   'sunday'  Sundays only
// Add `weekly: true` to count a check for the whole week (Mon–Sun) instead of one day,
// and `tag: 'Sundays'` to show a little badge next to the name.
//
// To add a supplement: copy an item line and change it. To drop one: delete its line.
// Keep each `id` the same once you've used it, since saved checks are stored by id.
// A section with no items showing that day hides itself.

window.ROUTINE = [
  { title: 'On waking', note: 'Empty stomach. Wait 30–60 min before coffee, tea or dairy.', items: [
    { id: 'iron', name: 'Iron, 28 mg', note: "Nature's Truth iron bisglycinate, 1 capsule. With water, or a small snack if it bugs your stomach.", when: 'iron' },
    { id: 'vitc', name: 'Vitamin C gummies, 250 mg', note: 'Nature Made. Every morning; on iron days it also helps the iron absorb.' },
  ]},
  { title: 'Morning coffee', note: 'At least 30–60 min after the iron.', items: [
    { id: 'collagen', name: 'Collagen, 1–2 tbsp', note: 'Stirred into your coffee.' },
  ]},
  { title: 'Biggest meal', note: 'One with some fat in it.', items: [
    { id: 'multi', name: 'Multivitamin, 2 gummies', note: 'Nature Made Multi + Omega-3.' },
    { id: 'omega', name: 'Omega-3 mini gels, 2', note: 'Fridge storage helps with fishy burps.' },
    { id: 'd2', name: 'Vitamin D2, 50,000 IU', note: 'Once a week, until the bottle is finished.', when: 'sunday', weekly: true, tag: 'Sundays' },
  ]},
  { title: 'Gym', note: 'Before or during your workout.', items: [
    { id: 'electrolytes', name: 'Electrolytes', note: 'Gym days only.', when: 'gym' },
  ]},
  { title: 'Dinner', note: 'Zinc is easier on your stomach with food.', items: [
    { id: 'zinc', name: 'Zinc, 30 mg', note: 'Nature Made, 1 tablet with your meal.', when: 'zinc' },
  ]},
  { title: 'Bedtime', note: "Calcium goes last so it doesn't block iron or zinc.", items: [
    { id: 'calcium', name: 'Citracal Petites, 1 caplet', note: 'No food needed. Fine to skip on heavy-dairy days.' },
    { id: 'mag', name: 'Magnesium glycinate, 2 gummies', note: 'For sleep and recovery.' },
  ]},
];
