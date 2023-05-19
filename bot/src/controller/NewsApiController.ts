import NewsAPI from 'ts-newsapi';
import { NEWS_API } from '../config.json';
import { AppDataSource } from '../data-source';
import { News } from '../entity/News';

const newsAPI = new NewsAPI(NEWS_API);

export const NewsAPIController = new class {

  async getTopHeadlines() {
    const latestNews = await AppDataSource.manager.find(News, {
      order: {
        published_at: 'ASC',
      }
    });

    if (latestNews.length == 0 || new Date().getTime() - latestNews[0].published_at.getTime() > 1 * 60 * 60) {
      //  NEWS取得
      const latestNewses = await newsAPI.getTopHeadlines({
        country: 'jp',
      });

      for(const latestNews of latestNewses.articles) {
        try {
          await AppDataSource.manager.insert(News, {
            title: latestNews.title,
            url: latestNews.url,
            urlToImg: latestNews.urlToImage,
            published_at: new Date(latestNews.publishedAt),
            source: latestNews.source.name,
            description: latestNews.description
          });
        } catch (e) {
          
        }
      }
    }

    const latestNewses = await AppDataSource.manager.find(News, {
      order: {
        published_at: 'ASC'
      },
      take: 5
    });

    return latestNewses;
  }
}
