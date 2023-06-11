import { LayersModel, Tensor, browser, image, io, loadLayersModel, scalar, slice3d, tensor1d, tensor3d, tensor4d } from '@tensorflow/tfjs-node';
import { createCanvas, loadImage } from 'canvas';

export const NijisanjiController = new class {
  private labels = ['アンジュ・カトリーナ', '葉加瀬冬雪', '壱百満天原サロメ', '戌亥とこ', 'ジョー・力一', '加賀美ハヤト', 'リゼ・ヘルエスタ', '竜胆尊', '鷹宮リオン', '夜見れな'];
  private model: LayersModel | null = null;

  async predict(image_url: string) {

    if (!this.model) {
      const stream =  io.fileSystem('../keras_models/230611-225027_model_js/model.json');    //  <===========
      this.model = await loadLayersModel(stream);
      if (!this.model) {
        throw new Error('モデルを読み込めませんでした');
      }
    }

    const input_size = 96
    const img = await loadImage(image_url);
    const cv = createCanvas(img.width, img.height);
    const ctx = cv.getContext('2d');
    if (!ctx) return 'no ct';
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, img.width, img.height);

    const rgba = tensor3d(new Uint8Array(data.data), [cv.height, cv.width, 4]);
    const rgb = slice3d(rgba, [0, 0, 0], [-1, -1, 3]);
    const resized = image.resizeBilinear(rgb, [input_size, input_size]).toFloat();
    const offset = scalar(255);
    const tensor = resized.div(offset).reshape([1, input_size, input_size, 3]);
    const predict = await this.model.predict(tensor);
    if (predict instanceof Tensor) {
      const idx = (await predict.as1D().argMax().data())[0];
      rgba.dispose();
      rgb.dispose();
      resized.dispose();
      offset.dispose();
      tensor.dispose();
      predict.dispose();
      return this.labels[idx];
    }
    throw new Error('予測中に不具合が発生しました');
  }
}