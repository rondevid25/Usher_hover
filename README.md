# Usher - AI-Powered Link Summaries for Chrome

> Get instant AI summaries of any hyperlink without leaving your page

Usher is a Chrome extension that provides instant AI-powered summaries of any link on a webpage. Simply hover over a link or right-click to get context about where it leads—without opening a new tab.


## Features

- **Hover Summaries** - Hover over any link for 500ms to see an instant AI summary
- **Right-Click Summaries** - Classic context menu option available everywhere
- **Smart Content Detection** - Automatically enables on articles/blogs, stays quiet on landing pages
- **Manual Toggle** - Override auto-detection with a floating toggle button
- **Lightning Fast** - <1 second for new links, <150ms for cached content
- **Context-Aware** - Uses surrounding text to provide relevant summaries
- **Privacy-First** - No tracking, no data collection
- **Free Forever** - Powered by Cloudflare Workers AI (free tier)

## Demo

Try Usher on:
- Wikipedia articles
- Medium blog posts
- News websites
- Technical documentation
- Any webpage with hyperlinks

## Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/rondevid25/Usher_hover.git
   cd Usher_hover
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions` in Chrome
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the repository folder
   - Usher icon should appear in your toolbar


## Usage

### 🎯 Quick Start

**Method 1: Hover (Fastest)**
1. Visit any article or blog post
2. Hover your mouse over any hyperlink
3. Wait 500ms (half a second)
4. AI summary appears next to the link

**Method 2: Right-Click (Classic)**
1. Right-click on any link
2. Select "Summarize with Usher"
3. Summary appears instantly

### 🎛️ Toggle Button

A floating **"U"** button appears in the bottom-right corner:

- **🟢 Green** = Hover summaries enabled for this site
- **⚫ Gray** = Hover summaries disabled
- **⭐ Star** = Manual override active

Click to toggle hover summaries on/off for the current website. Your preference is saved per domain.

### 📍 Auto-Detection

Usher intelligently detects content-rich pages:

**Auto-Enabled on:**
- Wikipedia articles
- Medium posts
- Blog articles
- Documentation pages
- News articles

**Auto-Disabled on:**
- Homepage/landing pages
- Pricing pages
- Login/signup pages
- Dashboards
- E-commerce checkouts

Use the toggle button to override auto-detection on any page.

## How It Works

```
User hovers over link
         ↓
Extension extracts context (anchor text + surrounding sentences)
         ↓
Check local cache (instant if cached)
         ↓
POST to Cloudflare Worker
         ↓
Worker checks KV cache (global CDN cache)
         ↓
Worker fetches & summarizes with Llama 3.1 8B
         ↓
Summary returned & cached
         ↓
Display summary next to link
```


## Privacy & Security

- ✅ **No tracking** - No analytics, no user data collection
- ✅ **No account required** - Install and use immediately
- ✅ **Minimal permissions** - Only requests necessary Chrome APIs
- ✅ **Open source** - Audit the code yourself
- ✅ **Secure communication** - HTTPS-only API calls

Usher only sends:
- URL of the link you're summarizing
- Anchor text of the link
- 2 sentences before/after the link (for context)

No personal data, browsing history, or page content is collected.

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue with reproduction steps
2. **Suggest features** - Share your ideas in discussions
3. **Submit PRs** - Fork, make changes, and submit a pull request
4. **Improve docs** - Help make this README better

### Development Guidelines

- Follow existing code style (brutalist, minimal)
- Test on multiple websites before submitting
- Update README if adding new features
- Keep dependencies minimal (currently zero)


## FAQ

**Q: Is this free?**
A: Yes, completely free forever. Powered by Cloudflare Workers' free tier.

**Q: Does it work on all websites?**
A: May not work in paywalled URLs. Hover auto-enables only on content-rich pages (articles, blogs, docs).

**Q: Can I disable hover and only use right-click?**
A: Yes! Click the toggle button to disable hover for any site.

**Q: Does it work offline?**
A: Cached summaries work offline. New links require internet connection.

**Q: How accurate are the summaries?**
A: Powered by Llama 3.1 8B - highly accurate for most content. Quality improves with better anchor text context.

**Q: Can I use this on mobile?**
A: Not yet. Chrome extensions don't support hover on mobile. Right-click functionality may work on tablets.

## Credits

- **AI Model**: Llama 3.1 8B Instruct (Meta)
- **Backend**: Cloudflare Workers AI
- **Design**: Brutalist aesthetic
- **Inspiration**: Desire to read faster and browse smarter



## Support

- 🐛 **Bug reports**: [Open an issue](https://github.com/rondevid25/Usher_hover/issues)
- 💡 **Feature requests**: [Start a discussion](https://github.com/rondevid25/Usher_hover/discussions)
- 📧 **Contact**: insaneswithbrains@gmail.com

---

**Made by Ronak D 

*If Usher helps you browse faster, give it a ⭐ on GitHub!*
