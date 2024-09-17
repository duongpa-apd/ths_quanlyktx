const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    _id: ObjectId,
    maSV: String, // Mã sinh viên
    name: String,
    soCMT: String, // Số CMT
    ngaySinh: Date, // Ngày sinh
    lop: String, // Lớp
    queQuan: String, // Quê quán
    phongO: ObjectId,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
