# Manual asset request template

Use when a strong lead has weak automatic images (low-res Facebook thumbnails, blocked downloads, or too few usable photos).

---

I found a strong lead but could not automatically download enough high-quality photos.

Please manually add 4 to 8 public images here:

`briefs/<slug>/images/manual/`

Best sources:

- `<Facebook URL>`
- `<Website URL>`
- `<Directory URLs>`
- Google profile photos

Choose:

- finished work photos
- clear rooms, projects, or detail shots
- no screenshots with Facebook UI
- no customer faces where possible
- no number plates or private addresses
- no tiny or blurry images

After adding them, tell me:

Manual assets added for `<slug>`. Validate them and continue.

Then run:

```bash
npm run assets:manual -- --slug <slug>
```
