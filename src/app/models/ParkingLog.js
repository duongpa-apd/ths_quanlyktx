import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;

const parkingLogSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        vehicleId: { type: ObjectId, required: true }, // Liên kết với xe đăng ký vé tháng
        entryTime: { type: Number, required: true }, // Thời gian gửi xe (timestamp)
        exitTime: { type: Number }, // Thời gian lấy xe (timestamp)
        additionalFee: { type: Number, default: 0 }, // Phí phát sinh nếu vượt quá số lần miễn phí
    },
    {
        collection: 'parkinglogs',
        timestamps: true,
    },
);

const ParkingLog = mongoose.model('ParkingLog', parkingLogSchema);
export default ParkingLog;
