const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
        
        if (users.length === 0) {
            console.log('No users found in database.');
            process.exit(0);
        }

        const emailToPromote = process.argv[2];
        
        if (!emailToPromote) {
            console.log('Please provide an email address as an argument.');
            process.exit(1);
        }

        const userToPromote = await User.findOne({ email: emailToPromote.toLowerCase() });
        
        if (!userToPromote) {
            console.log(`No user found with email: ${emailToPromote}`);
            process.exit(1);
        }

        userToPromote.role = 'admin';
        await userToPromote.save();

        console.log(`\n✅ SUCCESS: User "${userToPromote.name}" (${userToPromote.email}) has been promoted to ADMIN.`);
        process.exit(0);
    } catch (err) {
        console.error('Promotion error:', err);
        process.exit(1);
    }
};

promoteUser();
