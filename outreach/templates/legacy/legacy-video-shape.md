# Legacy two-message pitch (scroll video enabled only)

Use only when `site_design.scroll_video_enabled: true` in config.yaml. Default is **off**; see the main touch-1 templates for the single-message shape.

## WhatsApp touch 1 (contact name unknown)

Two consecutive messages. Wait at least 2 seconds between them.

### Message 1

```
Hi, is this {business_name}?

I'm Julius. I put together a website for {business_name} and thought I'd send it over in case it's useful.

{site_url}

Happy to change anything on it. If you'd like to keep it, just let me know.
```

### Message 2

```
Here is a short scroll-through of the site. (scroll video attached)
```

Attachment: `previews/{slug}/scroll.mp4` or `briefs/{slug}/outreach/site-scroll.mp4`

## WhatsApp touch 1 (contact name known)

### Message 1

```
Hi {contact_first_name}, I'm Julius. I put together a website for {business_name} and thought I'd send it over in case it's useful.

{site_url}

Happy to change anything on it. If you'd like to keep it, just let me know.
```

### Message 2

Send the mp4 as attachment. No site URL in this message.

```
Here is a short scroll-through of the site. (scroll video attached)
```

Hosted video URL variant:

```
Here is a short scroll-through of the site.

{video_url}
```

## WhatsApp touch 1 (redesign / HAS_REAL_SITE)

### Message 1

```
Hi, is this {business_name}?

I'm Julius. We put together an alternative direction for {area} {trade_plural} and thought I'd send it over in case it's useful.

{site_url}

Happy to change anything on it. If you'd like to keep it, just let me know.
```

### Message 2

```
Here is a short scroll-through of the site. (scroll video attached)
```

## SMS touch 1 - message 2

```
Short scroll-through of the site:

{video_url}
```

Or when video is sent as MMS attachment:

```
Here is a short scroll-through of the site. (scroll video attached)
```

## Email touch 1 optional video block

Append when a hosted video URL exists:

```
Here is a short scroll-through video:

{video_url}
```

Rules for all legacy shapes:
- Site link only in message 1 (WhatsApp/SMS).
- Blank lines around every URL.
- Never combine site URL and video URL in the same message.
