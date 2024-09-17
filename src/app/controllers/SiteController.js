const Student = require('../models/Student');

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

module.exports = new SiteController();
