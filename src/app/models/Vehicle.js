import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;

const vehicleSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        studentId: { type: ObjectId, required: true }, // Liên kết với sinh viên đăng ký
        licensePlate: { type: String, required: true }, // Biển số xe
        vehicleType: { type: String, required: true }, // Loại xe (ví dụ: xe máy, xe đạp)
        registerDate: { type: Number, required: true }, // Ngày đăng ký vé tháng (timestamp)
    },
    {
        collection: 'vehicles',
        timestamps: true,
    },
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
