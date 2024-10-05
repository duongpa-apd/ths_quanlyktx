import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;
const serviceUsageSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        studentId: { type: ObjectId, required: true },
        serviceId: { type: ObjectId, required: true },
        usageDate: { type: Number, required: true },
        amount: { type: Number, required: true },
    },
    { collection: 'serviceUsages', timestamps: true },
);

const ServiceUsage = mongoose.model('ServiceUsage', serviceUsageSchema);

export default ServiceUsage;
