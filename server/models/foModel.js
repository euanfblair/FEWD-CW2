const nedb = require('gray-nedb');
class FamilyOrganiser {

    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new nedb({ filename: dbFilePath, autoload: true });
            console.log('DB connected to ' + dbFilePath);
        } else {
            this.db = new nedb();
            console.log('Events DB connected to database');
        }
    }

    init() {
        this.db.count({}, (err, count) => {
            if (err || count > 0) {
                console.log('Events database already initialized or error occurred');
                return;
            }

            this.db.insert({
                event: 'gym',
                date: '2025-09-16',
                startTime: '16:15',
                endTime: '17:00',
                location: 'Sports Centre',
                requiredItems: 'sports kit',
                organiser: 'Admin1',
                familyId: 'family_1'
            });
            console.log('Events database initialized with default events');
        });
    }

    addEvent(event, date = null, startTime, endTime, location, requiredItems, username, familyId) {
        return new Promise((resolve, reject) => {
            let newEvent = {
                event: event,
                date: date || new Date().toISOString().split('T')[0],
                startTime: startTime,
                endTime: endTime,
                location: location,
                requiredItems: requiredItems,
                organiser: username,
                familyId: familyId
            }
            console.log('Event created', newEvent);

            this.db.insert(newEvent, (err, doc) => {
                if (err) {
                    console.log('Error inserting document', event);
                    reject(err);
                } else {
                    console.log('document inserted into the database', doc);
                    resolve(doc);
                }
            });
        });
    }


    getAllEvents() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, events) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(events);
                }
            });
        });
    }

    getUpcomingEvents() {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            this.db.find({ date: { $gte: today } }, (err, events) => {
                if (err) {
                    reject(err);
                } else {
                    events.sort((a, b) => {
                        if (a.date === b.date) {
                            return a.startTime.localeCompare(b.startTime);
                        }
                        return a.date.localeCompare(b.date);
                    });
                    resolve(events);
                    console.log('getUpcomingEvents() returns: ', events);
                }
            });
        });
    }

    getEventsByUser(organiser) {
        return new Promise((resolve, reject) => {
            this.db.find({ organiser: organiser }, (err, events) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(events);
                    console.log(`getEventsByUser(${organiser}) returns: `, events);
                }
            });
        });
    }

    deleteEvent(eventId) {
        return new Promise((resolve, reject) => {
            this.db.remove({ _id: eventId }, {}, (err, numRemoved) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                    console.log(`Event ${eventId} deleted, ${numRemoved} documents removed`);
                }
            });
        });
    }

    updateEvent(eventId, updateData) {
        return new Promise((resolve, reject) => {
            this.db.update({ _id: eventId }, { $set: updateData }, {}, (err, numReplaced) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numReplaced);
                    console.log(`Event ${eventId} updated, ${numReplaced} documents modified`);
                }
            });
        });
    }

    getEventById(eventId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: eventId }, (err, event) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(event);
                    console.log(`getEventById(${eventId}) returns: `, event);
                }
            });
        });
    }

}
module.exports = FamilyOrganiser;