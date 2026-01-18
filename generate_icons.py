from PIL import Image, ImageDraw

def create_icon(size):
    # Create black background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    # Scale factors based on 128px reference
    scale = size / 128
    
    # Draw white "U" shape (simplified from SVG path)
    # Outer U
    stroke_width = max(1, int(16 * scale))
    
    # U shape coordinates (scaled)
    left_x = int(30 * scale)
    right_x = int(98 * scale)
    top_y = int(30 * scale)
    bottom_y = int(75 * scale)
    inner_left = int(46 * scale)
    inner_right = int(82 * scale)
    
    # Draw left vertical bar
    draw.rectangle([left_x, top_y, inner_left, bottom_y], fill=(255, 255, 255, 255))
    
    # Draw right vertical bar
    draw.rectangle([inner_right, top_y, right_x, bottom_y], fill=(255, 255, 255, 255))
    
    # Draw bottom curve (approximated as rectangle)
    draw.rectangle([left_x, bottom_y, right_x, int(98 * scale)], fill=(255, 255, 255, 255))
    
    # Cut out inner part to make U shape
    inner_bottom = int(85 * scale)
    draw.rectangle([inner_left, top_y, inner_right, inner_bottom], fill=(0, 0, 0, 255))
    
    # Draw small accent dot
    dot_center = int(64 * scale)
    dot_y = int(110 * scale)
    dot_radius = max(1, int(5 * scale))
    draw.ellipse([dot_center - dot_radius, dot_y - dot_radius, 
                  dot_center + dot_radius, dot_y + dot_radius], 
                 fill=(255, 255, 255, 255))
    
    return img

# Generate all three sizes
for size in [16, 48, 128]:
    img = create_icon(size)
    img.save(f'icon-{size}.png', 'PNG')
    print(f'Generated icon-{size}.png')

print('All icons generated successfully!')
