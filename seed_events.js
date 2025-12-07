const fs = require('fs');
const path = require('path');

const usersDbPath = path.join(__dirname, 'server/data/users.db');
const eventsDbPath = path.join(__dirname, 'server/data/events.db');

const TARGET_USER = 'eblair';

try {
    const fileContent = fs.readFileSync(usersDbPath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    let targetUser = null;
    const allUsernames = [];

    for (const line of lines) {
        try {
            const user = JSON.parse(line);
            allUsernames.push(user.username);
            if (user.username === TARGET_USER) {
                targetUser = user;
                break;
            }
        } catch (e) {
            // Ignore malformed lines
        }
    }

    if (!targetUser) {
        console.error(`User ${TARGET_USER} not found.`);
        console.error(`Available users: ${allUsernames.join(', ')}`);
        process.exit(1);
    }

    console.log(`Found user ${targetUser.username} with familyId ${targetUser.familyId}`);

    const activities = ['Gym', 'Meeting', 'Dinner', 'Shopping', 'Movie', 'Study', 'Coffee', 'Walk', 'Dentist', 'Lunch'];
    const locations = ['Downtown', 'Office', 'Home', 'Mall', 'Park', 'Cafe', 'Clinic', 'Restaurant'];

    let newLines = '';

    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30));
        const dateStr = date.toISOString().split('T')[0];

        const startHour = 8 + Math.floor(Math.random() * 12);
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;

        const activity = activities[Math.floor(Math.random() * activities.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];

        const event = {
            event: `${activity} with friends`,
            date: dateStr,
            startTime: startTime,
            endTime: endTime,
            location: location,
            requiredItems: 'None',
            organiser: targetUser.username,
            familyId: targetUser.familyId,
            _id: Math.random().toString(36).substr(2, 16)
        };

        newLines += JSON.stringify(event) + '\n';
    }

    fs.appendFileSync(eventsDbPath, newLines);
    console.log('Successfully appended 20 events');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
