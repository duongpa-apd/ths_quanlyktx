import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;
const roomSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        roomNumber: { type: String, required: true },
        floor: { type: Number, required: true },
        roomOnFloor: { type: Number, required: true },
        roomType: { type: String, required: true },
        price: { type: Number, required: true },
        maxOccupancy: { type: Number, required: true },
    },
    { collection: 'rooms', timestamps: true },
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
