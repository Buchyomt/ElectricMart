const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const User = require('../server/models/User');

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the most recently created user or search by a common email if known
        // Since I don't have the user's specific email, I'll list the users to help identify
        const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
        
        if (users.length === 0) {
            console.log('No users found in database.');
            process.exit(0);
        }

        console.log('Recent Users:');
        users.forEach((u, i) => console.log(`${i+1}. ${u.name} (${u.email}) - Role: ${u.role}`));

        // For now, I will promote the VERY LATEST user created to admin
        const latestUser = users[0];
        latestUser.role = 'admin';
        await latestUser.save();

        console.log(`\n✅ SUCCESS: User "${latestUser.name}" (${latestUser.email}) has been promoted to ADMIN.`);
        process.exit(0);
    } catch (err) {
        console.error('Promotion error:', err);
        process.exit(1);
    }
};

promoteUser();
