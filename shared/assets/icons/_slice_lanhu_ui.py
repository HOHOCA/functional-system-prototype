#!/usr/bin/env python3
"""Slice Lanhu sprites and copy labelled icons into shared/assets/icons/ui/."""
import os
import shutil
import struct
import zlib

ROOT = os.path.dirname(os.path.abspath(__file__))
UI = os.path.join(ROOT, 'ui')
LANHU = '/Users/chenyang/Downloads/LanhuProject'
os.makedirs(UI, exist_ok=True)


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def decode_png(path):
    with open(path, 'rb') as f:
        data = f.read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', path
    pos = 8
    w = h = bit_depth = color_type = None
    raw = b''
    palette = None
    trans = None
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b'IHDR':
            w, h, bit_depth, color_type = struct.unpack('>IIBB', chunk[:10])
        elif ctype == b'PLTE':
            palette = [chunk[i:i + 3] for i in range(0, len(chunk), 3)]
        elif ctype == b'tRNS':
            trans = chunk
        elif ctype == b'IDAT':
            raw += chunk
        elif ctype == b'IEND':
            break
    decompressed = zlib.decompress(raw)
    if bit_depth != 8:
        raise ValueError(f'unsupported bit depth {bit_depth} in {path}')
    if color_type == 6:
        bpp = 4
    elif color_type == 2:
        bpp = 3
    elif color_type == 0:
        bpp = 1
    elif color_type == 3:
        bpp = 1
    else:
        raise ValueError(f'unsupported color type {color_type} in {path}')
    stride = w * bpp
    rows = []
    i = 0
    prev = bytearray(stride)
    for y in range(h):
        filt = decompressed[i]
        i += 1
        row = bytearray(decompressed[i:i + stride])
        i += stride
        if filt == 1:
            for x in range(stride):
                left = row[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + left) & 255
        elif filt == 2:
            for x in range(stride):
                row[x] = (row[x] + prev[x]) & 255
        elif filt == 3:
            for x in range(stride):
                left = row[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + ((left + prev[x]) // 2)) & 255
        elif filt == 4:
            for x in range(stride):
                left = row[x - bpp] if x >= bpp else 0
                up = prev[x]
                ul = prev[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + paeth(left, up, ul)) & 255
        elif filt != 0:
            raise ValueError(f'filter {filt} in {path}')
        rows.append(row)
        prev = row
    rgba = []
    for y, row in enumerate(rows):
        line = []
        for x in range(w):
            if color_type == 6:
                r, g, b, a = row[x * 4:x * 4 + 4]
            elif color_type == 2:
                r, g, b = row[x * 3:x * 3 + 3]
                a = 255
            elif color_type == 0:
                r = g = b = row[x]
                a = 255
            else:
                idx = row[x]
                r, g, b = palette[idx]
                a = trans[idx] if trans and idx < len(trans) else 255
            line.append((r, g, b, a))
        rgba.append(line)
    return w, h, rgba


def encode_png(path, pixels):
    h = len(pixels)
    w = len(pixels[0]) if h else 0
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for r, g, b, a in pixels[y]:
            raw.extend((r, g, b, a))
    compressed = zlib.compress(bytes(raw), 9)
    def chunk(tag, data):
        out = struct.pack('>I', len(data)) + tag + data
        return out + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))


def crop(pixels, x0, y0, x1, y1):
    return [row[x0:x1] for row in pixels[y0:y1]]


def pixel_on(px, alpha_min=20):
    r, g, b, a = px
    if a < alpha_min:
        return False
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn > 18:
        return True
    if mx < 90:
        return True
    return False


