const WIDTH = 1200;
const HEIGHT = 630;

const drawRoundedRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const wrapText = (ctx, text, maxWidth) => {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    const width = ctx.measureText(candidate).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
};

export const generateShareCardBlob = ({
  title,
  year,
  dateLabel,
  categoryLabel,
}) =>
  new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d');

      const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      bg.addColorStop(0, '#101828');
      bg.addColorStop(1, '#1d2939');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#53b1fd';
      drawRoundedRect(ctx, 760, -80, 520, 420, 90);
      ctx.fill();
      ctx.fillStyle = '#ee46bc';
      drawRoundedRect(ctx, -160, 360, 520, 360, 90);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#f8fafc';
      ctx.font = "600 34px 'Outfit', sans-serif";
      ctx.fillText('On This Day', 64, 74);

      if (year) {
        ctx.fillStyle = '#7dd3fc';
        ctx.font = "700 86px 'Outfit', sans-serif";
        ctx.fillText(String(year), 64, 176);
      }

      const titleTop = year ? 250 : 154;
      ctx.fillStyle = '#ffffff';
      ctx.font = "700 56px 'Outfit', sans-serif";
      const lines = wrapText(ctx, title || '', WIDTH - 128).slice(0, 3);
      lines.forEach((line, index) => {
        ctx.fillText(line, 64, titleTop + index * 70);
      });

      if (categoryLabel) {
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, 64, 490, 210, 52, 26);
        ctx.fill();
        ctx.fillStyle = '#101828';
        ctx.font = "600 28px 'Outfit', sans-serif";
        ctx.fillText(categoryLabel, 88, 525);
      }

      ctx.fillStyle = '#d0d5dd';
      ctx.font = "500 30px 'Outfit', sans-serif";
      ctx.fillText(dateLabel || '', 64, 590);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create share image.'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
