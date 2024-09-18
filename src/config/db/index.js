import mongoose from 'mongoose';
const MONGODB_URI =
    'mongodb+srv://admin:BiKLGs7Yq6QGir8D@cluster0-phananhduong.iseov.mongodb.net/dormitory-management?retryWrites=true&w=majority&appName=Cluster0-PhanAnhDuong';

let databaseInstance = null;

const connect = async () => {
    try {
        // Kết nối Mongoose với MongoDB Atlas
        const { connection } = await mongoose.connect(MONGODB_URI);
        databaseInstance = connection.db;
        console.log('Connected to MongoDB Atlas successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error);
        throw error;
    }
};

const getdb = () => {
    if (!databaseInstance) throw new Error('Must connect to Database first');
    return databaseInstance;
};

export default { connect, getdb };
