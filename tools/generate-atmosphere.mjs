/**
 * Generator atmosferskih ozadij (zrnat gradient v slogu reference »Grainy Gradient Textures«),
 * prebarvan v paleto ATMOSPHERIC UI. Upodobi organske oblike z zelo veliko zameglitvijo
 * v Chromu in izvozi WebP. Zrnje NI zapečeno — doda ga CSS (brez ponavljanja, ostrina na vseh zaslonih).
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const OUT = process.argv[2];
const W = 1800, H = 1125;

// Vsaka plast: barva, prosojnost, zameglitev, oblika (točke organskega obrisa v deležih platna)
const variants = {
  // Posamezniki in vstopna stran — svetlo levo, globlja meglena modra masa zgoraj desno, svetel diagonalni pas
  mist: {
    base: '#f1f1f3',
    layers: [
      { c: '#fbf7f7', a: 1, blur: 150, pts: [[-0.2, -0.2], [0.42, -0.15], [0.5, 0.35], [0.3, 0.75], [-0.2, 1.1]] },
      { c: '#dbe5ec', a: 0.9, blur: 170, pts: [[0.38, -0.2], [1.2, -0.2], [1.2, 0.9], [0.8, 0.85], [0.52, 0.45]] },
      { c: '#b3c9da', a: 0.95, blur: 160, pts: [[0.55, -0.25], [1.15, -0.2], [1.1, 0.62], [0.86, 0.7], [0.66, 0.38]] },
      { c: '#a9bdcc', a: 0.9, blur: 150, pts: [[0.7, -0.15], [1.1, -0.1], [1.05, 0.45], [0.86, 0.5], [0.76, 0.22]] },
      { c: '#bfd0dd', a: 0.75, blur: 130, pts: [[0.7, 0.62], [1.15, 0.5], [1.15, 0.95], [0.82, 0.92]] },
      { c: '#eef1f4', a: 0.95, blur: 90, pts: [[0.3, 1.15], [0.5, 0.92], [0.76, 0.58], [0.98, 0.44], [1.04, 0.52], [0.84, 0.7], [0.6, 1.0], [0.5, 1.15]] },
      { c: '#f6f1f2', a: 0.85, blur: 140, pts: [[-0.1, 0.7], [0.4, 0.8], [0.52, 1.2], [-0.1, 1.2]] },
      { c: '#edf0f2', a: 0.9, blur: 110, pts: [[0.9, 0.98], [1.15, 0.86], [1.15, 1.2], [0.86, 1.2]] },
    ],
  },
  // Podjetja — enak jezik, nekoliko večja in bolj siva hladna masa
  slate: {
    base: '#eef0f2',
    layers: [
      { c: '#f7f6f7', a: 1, blur: 150, pts: [[-0.2, -0.2], [0.36, -0.15], [0.42, 0.3], [0.24, 0.8], [-0.2, 1.1]] },
      { c: '#d4dee6', a: 0.9, blur: 170, pts: [[0.3, -0.2], [1.2, -0.2], [1.2, 1], [0.7, 0.95], [0.45, 0.5]] },
      { c: '#bccbd8', a: 0.95, blur: 160, pts: [[0.48, -0.25], [1.15, -0.2], [1.12, 0.75], [0.82, 0.8], [0.58, 0.42]] },
      { c: '#a6b9c8', a: 0.9, blur: 150, pts: [[0.64, -0.15], [1.1, -0.1], [1.08, 0.55], [0.84, 0.58], [0.7, 0.25]] },
      { c: '#c2cfd9', a: 0.75, blur: 130, pts: [[0.66, 0.66], [1.15, 0.55], [1.15, 1.0], [0.78, 0.98]] },
      { c: '#ebeef1', a: 0.95, blur: 90, pts: [[0.26, 1.15], [0.46, 0.94], [0.72, 0.62], [0.96, 0.5], [1.04, 0.58], [0.82, 0.74], [0.56, 1.02], [0.46, 1.15]] },
      { c: '#e9ecee', a: 0.9, blur: 110, pts: [[0.9, 1.0], [1.15, 0.9], [1.15, 1.2], [0.86, 1.2]] },
    ],
  },
  // O svetovalcu, FAQ, rezervacija, noga — manjša modra masa, več mehke bele in zelo rahel rožnat podton (#FDF3F5)
  day: {
    base: '#f2f2f4',
    layers: [
      { c: '#fbf6f7', a: 1, blur: 160, pts: [[-0.2, -0.2], [0.55, -0.15], [0.6, 0.4], [0.35, 0.85], [-0.2, 1.1]] },
      { c: '#dfe8ee', a: 0.9, blur: 170, pts: [[0.5, -0.2], [1.2, -0.2], [1.2, 0.8], [0.85, 0.75], [0.62, 0.4]] },
      { c: '#c2d5e3', a: 0.9, blur: 160, pts: [[0.66, -0.25], [1.15, -0.2], [1.12, 0.52], [0.9, 0.58], [0.74, 0.3]] },
      { c: '#b2c6d6', a: 0.7, blur: 150, pts: [[0.8, -0.15], [1.1, -0.1], [1.08, 0.36], [0.9, 0.38]] },
      { c: '#fdf3f5', a: 0.75, blur: 140, pts: [[-0.1, 0.65], [0.45, 0.72], [0.6, 1.2], [-0.1, 1.2]] },
      { c: '#e8edf0', a: 0.8, blur: 130, pts: [[0.4, 1.15], [0.6, 0.9], [0.86, 0.6], [1.1, 0.62], [1.1, 1.2]] },
    ],
  },
};

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');

for (const [name, v] of Object.entries(variants)) {
  const dataUrl = await page.evaluate(({ v, W, H }) => {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = v.base;
    ctx.fillRect(0, 0, W, H);
    // gladek, organski obris (Catmull-Rom → Bezier)
    const blob = (pts) => {
      const p = pts.map(([x, y]) => [x * W, y * H]);
      const n = p.length;
      ctx.beginPath();
      ctx.moveTo((p[0][0] + p[n - 1][0]) / 2, (p[0][1] + p[n - 1][1]) / 2);
      for (let i = 0; i < n; i++) {
        const a = p[i], b = p[(i + 1) % n];
        ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      }
      ctx.closePath();
    };
    for (const l of v.layers) {
      ctx.save();
      ctx.globalAlpha = l.a;
      ctx.filter = `blur(${l.blur}px)`;
      ctx.fillStyle = l.c;
      blob(l.pts);
      ctx.fill();
      ctx.restore();
    }
    // dodatna skupna mehčalna zameglitev — odstrani vsako sled robov
    const cv2 = document.createElement('canvas');
    cv2.width = W; cv2.height = H;
    const c2 = cv2.getContext('2d');
    c2.fillStyle = v.base; c2.fillRect(0, 0, W, H);
    c2.filter = 'blur(60px)';
    c2.drawImage(cv, -120, -120, W + 240, H + 240);
    const cv3 = document.createElement('canvas');
    cv3.width = 1200; cv3.height = 750;
    const c3 = cv3.getContext('2d');
    c3.imageSmoothingQuality = 'high';
    c3.drawImage(cv2, 0, 0, 1200, 750);
    return cv3.toDataURL('image/webp', 0.97);
  }, { v, W, H });
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(`${OUT}/atmo-${name}.webp`, buf);
  console.log(name, Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
