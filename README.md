# WNC Safer Miles

A community map of parks, greenways and trails in western North Carolina, scored on what makes a place feel safer for women running or walking alone: lighting, foot traffic, sightlines, cell signal, staff presence and visible parking. Women rate places anonymously through a short form, and their ratings blend into each place's score.

- `index.html` is the whole site.
- `ratings.json` holds aggregated ratings (score, time of day, tags) and nothing else. It is refreshed automatically each morning from the English and Spanish rating forms by a scheduled AI task.

## How this was built

Concept, priorities and design decisions: Alison Rose. The code, page text, safety tips, Spanish translation, rating forms and daily update were built with Claude, an AI model by Anthropic, using Claude Code under her direction in October 2026. The starting factor scores come from a structured review of public evidence (official park pages, local news and Google Maps listings), not site visits, and are being corrected through community ratings and field visits. Places closed or damaged by Hurricane Helene are shown but not scored. The Spanish version is an AI draft awaiting native-speaker review. Full details: [about.html](https://connectalisonrose-lab.github.io/buncombe-safer-miles/about.html#built).

The map rates places, never people. It never shows who rated, when anyone goes, or anyone's location.

© 2026 Alison Rose. All rights reserved. Concept, content and design direction belong to Alison Rose, who holds full creative control over this work.
