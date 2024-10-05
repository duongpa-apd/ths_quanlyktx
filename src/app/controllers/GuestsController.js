import Guest from '../models/Guest.js';
import VisitLog from '../models/VisitLog.js';
import Student from '../models/Student.js';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import mongoose from 'mongoose';

class GuestsController {
    //[GET] /guests
    index = (req, res, next) => {
        Guest.aggregate([
            { $match: { deletedAt: null } },
            {
                $lookup: {
                    from: 'visitLogs',
                    localField: '_id',
                    foreignField: 'guestId',
                    as: 'visitLogs',
                },
            },
            {
                $addFields: {
                    lastVisit: { $max: '$visitLogs.visitDate' },
                },
            },
        ])
            .then((guests) => {
                guests = guests.map((guest) => ({
                    ...guest,
                    lastVisit: guest.lastVisit
                        ? new Date(guest.lastVisit * 1000).toLocaleDateString(
                              'vi-VN',
                          )
                        : 'Chưa có lần thăm nào',
                }));

                res.render('guests/show', { guests });
            })
            .catch(next);
    };

    // [GET] /guests/:id
    detail = (req, res, next) => {
        Guest.findById(req.params.id)
            .lean() // Trả về plain JavaScript object
            .then((guest) => {
                if (!guest) {
                    return res.status(404).send('Không tìm thấy khách.');
                }

                // Truy vấn VisitLogs, kết hợp Student và Room
                VisitLog.aggregate([
                    {
                        $match: { guestId: guest._id }, // Lọc theo guestId
                    },
                    {
                        $lookup: {
                            from: 'students', // Lookup từ collection sinh viên
                            localField: 'studentId',
                            foreignField: '_id',
                            as: 'studentDetails',
                        },
                    },
                    {
                        $unwind: '$studentDetails', // Bóc tách studentDetails
                    },
                    {
                        $lookup: {
                            from: 'rooms', // Lookup từ collection phòng
                            localField: 'studentDetails.roomId',
                            foreignField: '_id',
                            as: 'roomDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$roomDetails',
                            preserveNullAndEmptyArrays: true, // Trường hợp sinh viên chưa có phòng
                        },
                    },
                    {
                        $project: {
                            visitDate: 1,
                            'studentDetails.name': 1,
                            'roomDetails.roomNumber': 1,
                        },
                    },
                ])
                    .then((visitLogs) => {
                        // Xử lý format lại ngày tháng trong visitLogs
                        visitLogs = visitLogs.map((log) => ({
                            ...log,
                            visitDate: moment
                                .unix(log.visitDate)
                                .format('DD/MM/YYYY'),
                        }));

                        res.render('guests/detail', {
                            guest,
                            visitLogs,
                        });
                    })
                    .catch(next);
            })
            .catch(next);
    };

    // [GET] /guests/create
    create = (req, res, next) => {
        res.render('guests/create');
    };

    // [POST] /guests/store
    store = (req, res, next) => {
        const { name, identityCard, birthDate } = req.body;

        // Chuyển đổi birthDate sang timestamp
        const birthTimestamp = Math.floor(new Date(birthDate).getTime() / 1000);

        const newGuest = new Guest({
            _id: new ObjectId(),
            name,
            identityCard,
            birthDate: birthTimestamp, // Lưu timestamp thay vì Date
        });

        newGuest
            .save()
            .then(() => res.redirect('/guests'))
            .catch(next);
    };

    //[GET] /guests/edit/:id
    edit = (req, res, next) => {
        const guestId = req.params.id;
        Guest.findById(guestId)
            .then((guest) => {
                if (guest) {
                    // Định dạng lại ngày sinh theo định dạng 'YYYY-MM-DD'
                    guest = guest.toObject();
                    guest.birthDate = moment(guest.birthDate).format(
                        'YYYY-MM-DD',
                    );

                    res.render('guests/edit', {
                        guest: guest,
                    });
                } else {
                    res.status(404).send('Guest not found');
                }
            })
            .catch(next);
    };

    //[POST] /guests/update/:id
    update = (req, res, next) => {
        const { name, identityCard, birthDate } = req.body;

        console.log(name, identityCard, birthDate);
        // Chuyển birthDate sang timestamp
        const birthTimestamp = Math.floor(new Date(birthDate).getTime() / 1000);

        Guest.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            {
                name,
                identityCard,
                birthDate: birthTimestamp, // Cập nhật timestamp thay vì Date
            },
            { new: true },
        )
            .then(() => res.redirect('/guests'))
            .catch(next);
    };

    // [POST] /guests/delete/:id
    delete = (req, res, next) => {
        const guestId = req.params.id;

        Guest.findOneAndUpdate(
            { _id: guestId, deletedAt: null },
            { deletedAt: Date.now() },
            { new: true },
        ).then((guest) => {
            if (guest) {
                res.redirect('/guests');
            } else {
                res.status(404).send('Không tìm thấy khách để xóa');
            }
        });
    };

    //[GET] /guests/:id/visitlogs/create
    getCreateVisitLog = (req, res, next) => {
        const guestId = req.params.id;

        Guest.findById(guestId)
            .then((guest) => {
                if (!guest) {
                    return res.status(404).send('Không tìm thấy khách.');
                }

                Student.aggregate([
                    {
                        $lookup: {
                            from: 'rooms', // Giả sử bạn có collection 'rooms' chứa thông tin phòng
                            localField: 'roomId',
                            foreignField: '_id',
                            as: 'roomDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$roomDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            studentId: 1,
                            identityCard: 1,
                            birthDate: 1,
                            'roomDetails.roomNumber': 1,
                        },
                    },
                ])
                    .then((students) => {
                        res.render('visitlogs/create', {
                            guest: guest.toObject(),
                            students: students.map((student) => student),
                        });
                    })
                    .catch(next);
            })
            .catch(next);
    };

    //[POST] /guests/:id/visitlogs/create
    postCreateVisitLog = (req, res, next) => {
        const guestId = req.params.id;
        const { studentId, visitDate } = req.body;
        const newVisitLog = new VisitLog({
            _id: new ObjectId(),
            guestId: new mongoose.Types.ObjectId(guestId),
            studentId: new mongoose.Types.ObjectId(studentId),
            visitDate: Math.floor(new Date(visitDate).getTime() / 1000),
        });

        newVisitLog
            .save()
            .then(() => res.redirect(`/guests/${guestId}`))
            .catch(next);
    };
}

export default new GuestsController();
