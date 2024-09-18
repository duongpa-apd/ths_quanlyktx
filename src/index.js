// const path = require('path');
import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';

import route from './routes/index.js';
import db from './config/db/index.js';

//Connect db
db.connect();

const app = express();
const port = 3000;

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

// Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
    }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'resources\\views'));

// Routes init
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
