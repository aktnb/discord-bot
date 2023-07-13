import { LayersModel, Tensor, image, io, loadLayersModel, scalar, slice3d, tensor3d } from '@tensorflow/tfjs-node';
import { createCanvas, loadImage } from 'canvas';

export const VspoController = new class {
  private labels = [
    '藍沢エマ',
    '空澄セナ',
    '英リサ',
    'ーノ瀬うるは',
    '花芽なすな',
    '花芽すみれ',
    '神成きゅび',
    '如月れん',
    '小雀とと',
    '小森めと',
    '胡桃のあ',
    '猫汰つな',
    '紫宮るな',
    '白波らむね',
    '橘ひなの',
    '兎咲ミミ',
    '八雲べに',
  ];
  private model: LayersModel | null = null;

  async predict(image_url: string) {

    if (!this.model) {
      const stream =  io.fileSystem('../keras_models/230614-032443_model_js/model.json');    //  <===========
      this.model = await loadLayersModel(stream);
      if (!this.model) {
        throw new Error('モデルを読み込めませんでした');
      }
    }

    const input_size = 72
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