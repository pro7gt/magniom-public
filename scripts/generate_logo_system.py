import os
import base64
import io
from PIL import Image

def build_transparent_square_canvas(src_img_path, target_size=512):
    """
    Creates a transparent square image from logo.png (which has no background)
    by centering it on a transparent RGBA canvas.
    """
    img = Image.open(src_img_path).convert('RGBA')
    orig_w, orig_h = img.size # 332, 266

    base_size = max(orig_w, orig_h) # 332
    canvas = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))

    offset_x = (base_size - orig_w) // 2
    offset_y = (base_size - orig_h) // 2

    canvas.paste(img, (offset_x, offset_y), img)

    if target_size != base_size:
        return canvas.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return canvas

def main():
    src_logo = '/home/owner/Downloads/Magniom/public/logo.png'
    web_public = '/home/owner/Downloads/Magniom/apps/web/public'
    root_public = '/home/owner/Downloads/Magniom/public'
    app_dir = '/home/owner/Downloads/Magniom/apps/web/src/app'

    os.makedirs(web_public, exist_ok=True)
    os.makedirs(root_public, exist_ok=True)
    os.makedirs(app_dir, exist_ok=True)

    # Ensure master logo.png is copied to apps/web/public
    orig_img = Image.open(src_logo).convert('RGBA')
    orig_img.save(os.path.join(web_public, 'logo.png'), format='PNG')
    orig_img.save(os.path.join(root_public, 'logo.png'), format='PNG')

    # Build square transparent icons
    sq_512 = build_transparent_square_canvas(src_logo, 512)
    sq_180 = sq_512.resize((180, 180), Image.Resampling.LANCZOS)
    sq_48 = sq_512.resize((48, 48), Image.Resampling.LANCZOS)
    sq_32 = sq_512.resize((32, 32), Image.Resampling.LANCZOS)
    sq_16 = sq_512.resize((16, 16), Image.Resampling.LANCZOS)

    # Save PNGs and multi-res transparent ICOs
    for d in [web_public, root_public]:
        sq_512.save(os.path.join(d, 'icon-512.png'), format='PNG')
        sq_180.save(os.path.join(d, 'apple-touch-icon.png'), format='PNG')
        sq_32.save(
            os.path.join(d, 'favicon.ico'),
            format='ICO',
            sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=[sq_16, sq_48]
        )

    # Save to app directory for Next.js 15
    sq_32.save(
        os.path.join(app_dir, 'favicon.ico'),
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[sq_16, sq_48]
    )

    # Build SVG Favicon with transparent background and embedded base64 PNG
    buf = io.BytesIO()
    sq_180.save(buf, format='PNG')
    b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <image href="data:image/png;base64,{b64_str}" width="64" height="64" preserveAspectRatio="xMidYMid meet" />
</svg>'''

    for d in [web_public, root_public]:
        with open(os.path.join(d, 'favicon.svg'), 'w') as f:
            f.write(svg_content)
        with open(os.path.join(d, 'icon.svg'), 'w') as f:
            f.write(svg_content)

    with open(os.path.join(app_dir, 'icon.svg'), 'w') as f:
        f.write(svg_content)

    print("All MAGNIOM brand assets systematically generated from transparent public/logo.png!")

if __name__ == '__main__':
    main()
