import sharp from 'sharp';

import { loadAsync } from '../../lib/texttosvg';
import httpAsync from '../../lib/http-async';

import { ZUNDA_ENDPOINT } from '../../config.json';

export async function getZundamonImage(text: string): Promise<Buffer> {
  const textToSVG = await loadAsync("../assets/zundamon/rounded-l-mplus-1mn-medium.ttf");
  let left = 98;
  let top = 25;
  const WIDTH = 800;
  const HEIGHT = 280;

  const lines = text.split('\n');

  const textWidth = Math.max(...lines.map(line => textToSVG.getMetrics(line).width));
  const textHeight = (HEIGHT/lines.length)*(10/11);

  const fontSize = Math.min(WIDTH/textWidth*72, textHeight);

  const svgOptions = {x: 0, y: 0, fontSize, anchor: 'top left', attributes: {fill: "black", stroke: "white"}};

  if (WIDTH/textWidth*72 > textHeight) {
    //  @ts-ignore
    const textActualWidth = Math.max(...lines.map(line => textToSVG.getMetrics(line, svgOptions).width));
    left += Math.round((WIDTH - textActualWidth) / 2);
  } else {
    //  @ts-ignore
    const textActualHeight = (lines.length-1) * fontSize * 1.1 + fontSize;
    top += (HEIGHT - textActualHeight) / 2
  }

  const svgs = lines.map((line, idx) => ({
    //  @ts-ignore
    input: Buffer.from(textToSVG.getSVG(line, svgOptions)),
    left: left,
    top: Math.round(top+idx*fontSize*1.1),
  }));

  const image = await sharp("../assets/zundamon/source1.png")
    .composite(svgs).png().toBuffer();
  return image;
}

export async function getZundaVoice(text: string) {
  const query = await httpAsync.request(`${ZUNDA_ENDPOINT}/audio_query?speaker=1&text=${encodeURIComponent(text)}`, {
    method: 'POST',
  }, null);
  return await httpAsync.request(`${ZUNDA_ENDPOINT}/synthesis?speaker=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, query);
}
