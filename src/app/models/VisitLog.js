import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;

const visitLogSchema = new Schema(
    {
        _id: { type: ObjectId, require: true },
        guestId: { type: ObjectId, require: true },
        studentId: { type: ObjectId, require: true },
        visitDate: { type: Number, require: true },
    },
    {
        collection: 'visitlogs',
        timestamps: true,
    },
);

const VisitLog = mongoose.model('VisitLog', visitLogSchema);
export default VisitLog;
