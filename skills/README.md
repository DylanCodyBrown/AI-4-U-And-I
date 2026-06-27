# Skills folder

Drop a markdown (`.md`) file in here for each skill. The Skills page builds its
left-hand tree from these files automatically.

## Frontmatter

Each file starts with YAML frontmatter. `category1` and `category2` control where
the skill sits in the tree (`category1 → category2 → title`). `category2` is
optional — leave it out and the skill sits directly under `category1`.

```markdown
---
title: Mail Merge in Word
category1: Microsoft
category2: Microsoft Word
description: Generate personalized documents from a data source.
---

# Mail Merge in Word

...your skill content in normal markdown...
```

| Field         | Required | Purpose                                  |
| ------------- | -------- | ---------------------------------------- |
| `title`       | no\*     | Display name. Falls back to the filename. |
| `category1`   | yes      | Top-level tree group.                    |
| `category2`   | no       | Second-level group under `category1`.    |
| `description` | no       | Short blurb (shown on hover / in viewer).|

\* recommended.

## How it populates

A manifest (`skills/index.json`) lists every skill. It is regenerated:

- **Automatically** by the `Build indexes` GitHub Action whenever you push a
  change to `skills/**.md`.
- **Locally** by running `node scripts/build-index.mjs` (then commit the result).

Clicking a skill opens `view.html` in a new tab, which renders the markdown and
offers a download button for the raw file.
