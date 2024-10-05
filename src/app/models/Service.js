import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;
const serviceSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        serviceCode: { type: String, required: true },
        serviceName: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
    },
    { collection: 'services', timestamps: true },
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
