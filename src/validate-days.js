function validateDays(days) {
  const ids = new Set();
  for (const day of days) for (const a of day.items) {
    if (ids.has(a.id)) throw new Error(`Duplicate article ID: ${a.id}`);
    ids.add(a.id);
    if (a.day !== day.date || !a.id.startsWith(day.date + '-')) {
      throw new Error(`Article ${a.id} belongs to ${a.day}, not ${day.date}`);
    }
  }
}
module.exports = { validateDays };
