# Usher V2 - Hover-Triggered Link Summaries

**Version 3.0** - Adds hover-based summary trigger while keeping right-click functionality

## What's New in V2

### Hover Trigger
- **Hover over any link** for 500ms → summary appears automatically
- No need to right-click!
- Summary positioned intelligently next to the hyperlinked word

### Both Methods Work
- **Hover** (new): Fast preview by hovering over links
- **Right-click** (V1): Context menu "Summarize with Usher" still available

### Extension Icons
- Clean, brutalist "U" logo
- Visible in Chrome toolbar and extensions page

## Installation

### Step 1: Generate Icons (One-Time Setup)
1. Open `ICON_GENERATION.md` for instructions
2. Convert `icons/icon.svg` to PNG (16px, 48px, 128px)
3. Place PNG files in `icons/` folder

### Step 2: Load Extension
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `Usher_V2_Hover` folder
5. Extension should appear in your toolbar

## Usage

### Toggle Button (Manual Control)
A floating **"U"** button appears in the bottom-right corner:
- **Green** = Hover summaries enabled for this site
- **Gray** = Hover summaries disabled
- **Star (★)** = Manual override active
- Click to toggle on/off for the current website
- Preference saves automatically per domain

### Method 1: Hover (Fast Preview - Auto-Enabled on Articles)
1. Hover your mouse over any hyperlink on an article/blog/doc page
2. Wait 500ms (half a second)
3. Summary appears next to the link
4. Move mouse away to close, or move to summary box to keep it open

**Auto-Detection**: Hover only works on content-rich pages (articles, blogs, documentation) to prevent annoying triggers on landing pages. Use the toggle button to manually enable/disable on any page.

### Method 2: Right-Click (Works Everywhere)
1. Right-click on any hyperlink
2. Click "Summarize with Usher"
3. Summary appears next to the link

## Features

- ✅ **STRICT content detection** - Hover only on articles/blogs/docs (not landing pages)
- ✅ **Manual toggle button** - Override auto-detection for any website
- ✅ **Per-domain preferences** - Toggle settings save automatically per site
- ✅ **500ms hover delay** - Prevents accidental triggers
- ✅ **Smart positioning** - Summary appears RIGHT → LEFT → ABOVE → BELOW based on space
- ✅ **Persistent summaries** - Move mouse to summary box to keep it open
- ✅ **Instant cache hits** - Repeated links load instantly
- ✅ **Context-aware** - Uses surrounding text for better summaries
- ✅ **Both triggers work** - Use hover OR right-click

## Architecture

Same Cloudflare Workers AI backend as V1:
- **Llama 3.1 8B Instruct** for AI summaries
- **KV caching** (7-day TTL)
- **localStorage caching** (24-hour TTL)
- **<1 second latency** for new links
- **<150ms for cached** links

## Differences from V1

| Feature | V1 (Right-Click Only) | V2 (Hover + Right-Click) |
|---------|----------------------|--------------------------|
| Trigger | Right-click menu only | Hover (500ms) OR right-click |
| Icon | No icon | Brutalist "U" logo |
| Version | 2.5 | 3.0 |
| Location | `Usher_V0_MVP/` | `Usher_V2_Hover/` |

## Files Structure

```
Usher_V2_Hover/
├── manifest.json          (v3.0, with icons)
├── background.js          (hover handler added)
├── content.js             (hover detection added)
├── test.html              (testing page)
├── icons/
│   ├── icon.svg           (source logo)
│   ├── icon-16.png        (toolbar icon)
│   ├── icon-48.png        (extensions page)
│   └── icon-128.png       (web store)
├── ICON_GENERATION.md     (icon setup guide)
└── README.md              (this file)
```

## Testing

1. Load extension in Chrome
2. Open `test.html` in the extension folder
3. Try both methods:
   - Hover over links (wait 500ms)
   - Right-click on links
4. Test on real websites (Wikipedia, news sites, etc.)

## Cost

- **Free tier**: 10,000 requests/day
- **Expected usage**: ~2,000 requests/day (100 users with hover)
- **Cost**: $0/month (within free tier)

## Troubleshooting

### Hover not working on a page
1. **Check the toggle button** (bottom-right corner):
   - Green = hover enabled
   - Gray = hover disabled
   - Click to toggle on/off
2. **Auto-detection**: Hover only works on content-rich pages by default
   - Works on: Wikipedia articles, Medium posts, blog posts, documentation
   - Doesn't work on: Homepages, pricing pages, dashboards, login pages
3. **Manual override**: Click the toggle button to force-enable on any page

### Summary doesn't appear on hover
- **Wait full 500ms** - Move mouse and keep it still over link
- Check if extension is loaded (icon in toolbar)
- Try right-click method to verify extension works
- Check browser console (F12) for detection log: `Usher: Auto-detected=...`

### Toggle button missing
- Button won't appear on login/admin/dashboard pages
- Reload the page after installing extension
- Check if extension is active in `chrome://extensions`

### Right-click menu missing
- Extension may not be loaded
- Reload extension in `chrome://extensions`
- Check permissions in manifest.json

### Icons not showing
- Verify PNG files exist in `icons/` folder
- Check filenames: `icon-16.png`, `icon-48.png`, `icon-128.png`
- Reload extension after adding icons

## Development

### V1 (Baseline)
Location: `/Users/apple/Documents/Usher_V0_MVP/`
- Right-click trigger only
- Version 2.5
- Fully functional, unchanged

### V2 (This Version)
Location: `/Users/apple/Documents/Usher_V2_Hover/`
- Hover + right-click triggers
- Version 3.0
- Extension icons added

## Credits

- **AI Model**: Llama 3.1 8B Instruct (Cloudflare Workers AI)
- **Backend**: Cloudflare Workers + KV Storage
- **Design**: Brutalist aesthetic, minimal and functional

---

**Note**: V1 and V2 are completely separate builds. You can load either one, or both simultaneously for comparison.
