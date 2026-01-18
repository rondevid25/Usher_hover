# Usher Icon Generation Guide

## Icon Files Needed

Chrome extensions require 3 icon sizes:
- **16x16px** - Extension toolbar icon
- **48x48px** - Extension management page
- **128x128px** - Chrome Web Store listing

## Current Status

✅ SVG template created at `icons/icon.svg`
⏳ PNG files need to be generated (see options below)

## Option 1: Online Conversion (Easiest - 2 minutes)

### Using CloudConvert (Free)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icons/icon.svg`
3. Click "Convert"
4. Download and save as `icon-128.png`

### Resize to other sizes:
5. Go to https://www.iloveimg.com/resize-image
6. Upload `icon-128.png`
7. Resize to 48x48px → Save as `icon-48.png`
8. Resize to 16x16px → Save as `icon-16.png`

## Option 2: Using ImageMagick (If installed)

```bash
cd /Users/apple/Documents/Usher_V2_Hover/icons

# Convert SVG to PNG at different sizes
convert -background none icon.svg -resize 128x128 icon-128.png
convert -background none icon.svg -resize 48x48 icon-48.png
convert -background none icon.svg -resize 16x16 icon-16.png
```

## Option 3: Using macOS Preview

1. Open `icon.svg` in Preview
2. File → Export → Format: PNG → Resolution: 128 DPI
3. Save as `icon-128.png`
4. Repeat for 48px and 16px versions

## Option 4: Use Figma/Sketch/Canva (Best Quality)

1. Import `icon.svg` into design tool
2. Export as PNG at:
   - 128x128px
   - 48x48px
   - 16x16px
3. Ensure transparent background
4. Save with exact filenames

## Final File Structure

After conversion, your `icons/` folder should contain:

```
icons/
├── icon.svg          (source file, keep for future edits)
├── icon-16.png       (16x16px)
├── icon-48.png       (48x48px)
└── icon-128.png      (128x128px)
```

## Custom Logo Design

Want a different logo? Edit `icon.svg` or create new icons:

**Design guidelines:**
- Keep it simple (recognizable at 16px)
- High contrast (black background + white elements works well)
- Matches brutalist aesthetic
- Square aspect ratio (128x128)

**Current logo concept:**
- Bold white "U" letter on black background
- Minimal, brutalist style
- Small dot accent below (represents summary)
