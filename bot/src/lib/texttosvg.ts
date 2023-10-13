import TextToSVG from 'text-to-svg';

export async function loadAsync(uri: string): Promise<TextToSVG> {
  return new Promise<TextToSVG>((resolve, reject) => {
    TextToSVG.load(uri, (err, textToSVG) => {
      if (err) reject(err);
      if (!textToSVG) reject("null");
      else resolve(textToSVG); 
    });
  });
}
