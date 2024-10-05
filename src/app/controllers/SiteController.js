import mongoose from 'mongoose';
import Student from '../models/Student.js';
import ServiceUsage from '../models/ServiceUsage.js';
import moment from 'moment';
import Room from '../models/Room.js';
import Vehicle from '../models/Vehicle.js';

class SiteController {
    //[GET]
    index(req, res) {
        res.render('home');
    }

    studentPayments = (req, res, next) => {
        const studentsQuery = req.query?.studentId
            ? { _id: new mongoose.Types.ObjectId(req.query?.studentId) }
            : {};

        Student.aggregate([
            { $match: studentsQuery },
            // Bước 1: Kết hợp thông tin sinh viên và phòng
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'roomInfo',
                },
            },
            {
                $unwind: '$roomInfo', // Giải nén mảng roomInfo
            },

            // Bước 2: Tạo trường moveInDateObject và tính toán các giá trị ngày
            {
                $addFields: {
                    moveInDateObject: {
                        $dateFromParts: {
                            year: {
                                $year: {
                                    $add: [
                                        new Date(0),
                                        { $multiply: ['$moveInDate', 1000] },
                                    ],
                                },
                            },
                            month: {
                                $month: {
                                    $add: [
                                        new Date(0),
                                        { $multiply: ['$moveInDate', 1000] },
                                    ],
                                },
                            },
                            day: {
                                $dayOfMonth: {
                                    $add: [
                                        new Date(0),
                                        { $multiply: ['$moveInDate', 1000] },
                                    ],
                                },
                            },
                        },
                    },
                    currentDate: new Date(), // Ngày hiện tại
                },
            },

            // Bước 3: Tạo các trường moveInYear, moveInMonth, currentYear, currentMonth
            {
                $addFields: {
                    moveInYear: { $year: '$moveInDateObject' },
                    moveInMonth: { $month: '$moveInDateObject' },
                    currentYear: { $year: '$currentDate' },
                    currentMonth: { $month: '$currentDate' },
                },
            },

            // Bước 4: Tạo mảng chứa các tháng cần thanh toán
            {
                $addFields: {
                    monthsToPay: {
                        $range: [
                            {
                                $add: [
                                    {
                                        $multiply: [
                                            {
                                                $subtract: [
                                                    '$moveInYear',
                                                    1970,
                                                ],
                                            },
                                            12,
                                        ],
                                    },
                                    { $subtract: ['$moveInMonth', 1] },
                                ],
                            },
                            {
                                $add: [
                                    {
                                        $multiply: [
                                            {
                                                $subtract: [
                                                    '$currentYear',
                                                    1970,
                                                ],
                                            },
                                            12,
                                        ],
                                    },
                                    '$currentMonth',
                                ],
                            },
                            1,
                        ],
                    },
                },
            },

            // Bước 5: Giải nén mảng các tháng và tính tiền phòng cho từng tháng
            {
                $unwind: '$monthsToPay',
            },
            {
                $addFields: {
                    yearToPay: {
                        $add: [
                            1970,
                            { $floor: { $divide: ['$monthsToPay', 12] } },
                        ],
                    },
                    monthToPay: {
                        $add: [1, { $mod: ['$monthsToPay', 12] }],
                    },
                },
            },
            {
                $addFields: {
                    startDate: {
                        $dateFromParts: {
                            year: '$yearToPay',
                            month: '$monthToPay',
                            day: 1,
                            hour: 0,
                            minute: 0,
                            second: 0,
                        },
                    },
                    endDate: {
                        $dateFromParts: {
                            year: '$yearToPay',
                            month: '$monthToPay',
                            day: {
                                $arrayElemAt: [
                                    [
                                        31, 28, 31, 30, 31, 30, 31, 31, 30, 31,
                                        30, 31,
                                    ],
                                    { $subtract: ['$monthToPay', 1] },
                                ],
                            },
                            hour: 23,
                            minute: 59,
                            second: 59,
                        },
                    },
                },
            },

            // Bước 6: Tính toán tổng tiền phòng cho mỗi tháng
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    name: 1,
                    roomNumber: '$roomInfo.roomNumber',
                    yearToPay: 1,
                    monthToPay: 1,
                    startOfMonth: {
                        $divide: [{ $toLong: '$startDate' }, 1000],
                    },
                    endOfMonth: { $divide: [{ $toLong: '$endDate' }, 1000] },
                    roomPrice: '$roomInfo.price',
                },
            },

            // Bước 7: Kết hợp thông tin dịch vụ sử dụng
            {
                $lookup: {
                    from: 'serviceUsages',
                    let: {
                        studentId: '$_id',
                        startOfMonth: '$startOfMonth',
                        endOfMonth: '$endOfMonth',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$studentId', '$$studentId'] },
                                        {
                                            $gte: [
                                                '$usageDate',
                                                '$$startOfMonth',
                                            ],
                                        }, // So sánh với startOfMonth
                                        { $lt: ['$usageDate', '$$endOfMonth'] }, // So sánh với endOfMonth
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalServiceAmount: { $sum: '$amount' },
                            },
                        },
                    ],
                    as: 'serviceUsage',
                },
            },
            {
                $unwind: {
                    path: '$serviceUsage',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    serviceTotal: {
                        $ifNull: ['$serviceUsage.totalServiceAmount', 0],
                    }, // Gán giá trị 0 nếu không có dịch vụ
                },
            },

            // Bước 8: Kết hợp thông tin phương tiện
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'vehicles',
                },
            },

            // Bước 9: Kết hợp phí gửi xe
            {
                $lookup: {
                    from: 'parkinglogs',
                    let: {
                        vehicleIds: '$vehicles._id',
                        startOfMonth: '$startOfMonth',
                        endOfMonth: '$endOfMonth',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$vehicleId', '$$vehicleIds'] },
                                        {
                                            $gte: [
                                                '$entryTime',
                                                '$$startOfMonth',
                                            ],
                                        },
                                        { $lt: ['$entryTime', '$$endOfMonth'] },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: '$vehicleId', // Nhóm theo vehicleId để tổng hợp phí theo từng xe
                                totalFees: { $sum: '$additionalFee' }, // Tính tổng phí từ các logs
                            },
                        },
                        {
                            $group: {
                                _id: null, // Nhóm lại để tổng hợp phí cho tất cả các xe trong tháng
                                totalParkingFees: {
                                    $sum: { $add: ['$totalFees', 100000] }, // Cộng thêm phí cố định cho mỗi xe
                                },
                            },
                        },
                    ],
                    as: 'parkingFees',
                },
            },
            {
                $unwind: {
                    path: '$parkingFees',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Bước 10: Tính toán tổng số tiền cho mỗi tháng
            {
                $addFields: {
                    totalAmount: {
                        $add: [
                            '$roomPrice',
                            '$serviceTotal',
                            { $ifNull: ['$parkingFees.totalParkingFees', 0] },
                        ],
                    },
                },
            },

            // Bước 11: Trả về kết quả cuối cùng
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    name: 1,
                    roomNumber: '$roomNumber',
                    yearToPay: 1,
                    monthToPay: 1,
                    roomPrice: '$roomPrice',
                    serviceTotal: 1,
                    parkingTotal: {
                        $ifNull: ['$parkingFees.totalParkingFees', 0],
                    },
                    totalAmount: 1, // Tổng tiền cho phòng, dịch vụ và gửi xe
                },
            },
        ])
            .then((payments) => {
                Student.find({}, { _id: 1, studentId: 1, name: 1 }).then(
                    (students) => {
                        res.render('payments', {
                            students,
                            payments,
                        });
                    },
                );
            })
            .catch(next);
    };

    studentServiceUsages = (req, res, next) => {
        const { startDate, endDate } = req.query;
        const startTime = startDate ? moment(startDate).unix() : 0;
        const endTime = endDate ? moment(endDate).unix() : moment().unix();

        Student.aggregate([
            {
                $lookup: {
                    from: 'serviceUsages',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'serviceUsages',
                },
            },
            { $unwind: '$serviceUsages' },
            {
                $match: {
                    'serviceUsages.usageDate': {
                        $gte: startTime,
                        $lte: endTime,
                    },
                },
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'serviceUsages.serviceId',
                    foreignField: '_id',
                    as: 'serviceInfo',
                },
            },
            { $unwind: '$serviceInfo' },
            {
                $group: {
                    _id: { studentId: '$_id', serviceId: '$serviceInfo._id' },
                    studentName: { $first: '$name' },
                    serviceName: { $first: '$serviceInfo.serviceName' },
                    totalServiceAmount: { $sum: '$serviceUsages.amount' },
                },
            },
            {
                $project: {
                    _id: 0,
                    studentName: 1,
                    serviceName: 1,
                    totalServiceAmount: 1,
                },
            },
        ])
            .then((serviceUsageDetails) => {
                // Render kết quả
                res.render('serviceUsage', { serviceUsageDetails });
            })
            .catch((error) => {
                res.status(500).send('Có lỗi xảy ra khi truy vấn dữ liệu.');
            });
    };

    studentGuestVisitLogs = (req, res, next) => {
        const { timeRange } = req.query;
        let startTime, endTime;
        const currentTime = moment().unix();

        if (timeRange === 'week') {
            startTime = moment().startOf('week').unix();
            endTime = currentTime;
        } else if (timeRange === 'month') {
            startTime = moment().startOf('month').unix();
            endTime = currentTime;
        } else {
            startTime = 0;
            endTime = currentTime;
        }

        Student.aggregate([
            {
                $lookup: {
                    from: 'visitlogs',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'visitLogs',
                },
            },
            { $unwind: '$visitLogs' },
            {
                $lookup: {
                    from: 'guests',
                    localField: 'visitLogs.guestId',
                    foreignField: '_id',
                    as: 'guestInfo',
                },
            },
            { $unwind: '$guestInfo' },
            {
                $match: {
                    'visitLogs.visitDate': {
                        $gte: startTime,
                        $lte: endTime,
                    },
                },
            },
            {
                $group: {
                    _id: { studentId: '$_id', guestId: '$guestInfo._id' },
                    studentName: { $first: '$name' },
                    guestName: { $first: '$guestInfo.name' },
                    guestIdentityCard: { $first: '$guestInfo.identityCard' },
                    visitCount: { $sum: 1 }, // Đếm số lần khách đến
                },
            },
            {
                $project: {
                    _id: 0,
                    studentName: 1,
                    guestName: 1,
                    guestIdentityCard: 1,
                    visitCount: 1,
                },
            },
        ])
            .then((visitLogsDetails) => {
                res.render('visitlog', { visitLogsDetails });
            })
            .catch((error) => {
                res.status(500).send('Có lỗi xảy ra khi truy vấn dữ liệu.');
            });
    };

    serviceRevenues = (req, res, next) => {
        ServiceUsage.aggregate([
            {
                $lookup: {
                    from: 'services',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'serviceInfo',
                },
            },
            { $unwind: '$serviceInfo' }, // Giải nén mảng serviceInfo
            {
                $addFields: {
                    usageYear: {
                        $year: {
                            $toDate: {
                                $multiply: ['$usageDate', 1000], // Chuyển Unix timestamp thành ngày
                            },
                        },
                    },
                    usageMonth: {
                        $month: {
                            $toDate: {
                                $multiply: ['$usageDate', 1000],
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: {
                        serviceId: '$serviceId',
                        serviceName: '$serviceInfo.serviceName',
                        year: '$usageYear',
                        month: '$usageMonth',
                    },
                    totalRevenue: { $sum: '$amount' }, // Tính tổng doanh thu
                },
            },
            {
                $sort: {
                    '_id.year': -1, // Sắp xếp theo năm giảm dần
                    '_id.month': -1, // Sắp xếp theo tháng giảm dần
                },
            },
            {
                $project: {
                    _id: 0,
                    serviceId: '$_id.serviceId',
                    serviceName: '$_id.serviceName',
                    year: '$_id.year',
                    month: '$_id.month',
                    totalRevenue: 1, // Tổng doanh thu theo tháng
                },
            },
        ])
            .then((serviceRevenues) => {
                res.render('serviceRevenue', { serviceRevenues });
            })
            .catch((error) => {
                res.status(500).send(
                    'Có lỗi xảy ra khi truy vấn doanh thu dịch vụ.',
                );
            });
    };

    checkConstraints = (req, res, next) => {
        const checkRoom = Room.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'roomId',
                    as: 'students',
                },
            },
            {
                $addFields: {
                    studentCount: { $size: '$students' },
                },
            },
            {
                $match: {
                    $expr: { $gt: ['$studentCount', '$maxOccupancy'] },
                },
            },
            {
                $project: {
                    _id: 0,
                    roomNumber: 1,
                    floor: 1,
                    studentCount: 1,
                    maxOccupancy: 1,
                },
            },
        ]);

        const checkVehicle = Vehicle.aggregate([
            {
                $group: {
                    _id: '$studentId',
                    vehicleCount: { $sum: 1 },
                },
            },
            {
                $match: {
                    vehicleCount: { $gt: 2 },
                },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            {
                $unwind: '$studentInfo',
            },
            {
                $project: {
                    _id: 0,
                    studentId: '$studentInfo.studentId',
                    studentName: '$studentInfo.name',
                    vehicleCount: 1,
                },
            },
        ]);

        // Thực hiện cả hai query cùng lúc
        Promise.all([checkRoom, checkVehicle])
            .then(([roomsOverCapacity, studentsWithTooManyVehicles]) => {
                res.render('checkConstraints', {
                    roomsOverCapacity,
                    studentsWithTooManyVehicles,
                });
            })
            .catch((error) => {
                console.log(error); // Thực hiện log nếu có lỗi
            });
    };
}

export default new SiteController();
