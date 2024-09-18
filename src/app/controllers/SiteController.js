import Student from '../models/Student.js';

class SiteController {
    //[GET]
    index = (req, res) => {
        Student.find()
            .then((students) => {
                res.json(students);
            })
            .catch((err) => {
                res.status(400).send(err);
            });
    };

    //[GET]/search
    search(req, res) {
        res.render('search');
    }
}

export default new SiteController();
