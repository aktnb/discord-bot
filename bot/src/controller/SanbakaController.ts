import { LayersModel, tensor4d, io, loadLayersModel, Tensor } from '@tensorflow/tfjs-node';
import { createCanvas, loadImage } from 'canvas';

export const SanbakaController = new class {
  private labels = ['アンジュ・カトリーナ', '戌亥とこ', 'リゼ・ヘルエスタ'];
  private model: LayersModel | null = null;
  private model2: LayersModel | null = null;
  async predict(image_url: string) {

    const input_size = 96
    const image = await loadImage(image_url);
    const cv = createCanvas(input_size, input_size);
    const ct = cv.getContext('2d');
    if (!ct) return 'no ct';
    ct.drawImage(image, 0, 0);

    if (!this.model) {
      const stream =  io.fileSystem('');
      this.model = await loadLayersModel(stream);
      if (!this.model) {
        throw new Error('モデルを読み込めませんでした');
      }
    }
    const data = ct.getImageData(0, 0, input_size, input_size)
    const rgb_data = Array.from(data.data
      .filter((_v, i) => i % 4 !== 3)).map(v => v / 255);
    const tensor = tensor4d(rgb_data, [1, input_size, input_size, 3], 'float32');
    // this.model.summary();
    const predict = await this.model.predict(tensor);
    if (predict instanceof Tensor) {
      const idx = (await predict.as1D().argMax().data())[0];
      return this.labels[idx];
    }
    throw new Error('予測中に不具合が発生しました');
  }

  async predict2(image_url: string) {

    const input_size = 96
    const image = await loadImage(image_url);
    const cv = createCanvas(input_size, input_size);
    const ct = cv.getContext('2d');
    if (!ct) return 'no ct';
    ct.drawImage(image, 0, 0);

    if (!this.model2) {
      const stream =  io.fileSystem('');
      this.model2 = await loadLayersModel(stream);
      if (!this.model2) {
        throw new Error('モデルを読み込めませんでした');
      }
    }
    const data = ct.getImageData(0, 0, input_size, input_size)
    const rgb_data = Array.from(data.data
      .filter((_v, i) => i % 4 !== 3)).map(v => v / 255);
    const tensor = tensor4d(rgb_data, [1, input_size, input_size, 3], 'float32');
    // this.model2.summary();
    const predict = await this.model2.predict(tensor);
    if (predict instanceof Tensor) {
      const idx = (await predict.as1D().argMax().data())[0];
      return this.labels[idx];
    }
    throw new Error('予測中に不具合が発生しました');
  }
}