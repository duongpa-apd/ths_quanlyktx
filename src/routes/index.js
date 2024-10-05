import siteRouter from './site.js';
import studentRouter from './students.js';
import roomRouter from './rooms.js';
import serviceRouter from './services.js';
import guestRouter from './guests.js';
import vehicleRouter from './vehicles.js';
import parkinglogRouter from './parkinglogs.js';

const route = (app) => {
    app.use('/rooms', roomRouter);
    app.use('/students', studentRouter);
    app.use('/services', serviceRouter);
    app.use('/guests', guestRouter);
    app.use('/vehicles', vehicleRouter);
    app.use('/parking-logs', parkinglogRouter);
    app.use('/', siteRouter);
};

export default route;
