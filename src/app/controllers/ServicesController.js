import { ObjectId } from 'mongodb';
import Service from '../models/Service.js';

class ServicesController {
    //[GET]
    index = (req, res, next) => {
        Service.find({ deletedAt: null })
            .then((services) => res.render('services/show', { services }))
            .catch(next);
    };

    // [GET] /services/detail/:id
    detail = (req, res, next) => {
        Service.findById(req.params.id)
            .then((service) => res.render('services/show', { service }))
            .catch(next);
    };

    //[GET]/create
    create = (req, res) => {
        res.render('services/create');
    };

    //[POST]/create
    store = (req, res, next) => {
        const { serviceCode, serviceName, price, description } = req.body;
        const service = new Service({
            _id: new ObjectId(),
            serviceCode,
            serviceName,
            price,
            description,
        });

        service
            .save()
            .then(() => res.redirect('/services'))
            .catch(next);
    };
}

export default new ServicesController();
