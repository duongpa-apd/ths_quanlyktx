import Student from '../models/Student.js';
import Room from '../models/Room.js';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class StudentsController {
    //[GET]
    index = (req, res, next) => {
        Student.aggregate([
            {
                $match: { deletedAt: null },
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'roomInfo',
                },
            },
            {
                $unwind: {
                    path: '$roomInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    name: 1,
                    roomId: '$roomInfo.roomNumber',
                    moveInDate: 1,
                },
            },
        ])
            .then((students) => {
                res.render('students/show', { students });
            })
            .catch(next);
    };

    //[GET]/create
    create = (req, res, next) => {
        Room.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'roomId',
                    as: 'occupants',
                },
            },
            {
                $match: {
                    $expr: {
                        $lt: [{ $size: '$occupants' }, '$maxOccupancy'],
                    },
                },
            },
            {
                $project: {
                    roomNumber: 1,
                    roomType: 1,
                    price: 1,
                    maxOccupancy: 1,
                    currentOccupancy: { $size: { $ifNull: ['$students', []] } }, // Đếm số sinh viên hiện tại
                },
            },
            {
                $sort: {
                    roomNumber: 1, // Sắp xếp theo roomNumber tăng dần (1: tăng dần, -1: giảm dần)
                },
            },
        ])
            .then((rooms) => {
                res.render('students/create', { rooms });
            })
            .catch(next);
    };

    //[POST]/create
    store = (req, res, next) => {
        const {
            studentId,
            name,
            identityCard,
            birthDate,
            studentClass,
            hometown,
            roomId,
            moveInDate,
        } = req.body;

        // Chuyển đổi ngày sinh và ngày dọn vào thành timestamp
        const birthDateTimestamp = new Date(birthDate).getTime();
        const moveInDateTimestamp = new Date(moveInDate).getTime();

        const student = new Student({
            _id: new ObjectId(),
            studentId,
            name,
            identityCard,
            birthDate: birthDateTimestamp,
            studentClass,
            hometown,
            roomId,
            moveInDate: moveInDateTimestamp,
        });

        student
            .save()
            .then(() => {
                res.redirect('/students');
            })
            .catch(next);
    };

    //[GET]/update/:id
    edit = (req, res, next) => {
        const studentId = req.params.id; // ID sinh viên từ URL

        // Sử dụng aggregate để lấy thông tin sinh viên và phòng
        Student.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(studentId) }, // Tìm sinh viên theo ID
            },
            {
                $lookup: {
                    from: 'rooms', // Tên collection phòng
                    localField: 'roomId', // Trường trong Student
                    foreignField: '_id', // Trường trong Room
                    as: 'roomDetails', // Tên trường chứa thông tin phòng
                },
            },
            {
                $unwind: '$roomDetails', // Giải nén thông tin phòng
            },
        ])
            .then((student) => {
                if (!student.length) {
                    return res
                        .status(404)
                        .json({ message: 'Không tìm thấy sinh viên.' });
                }

                const studentData = student[0];

                res.render('students/update', {
                    student: studentData,
                    birthDate: new Date(studentData.birthDate)
                        .toISOString()
                        .substring(0, 10),
                });
            })
            .catch((err) => {
                return res
                    .status(500)
                    .json({ message: 'Lỗi khi lấy thông tin sinh viên.' });
            });
    };

    //[POST]/update/:id
    update = (req, res, next) => {
        const _id = req.params.id; // ID sinh viên từ URL
        const {
            studentId,
            name,
            identityCard,
            birthDate,
            studentClass,
            hometown,
        } = req.body;

        const updatedStudent = {
            studentId,
            name,
            identityCard,
            birthDate: new Date(birthDate).getTime(), // Chuyển đổi sang timestamp
            class: studentClass,
            hometown,
            deletedAt: null,
        };

        // Cập nhật sinh viên
        Student.findByIdAndUpdate({ _id }, updatedStudent, { new: true })
            .then((updateStudent) => {
                if (!updateStudent)
                    return res.status(404).send('Không tìm thấy sinh viên');
                return res.redirect('/students');
            })
            .catch((err) => {
                return res
                    .status(500)
                    .json({ message: 'Cập nhật sinh viên không thành công.' });
            });
    };

    //[GET]/detail/:id
    detail = (req, res) => {
        const studentId = req.params.id;

        Student.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(studentId) },
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room',
                },
            },
            {
                $lookup: {
                    from: 'guests',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'visitors',
                },
            },
            {
                $unwind: {
                    path: '$room',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    studentId: 1,
                    name: 1,
                    identityCard: 1,
                    birthDate: 1,
                    class: 1,
                    hometown: 1,
                    room: {
                        roomNumber: 1,
                        _id: 1,
                    },
                    visitors: 1,
                    moveInDate: 1,
                },
            },
        ])
            .then((studentData) => {
                if (!studentData.length) {
                    return res
                        .status(404)
                        .json({ message: 'Không tìm thấy sinh viên.' });
                }

                const student = studentData[0];

                res.render('students/detail', {
                    student,
                    birthDate: new Date(student.birthDate)
                        .toISOString()
                        .substring(0, 10),
                    moveInDate: new Date(student.moveInDate)
                        .toISOString()
                        .substring(0, 10),
                });
            })
            .catch((err) => {
                return res.status(500).json({
                    message: 'Lỗi khi lấy thông tin chi tiết sinh viên.',
                });
            });
    };

    // [POST]/delete/:id
    delete = (req, res, next) => {
        const studentId = new mongoose.Types.ObjectId(req.params.id);

        Student.findOneAndUpdate(
            { _id: studentId, deletedAt: null },
            { deletedAt: Date.now() },
            { new: true },
        )
            .then((student) => {
                if (student) {
                    res.redirect('/students');
                } else {
                    res.status(404).send('Không tìm thấy sinh viên để xóa');
                }
            })
            .catch(next);
    };
}

export default new StudentsController();