def nonempty_cols(pixels, merge_gap=10):
    h = len(pixels)
    w = len(pixels[0])
    cols = [any(pixel_on(pixels[y][x]) for y in range(h)) for x in range(w)]
    runs = []
    start = None
    for x, on in enumerate(cols):
        if on and start is None:
            start = x
        elif not on and start is not None:
            runs.append((start, x))
            start = None
    if start is not None:
        runs.append((start, w))
    if not runs:
        return runs
    merged = [list(runs[0])]
    for a, b in runs[1:]:
        if a - merged[-1][1] <= merge_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return [(a, b) for a, b in merged]


def trim_rows(pixels):
    h = len(pixels)
    w = len(pixels[0]) if h else 0
    ys = [y for y in range(h) if any(pixel_on(pixels[y][x]) for x in range(w))]
    if not ys:
        return pixels
    return pixels[ys[0]:ys[-1] + 1]


def slice_sprite(src, names, dest_dir=UI, pad=1, merge_gap=4):
    w, h, pixels = decode_png(src)
    runs = nonempty_cols(pixels, merge_gap=merge_gap)
    print(f'{os.path.basename(src)} {w}x{h} glyphs={len(runs)} names={len(names)}')
    for i, name in enumerate(names):
        if i >= len(runs):
            print(f'  missing glyph {i} {name}')
            continue
        x0, x1 = runs[i]
        x0 = max(0, x0 - pad)
        x1 = min(w, x1 + pad)
        tile = trim_rows(crop(pixels, x0, 0, x1, h))
        out = os.path.join(dest_dir, name)
        encode_png(out, tile)
        print(f'  {name} {len(tile[0])}x{len(tile)}')


def copy(src, name):
    dst = os.path.join(UI, name)
    shutil.copy2(src, dst)
    print(f'copy {name}')


ICON1 = os.path.join(LANHU, 'lanhu_icon1/img')
ROI = os.path.join(LANHU, 'lanhu_cebianlanroiliebiao/img')
POI = os.path.join(LANHU, 'lanhu_cebianlanpoiliebiao/img')
V2D = os.path.join(LANHU, 'lanhu_2dshitu/img')
V3D = os.path.join(LANHU, 'lanhu_3dshitu/img')
CTRL = os.path.join(LANHU, 'lanhu_icon1/img')

