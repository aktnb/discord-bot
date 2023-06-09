import { LayersModel, tensor4d, io, loadLayersModel, Tensor, argMax } from '@tensorflow/tfjs-node';
import { createCanvas, loadImage } from 'canvas';
import { error } from 'console';

export const SanbakaController = new class {
  private labels = ['アンジュ・カトリーナ', '戌亥とこ', 'リゼ・ヘルエスタ'];
  private model: LayersModel | null = null;
  async predict(image_url: string) {

    console.log(image_url);

    const image = await loadImage(image_url);
    const cv = createCanvas(128, 128);
    const ct = cv.getContext('2d');
    if (!ct) return 'no ct';
    ct.drawImage(image, 0, 0);

    if (!this.model) {
      const stream =  io.fileSystem('../sanbaka_model/model.json');
      this.model = await loadLayersModel(stream);
      if (!this.model) {
        throw new Error('モデルを読み込めませんでした');
      }
    }
    const data = ct.getImageData(0, 0, 128, 128)
    const rgb_data = Array.from(data.data
      .filter((_v, i) => i % 4 !== 3)).map(v => v / 255);
    const tensor = tensor4d(rgb_data, [1, 128, 128, 3], 'float32');
    this.model.summary();
    const predict = await this.model.predict(tensor);
    if (predict instanceof Tensor) {
      const idx = (await predict.as1D().argMax().data())[0];
      return this.labels[idx];
    }
    throw new Error('予測中に不具合が発生しました');
  }
}