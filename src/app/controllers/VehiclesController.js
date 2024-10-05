import Vehicle from '../models/Vehicle.js';
import Student from '../models/Student.js';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class VehiclesController {
    //[GET]
    index = (req, res, next) => {
        Vehicle.aggregate([
            { $match: { deletedAt: null } },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            {
                $unwind: {
                    path: '$studentInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    licensePlate: 1,
                    vehicleType: 1,
                    registerDate: 1,
                    studentId: '$studentInfo.studentId',
                    studentName: '$studentInfo.name',
                },
            },
        ])
            .then((vehicles) => {
                const formattedVehicles = vehicles.map((vehicle) => ({
                    ...vehicle,
                    registerDate: new Date(
                        vehicle.registerDate,
                    ).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }),
                }));
                res.render('vehicles/show', { vehicles: formattedVehicles });
            })
            .catch(next);
    };

    // [GET] /detail/:id
    detail = (req, res, next) => {
        Vehicle.aggregate([
            {
                $match: { _id: new ObjectId(req.params.id), deletedAt: null },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            {
                $unwind: '$studentInfo',
            },
        ])
            .then((vehicle) => {
                if (!vehicle || vehicle.length === 0) {
                    return res.status(404).send('Vehicle not found');
                }
                res.render('vehicles/detail', { vehicle: vehicle[0] });
            })
            .catch(next);
    };

    //[GET]/create
    create = (req, res, next) => {
        Student.find({ deletedAt: null })
            .then((students) => res.render('vehicles/create', { students }))
            .catch(next);
    };

    //[POST]/create
    store = (req, res, next) => {
        const { studentId, vehicleType, licensePlate, registerDate } = req.body;

        // Kiểm tra xem sinh viên đã đăng ký 2 xe hay chưa
        Vehicle.countDocuments({
            studentId: new mongoose.Types.ObjectId(studentId),
        })
            .then((count) => {
                if (count >= 2) {
                    // Nếu đã đăng ký 2 xe, hiển thị thông báo lỗi
                    return res
                        .status(400)
                        .json({ message: 'Sinh viên này đã đăng ký 2 xe.' });
                }
                // Kiểm tra xem biển số đã tồn tại hay chưa
                return Vehicle.findOne({ licensePlate });
            })
            .then((existingVehicle) => {
                if (existingVehicle) {
                    // Nếu biển số đã tồn tại, hiển thị thông báo lỗi
                    return res
                        .status(400)
                        .json({ message: 'Biển số này đã được đăng ký.' });
                }

                // Tạo mới một đối tượng Vehicle
                const vehicle = new Vehicle({
                    _id: new ObjectId(),
                    studentId: new mongoose.Types.ObjectId(studentId),
                    vehicleType,
                    licensePlate,
                    registerDate: new Date(registerDate).getTime(),
                });

                // Lưu vào cơ sở dữ liệu
                return vehicle.save();
            })
            .then(() => res.redirect('/vehicles'))
            .catch(next);
    };

    // [GET] /update/:id/
    edit = (req, res, next) => {
        Promise.all([
            Vehicle.findOne({
                _id: new ObjectId(req.params.id),
                deletedAt: null,
            }),
            Student.find({ deletedAt: null }),
        ])
            .then(([vehicle, students]) => {
                res.render('vehicles/update', { vehicle, students });
            })
            .catch(next);
    };

    // [POST] /update/:id/
    update = (req, res, next) => {
        const { licensePlate, vehicleType, student } = req.body;

        Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                licensePlate,
                vehicleType,
                student: new ObjectId(student),
            },
            { new: true },
        )
            .then(() => res.redirect('/vehicles'))
            .catch(next);
    };
}

export default new VehiclesController();
