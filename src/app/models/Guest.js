import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;

const guestSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        name: { type: String, required: true },
        identityCard: { type: String, required: true },
        dateOfBirth: { type: Number, required: true },
    },
    { collection: 'guests', timestamps: true },
);

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;
