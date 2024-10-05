import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const Schema = mongoose.Schema;
const studentSchema = new Schema(
    {
        _id: { type: ObjectId, required: true },
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        identityCard: { type: String, required: true },
        dateOfBirth: { type: Number, required: true },
        studentClass: { type: String, required: true },
        hometown: { type: String, required: true },
        roomId: { type: ObjectId, required: true },
        moveInDate: { type: Number, required: true },
    },
    { collection: 'students', timestamps: true },
);

const Student = mongoose.model('Student', studentSchema);

export default Student;
