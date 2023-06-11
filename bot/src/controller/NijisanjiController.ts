import { LayersModel, tensor4d, io, loadLayersModel, Tensor } from '@tensorflow/tfjs-node';
import { createCanvas, loadImage } from 'canvas';

export const NijisanjiController = new class {
  private labels = ['アンジュ・カトリーナ', '葉加瀬冬雪', '壱百満天原サロメ', '戌亥とこ', 'ジョー・力一', '加賀美ハヤト', 'リゼ・ヘルエスタ', '竜胆尊', '鷹宮リオン', '夜見れな'];
  private model: LayersModel | null = null;

  async predict(image_url: string) {

    const input_size = 96
    const image = await loadImage(image_url);
    const cv = createCanvas(input_size, input_size);
    const ct = cv.getContext('2d');
    if (!ct) return 'no ct';
    ct.drawImage(image, 0, 0);

    if (!this.model) {
      const stream =  io.fileSystem('');    //  <===========
      this.model = await loadLayersModel(stream);
      if (!this.model) {
        throw new Error('モデルを読み込めませんでした');
      }
    }
    const data = ct.getImageData(0, 0, input_size, input_size)
    const rgb_data = Array.from(data.data
      .filter((_v, i) => i % 4 !== 3)).map(v => v / 255);
    const tensor = tensor4d(rgb_data, [1, input_size, input_size, 3], 'float32');
    const predict = await this.model.predict(tensor);
    if (predict instanceof Tensor) {
      const idx = (await predict.as1D().argMax().data())[0];
      return this.labels[idx];
    }
    throw new Error('予測中に不具合が発生しました');
  }
}