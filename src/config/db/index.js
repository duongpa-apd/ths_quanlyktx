const MONGODB_URI =
    'mongodb+srv://admin:BiKLGs7Yq6QGir8D@cluster0-phananhduong.iseov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-PhanAnhDuong';
const DATABASE_NAME = 'dormitory-management';

// const mongoose = require('mongoose');
// const { MongoClient, ServerApiVersion } = require('mongodb');

// let databaseInstance = null;

// const mongoClientInstance = new MongoClient(MONGODB_URI, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     },
// });

// async function connect() {
//     try {
//         await mongoClientInstance.connect();
//         databaseInstance = mongoClientInstance.db(DATABASE_NAME);
//         console.log('connect to db successfuly');
//     } catch (error) {
//         console.log('connect to db failue');
//     }
// }

// const getdb = () => {
//     if (!databaseInstance) throw new Error('Must connect to Database');
//     return databaseInstance;
// };

// module.exports = { connect, getdb };

const mongoose = require('mongoose');

let databaseInstance = null;

async function connect() {
    try {
        // Kết nối mongoose với MongoDB Atlas
        await mongoose.connect(MONGODB_URI);

        databaseInstance = mongoose.connection.db;
        console.log('Connected to MongoDB Atlas successfully');
    } catch (error) {
        console.log('Failed to connect to MongoDB Atlas:', error);
    }
}

const getdb = () => {
    if (!databaseInstance) throw new Error('Must connect to Database');
    return databaseInstance;
};

module.exports = { connect, getdb };
