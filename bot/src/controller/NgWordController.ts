const NG_LIST = ['バカ', 'ばか', 'あほ', 'アホ'];

export const NgWordController = new class {
  isNgWordContain(text: string) {
    return !!NG_LIST.find(ng => text.includes(ng));
  };

  async getCatUrl() {
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    if (!response.ok) {
      //  APIからのレスポンスがOK以外
      console.log('cat error');
      throw new Error('response is not ok');
    }
    //  APIからのレスポンスがOKなら
    const json = await response.json();
    const catData = json[0];
    return catData['url'];
  };
};
