import ParkingLog from '../models/ParkingLog.js';
import Vehicle from '../models/Vehicle.js';
import { ObjectId } from 'mongodb';

class ParkingLogController {
    // [GET] /parking-logs
    index = (req, res, next) => {
        ParkingLog.aggregate([
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicle',
                },
            },
            {
                $unwind: '$vehicle',
            },
            {
                $match: { 'vehicle.deletedAt': null },
            },
        ])
            .then((parkingLogs) =>
                res.render('parkinglogs/show', { parkingLogs }),
            )
            .catch(next);
    };

    // [GET] /parking-logs/create
    create = (req, res, next) => {
        Vehicle.find({ deletedAt: null })
            .then((vehicles) => res.render('parkinglogs/create', { vehicles }))
            .catch(next);
    };

    // [POST] /parking-logs/create
    store = (req, res, next) => {
        const { vehicleId, entryTime, exitTime } = req.body;

        // Chuyển đổi entryTime thành dạng timestamp nếu cần
        const entryTimestamp = new Date(entryTime).getTime();
        const todayStart = new Date(
            new Date(entryTimestamp).setHours(0, 0, 0, 0),
        ).getTime(); // Lấy thời gian đầu ngày

        // Đếm số lần gửi xe trong ngày của xe này
        ParkingLog.aggregate([
            {
                $match: {
                    vehicleId: new mongoose.Types.ObjectId(vehicleId),
                    entryTime: { $gte: todayStart, $lte: entryTimestamp },
                },
            },
            {
                $count: 'count',
            },
        ])
            .then(([result]) => {
                // Tạo mới parking log
                const parkingLog = new ParkingLog({
                    _id: new mongoose.Types.ObjectId(),
                    vehicleId: new mongoose.Types.ObjectId(vehicleId),
                    entryTime: entryTimestamp,
                    exitTime: exitTime ? new Date(exitTime).getTime() : null,
                    additionalFee: !(result && result.count >= 2) ? 3000 : 0,
                });

                return parkingLog.save();
            })
            .then(() => res.redirect('/parking-logs'))
            .catch(next);
    };
}

export default new ParkingLogController();