def main():
    # merge_gap=4：蓝湖 2D 阅片框工具条共 10 个 glyph；勿用过大 gap 合并错位
    slice_sprite(
        os.path.join(V2D, 'SketchPngf35b41c0a8249be97da1a5bbb4641080cabb71353f8ff8c7b8be66c167028a94.png'),
        [
            'view-zoom-plus.png',
            'view-add.png',
            'view-zoom.png',
            'view-pan.png',
            'view-wl.png',
            'view-rotate.png',
            'view-measure.png',
            'view-maximize.png',
            'view-grid.png',
            'view-grid-alt.png',
        ],
        pad=1,
    )
    slice_sprite(
        os.path.join(POI, 'SketchPngea69750766ece2b39d0a6ef3ad7833998929a9aa9ab4a356d04067b6850b0a08.png'),
        ['ui-eye.png', 'ui-poi-add.png', 'ui-trash.png', 'ui-move.png'],
    )
    slice_sprite(
        os.path.join(CTRL, 'SketchPng572f3ccf7e4f526331a1034ef930a4a201f15e66b58acda3998c56a10b283711.png'),
        [
            'ctrl-eye.png',
            'ctrl-target.png',
            'ctrl-import.png',
            'ctrl-fill.png',
            'ctrl-shrink.png',
            'ctrl-expand.png',
            'ctrl-layers.png',
            'ctrl-layers2.png',
            'ctrl-bag.png',
            'ctrl-trash.png',
            'ctrl-reset.png',
            'ctrl-plus.png',
            'ctrl-move.png',
            'ctrl-copy.png',
        ],
    )
    slice_sprite(
        os.path.join(V3D, 'SketchPnge49122186bfb5e3a691f1d39075c55f61105c7b1db382172794748c0a69c4c92.png'),
        [
            'view-layout.png',
            'view-link.png',
            'view-add2.png',
            'view3d-zoom.png',
            'view3d-pan.png',
            'view3d-wl.png',
            'view3d-rotate.png',
            'view3d-maximize.png',
            'view3d-grid.png',
        ],
    )
    copies = {
        os.path.join(ICON1, 'SketchPngc34b6a0eda4c8a8265cd41042dc7656aa8590906bcc2c75af1a189f354a5b99b.png'): 'ui-eye.png',
        os.path.join(ICON1, 'SketchPng87f4fa070d390c48d05e97cfef01ebab46e61bdbb16af9ce9b74a8bdef045857.png'): 'ui-eye-slash.png',
        os.path.join(ROI, 'SketchPng52628d8e6411affc080f9fe3ff9e068d5e5f9b254b6342fca37b0b34e2586a06.png'): 'ui-eye-list.png',
        os.path.join(ROI, 'SketchPnga7f3546c7002c778e02a4ede540bccabdb283c131d4099d390ac5fae5a013b80.png'): 'ui-chevron-down.png',
        os.path.join(ROI, 'SketchPng42f47bb49244c3e54c097bd63365f2b0276079fcd6d202238e0ff52c640e2af5.png'): 'ui-chevron-right.png',
        os.path.join(ICON1, 'SketchPng3154686999c55fd6380624abd1324afcb245e117cdab41a9f52ee213542a6027.png'): 'ui-chevron-left.png',
        os.path.join(ICON1, 'SketchPng0fb278a22b232e5e6dfa3753473eacc93d1d6c3a8e4ce851178b552f0d5ba401.png'): 'ui-chevron-right-cyan.png',
        os.path.join(ICON1, 'SketchPng062134cd135c6ad90455a544b1b5523511fae1a12e4ebb947b2a563c9f529a35.png'): 'ui-play.png',
        os.path.join(ICON1, 'SketchPng07cc465a92fc1b1387e0fcb18d1e0ac6d87472842fce64d09fb970909051e4f4.png'): 'ui-pause.png',
        os.path.join(ICON1, 'SketchPnge95248e61baf0ba6183cea5f2643ec281f0db142091824b4e04aea92f318077a.png'): 'ui-list.png',
        os.path.join(ICON1, 'SketchPngdc3cff6ee64a90956b6714ba45043f0ca423c49b4ebd31de4aaeeb5bec0c0c9c.png'): 'ui-user.png',
        os.path.join(ICON1, 'SketchPng2ae627670ce7e47ca836e76f37f3a00e1ccff7360a13e4b605a5f0f232ae835d.png'): 'fusion-box.png',
        os.path.join(ICON1, 'SketchPngdcfbbabd28ce7f95f2c210f3dc771e592dac47af42def3b8760ce2f060af4185.png'): 'fusion-checker.png',
        os.path.join(ICON1, 'SketchPnga0c7b75d9b9e3d51bba1e67f33b2ccbf76f94905d90427e5dfe893d65a35fdd0.png'): 'fusion-vbar.png',
        os.path.join(ICON1, 'SketchPngc80df9759c8ccefe4e2c207e3ea22e8d7af75e6d9104ed7ab4d26f5f7dc230af.png'): 'fusion-hbar.png',
        os.path.join(ICON1, 'SketchPnga136a636d9cc38f3c2807afbae8b8597df4a0ed8fb12bf830620a93fdac5e26e.png'): 'fusion-wl.png',
        os.path.join(ICON1, 'SketchPng39b75084cc1d59efc6320a709eb4d2f5e5ff7a58ae2ce24a6fedd6a10ccd69e3.png'): 'ui-4d-on.png',
        os.path.join(ICON1, 'SketchPng47e60d50671b92975c427c7c875989feafadf7046acce4c4f3c491a0b1fe05e6.png'): 'ui-4d-off.png',
    }
    for src, name in copies.items():
        copy(src, name)
    print('done')


if __name__ == '__main__':
    main()
