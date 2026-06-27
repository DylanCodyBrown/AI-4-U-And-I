# skills/popular/ — auto-ingested

These files are **not hand-curated** — they're popular skills whose content was
fetched from the web and stored here for local browsing/download. They populate
the "Popular" column on the Skills page and open in the local viewer.

To refresh them (one-time, re-runnable):

```bash
node scripts/ingest-popular.mjs   # re-fetch content into this folder
node scripts/build-index.mjs      # rebuild skills/popular.json
```

Edit the source list (which skills, categories) in `scripts/ingest-popular.mjs`.
Each file keeps `source`, `author`, and `license` frontmatter pointing back to
the original. Only openly-licensed (Apache-2.0) skills are copied.
