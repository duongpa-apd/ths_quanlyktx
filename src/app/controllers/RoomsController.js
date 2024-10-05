import mongoose from 'mongoose';
import Room from '../models/Room.js';
import { ObjectId } from 'mongodb';

class RoomsController {
    // [GET] /rooms
    index = (req, res, next) => {
        Room.aggregate([
            { $match: { deletedAt: null } },
            { $sort: { floor: 1, roomOnFloor: 1 } }, // Sắp xếp theo tầng và thứ tự phòng
        ])
            .then((rooms) => {
                res.render('rooms/show', { rooms });
            })
            .catch(next);
    };

    // [GET] /rooms/detail/:id
    detail = (req, res, next) => {
        const roomId = req.params.id;

        Room.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(roomId),
                    deletedAt: null,
                }, // Tìm phòng theo _id
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'roomId',
                    as: 'students',
                },
            },
            {
                $project: {
                    _id: 1,
                    roomNumber: 1,
                    roomType: 1,
                    price: 1,
                    maxOccupancy: 1,
                    floor: 1,
                    roomOrder: 1,
                    currentOccupancy: { $size: '$students' }, // Số lượng sinh viên hiện tại
                    students: {
                        $map: {
                            input: '$students',
                            as: 'student',
                            in: {
                                studentId: '$$student.studentId',
                                name: '$$student.name',
                                moveInDate: '$$student.moveInDate',
                            },
                        },
                    },
                },
            },
        ])
            .then((rooms) => {
                if (rooms.length > 0) {
                    const room = rooms[0];
                    res.render('rooms/detail', {
                        room,
                        hasStudents: room.students.length > 0, // Kiểm tra xem có sinh viên không
                        helpers: {
                            formatDate: (timestamp) =>
                                new Date(timestamp).toLocaleDateString('vi-VN'),
                        },
                    });
                } else {
                    res.status(404).send('Không tìm thấy phòng');
                }
            })
            .catch(next);
    };

    // [GET] /rooms/update/:id
    edit = (req, res, next) => {
        const { id } = req.params; // Lấy ID từ params

        // Kiểm tra tính hợp lệ của ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('ID không hợp lệ');
        }

        Room.findById(id)
            .then((room) => {
                if (!room) {
                    return res.status(404).send('Không tìm thấy phòng');
                }

                res.render('rooms/update', { room });
            })
            .catch(next);
    };

    // [POST] /rooms/update/:id
    update = (req, res, next) => {
        const { id } = req.params; // Lấy ID từ params
        const { roomType, price, maxOccupancy } = req.body; // Lấy dữ liệu từ form

        // Kiểm tra tính hợp lệ của ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('ID không hợp lệ');
        }

        Room.findByIdAndUpdate(
            id,
            { roomType, price, maxOccupancy },
            { new: true },
        )
            .then((updatedRoom) => {
                if (!updatedRoom) {
                    return res.status(404).send('Không tìm thấy phòng');
                }
                res.redirect(`/rooms/${updatedRoom._id}`); // Chuyển hướng đến chi tiết phòng vừa cập nhật
            })
            .catch(next);
    };

    // [GET] /rooms/create
    create = (req, res) => {
        const floors = Array.from({ length: 9 }, (_, i) => i + 1); // Tầng từ 1 đến 9
        const roomsOnFloor = Array.from({ length: 99 }, (_, i) => i + 1); // Phòng từ 1 đến 99
        console.log('create form');
        res.render('rooms/create', { floors, roomsOnFloor });
    };

    // [POST] /rooms/store
    store = (req, res, next) => {
        const { floor, roomOnFloor, roomType, price, maxOccupancy } = req.body;

        // Tạo số phòng: Ghép tầng và số thứ tự phòng
        const roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;

        const room = new Room({
            _id: new ObjectId(),
            roomNumber: roomNumber, // Ví dụ: 101, 115, 215
            roomType: roomType,
            price: price,
            maxOccupancy: maxOccupancy,
            floor: floor,
            roomOnFloor: roomOnFloor,
        });

        room.save()
            .then(() => {
                res.redirect('/rooms'); // Chuyển hướng về trang danh sách phòng sau khi thêm thành công
            })
            .catch(next);
    };

    // [PUT]/delete/:id
    delete = (req, res, next) => {
        const roomId = new mongoose.Types.ObjectId(req.params.id);

        Room.findOneAndUpdate(
            { _id: roomId, deletedAt: null }, // Tìm phòng chưa bị xóa
            { deletedAt: Date.now() }, // Đặt `deletedAt` thành timestamp hiện tại
            { new: true }, // Trả về document đã được cập nhật
        )
            .then((room) => {
                if (room) {
                    res.redirect('/rooms'); // Chuyển hướng về trang danh sách phòng sau khi xóa
                } else {
                    res.status(404).send('Không tìm thấy phòng để xóa');
                }
            })
            .catch(next);
    };
}

export default new RoomsController();
