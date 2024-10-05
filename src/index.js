import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';

import route from './routes/index.js';
import db from './config/db/index.js';

//Connect db
db.connect();

const app = express();
const port = 3000;

// Static files first
app.use(express.static(path.join(process.cwd(), 'public')));

//Setup view engine
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.resolve('src/resources/views'));
// Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: {
            incrementIndex: function (index) {
                return index + 1;
            },
            formatDate: (date) => {
                const options = {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                };
                return new Date(date).toLocaleDateString('vi-VN', options);
            },
            ifEquals: function (arg1, arg2, options) {
                return arg1 == arg2 ? options.fn(this) : options.inverse(this);
            },
            formatCurrency: (value) => {
                if (typeof value !== 'number') {
                    return value;
                }
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(value);
            },
        },
    }),
);
app.set('view engine', 'hbs');

// Routes init
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
