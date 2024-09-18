import newsRouter from './news.js';
import siteRouter from './site.js';

const route = (app) => {
    app.use('/news', newsRouter);
    app.use('/', siteRouter);
};

export default route;
