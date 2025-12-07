const familyorganiserDAO = require('../models/foModel');
const userDAO = require('../models/userModel.js');
const utils = require("../lib/utils");
const db = new familyorganiserDAO("./data/events.db");
db.init();

exports.json_events_endpoint = (req, res) => {
    db.getAllEvents().then((list) => {
        res.json(list);
    })
}

exports.json_users_endpoint = (req, res) => {
    userDAO.getAllUsers().then((users) => {
        res.json(users);
    })
}

exports.process_new_user = async (req, res, next) => {
    const user = req.body.username;
    const displayName = req.body.displayName;
    const password = req.body.password;
    const familyData = req.body.familyData;
    const mode = req.body.mode || 'create';

    if (!user || !password) {
        return res.status(400).json({ success: false, msg: 'Username and password required' });
    }

    if (!displayName || displayName.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Your name is required' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, msg: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' });
    }

    if (!familyData || familyData.trim() === '') {
        return res.status(400).json({ success: false, msg: mode === 'join' ? 'Family code required' : 'Family name required' });
    }

    try {
        const allUsers = await userDAO.getAllUsers();

        const existingUserWithName = allUsers.find(u => u.username.toLowerCase() === user.toLowerCase());
        if (existingUserWithName) {
            return res.status(400).json({ success: false, msg: 'Username already taken. Please choose a different username.' });
        }

        let familyCode;
        let familyName;

        if (mode === 'join') {
            const existingFamily = allUsers.find(u => u.familyCode === familyData);
            if (!existingFamily) {
                return res.status(400).json({ success: false, msg: 'Family code not found. Please check the code and try again.' });
            }
            familyCode = familyData;
            familyName = existingFamily.familyName;
        } else {
            familyCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
            familyName = familyData;
        }

        const saltHash = utils.genPassword(password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;

        const newUser = {
            username: user,
            displayName: displayName,
            hash: hash,
            salt: salt,
            familyCode: familyCode,
            familyName: familyName,
            familyId: familyCode,
            createdAt: new Date().toISOString(),
        };

        userDAO.create(newUser);
        res.json({ success: true, user: { username: user, displayName: displayName, familyCode: familyCode, familyName: familyName } });
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Database error' });
    }
};


exports.family_events_endpoint = (req, res) => {
    const familyId = req.body.familyId;
    db.getAllEvents().then((list) => {
        const familyEvents = list.filter(event => event.familyId === familyId);
        res.json(familyEvents);
    })
}

exports.get_event_by_id = (req, res) => {
    const eventId = req.params.id;
    db.getEventById(eventId).then((event) => {
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        res.json(event);
    }).catch((err) => {
        console.log('Error fetching event:', err);
        res.status(500).json({ success: false, message: 'Error retrieving event' });
    });
}

exports.new_event_entry = (req, res) => {
    userDAO.getAllUsersInFamily(req.family).then((users) => {
        const participantList = users.map(user => user.user)
        res.render('newEvent', {
            'title': 'Family Events',
            'user': req.user,
            'users': participantList
        })
    })
}
exports.post_new_event = (req, res) => {
    db.addEvent(
        req.body.event,
        req.body.date,
        req.body.startTime,
        req.body.endTime,
        req.body.location,
        req.body.requiredItems,
        req.body.username,
        req.body.userfamily
    );

    if (req.io) {
        const familyRoom = 'family_' + req.body.userfamily;
        req.io.to(familyRoom).emit('refresh_events');
    }

    res.json({ success: true, msg: "event added" });
}


exports.handle_login = async (req, res) => {
    const currentUser = req.body.username;

    if (!currentUser) {
        return res.status(400).json({ success: false, msg: 'Username required' });
    }

    try {
        const user = await new Promise((resolve, reject) => {
            userDAO.lookupByUsername(currentUser, (err, foundUser) => {
                if (err) reject(err);
                else resolve(foundUser);
            });
        });

        if (!user) {
            return res.status(403).json({ msg: 'User not found' });
        }

        const isValid = utils.validPassword(
            req.body.password,
            user.hash,
            user.salt
        );

        if (isValid) {
            const tokenObject = utils.issueJWT(user);
            return res.status(200).json({
                success: true,
                token: tokenObject.token,
                expiresIn: tokenObject.expires,
                username: user.username,
                displayName: user.displayName,
                userfamily: user.familyId,
                familyCode: user.familyCode,
                familyName: user.familyName,
            });
        } else {
            return res.status(401).json({ success: false, msg: "Invalid password" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Database error' });
    }
};

exports.show_edit_event = (req, res) => {
    const eventId = req.params.id;
    const currentUser = req.user;
    const currentUserFamily = req.family;
    let familyMembers = [];

    userDAO.getAllUsersInFamily(currentUserFamily).then(
        (users) => {
            familyMembers = users.map(user => user.user)
        })

    userDAO.lookup(currentUser, currentUserFamily, (err, user) => {
        if (err || !user) return res.status(403).send('Error');
        db.getEventById(eventId).then((event) => {
            if (!event) {
                res.status(404).send('Event not found');
                return;
            }
            if (event.organiser !== currentUser) {
                return res.status(403).send('Forbidden');
            }
            res.json(event);
        })
            .catch((err) => {
                res.status(500).json({ success: false, error: err });
            });
    });
};
exports.update_event = (req, res) => {
    const eventId = req.params.id;
    const currentUser = req.body.username;
    const currentFamily = req.body.userfamily;

    db.getEventById(eventId).then((event) => {
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (event.organiser !== currentUser) {
            return res.status(403).json({ success: false, message: 'Only the event organiser can edit this event' });
        }
        if (event.familyId !== currentFamily) {
            return res.status(403).json({ success: false, message: 'Event does not belong to your family' });
        }

        const updateData = {
            event: req.body.event,
            requiredItems: req.body.requiredItems,
            location: req.body.location,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            organiser: event.organiser,
            familyId: event.familyId
        };
        db.updateEvent(eventId, updateData).then((numUpdated) => {
            if (numUpdated === 0) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }

            if (req.io) {
                const familyRoom = 'family_' + event.familyId;
                req.io.to(familyRoom).emit('refresh_events');
            }

            res.json({ success: true, message: 'Event updated' });
        }).catch((err) => {
            console.log('Error updating event:', err);
            res.status(500).json({ success: false, message: 'Error updating event' });
        });
    }).catch((err) => {
        res.status(500).json({ success: false, message: 'Error retrieving event' });
    });
};
exports.delete_event = (req, res) => {
    const eventId = req.params.id;
    const currentUser = req.body.username;
    const currentFamily = req.body.userfamily;

    db.getEventById(eventId).then((event) => {
        if (!event) {
            return res.status(404).json({ 'message': 'Event not found' });
        }
        if (event.organiser !== currentUser) {
            return res.status(403).json({ 'message': 'Only the event organiser can delete this event' });
        }
        if (event.familyId !== currentFamily) {
            return res.status(403).json({ 'message': 'Event does not belong to your family' });
        }
        db.deleteEvent(eventId).then((numDeleted) => {
            if (numDeleted === 0) {
                return res.status(404).json({ 'message': 'Event not found' });
            }

            if (req.io) {
                const familyRoom = 'family_' + currentFamily;
                req.io.to(familyRoom).emit('refresh_events');
            }

            res.status(202).json({ 'event deleted': numDeleted });
        }).catch((err) => {
            console.log('Error deleting event:', err);
            res.status(500).json({ 'message': 'Error deleting event' });
        });
    }).catch((err) => {
        console.log('Error fetching event:', err);
        res.status(500).json({ 'message': 'Error retrieving event' });
    });
}
exports.show_user_management = (req, res) => {
    userDAO.getAllUsers().then((users) => {
        familyUsers = users.filter(user => user.familyId === req.family);
        res.render('userManagement', {
            title: 'Manage Family Members',
            users: familyUsers,
            user: req.user
        });
    })
        .catch((err) => {
            console.log('Error fetching users:', err);
            res.status(500).send('Error retrieving users');
        });
}

exports.add_new_family_member = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role || 'member';
    family = req.family || 'family_1'; // Default family if not provided

    if (!username || !password) {
        res.status(400).send('Username and password required');
        return;
    }

    userDAO.lookup(username, family, (err, existingUser) => {
        if (existingUser && existingUser.familyId === family) {
            res.status(400).send(`User ${username} already exists`);
            return;
        }

        userDAO.addUser(username, password, role, family)
        res.redirect('/manage-users');
    })
}

exports.delete_user = (req, res) => {
    const username = req.params.user;

    userDAO.deleteUser(username).then((numDeleted) => {
        if (numDeleted === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.redirect('/manage-users');
    })
        .catch((err) => {
            console.log('Error deleting user:', err);
            res.status(500).send('Error deleting user');
        });
};

exports.show_user_details = (req, res) => {
    const username = req.params.user;
    userDAO.lookup(username, req.family, (err, userDetails) => {
        if (err || !userDetails) {
            res.status(404).send('User not found');
            return;
        }
        res.render('editUser', {
            title: `User Details - ${username}`,
            user: userDetails,
        });
    });
};

exports.edit_user = (req, res) => {
    const userIdForEdit = req.params.id;

    const currentUser = req.user;
    userDAO.getUserById(userIdForEdit, (err, user) => {
        if (err || !currentUser) return res.status(403).send('Forbidden');
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        res.render('editUser', {
            title: 'Edit User',
            user: user
        });
    })
}

exports.update_user = (req, res) => {
    const userIdForEdit = req.params.id;
    const family = req.family;

    const updateData = {
        user: req.body.username,
        role: req.body.role,
        familyId: family,
        _id: userIdForEdit
    };

    userDAO.updateUser(userIdForEdit, updateData).then((numUpdated) => {
        if (numUpdated === 0) {
            res.status(404).send('User not updated');
            return;
        }
        res.redirect('/manage-users');
    })
        .catch((err) => {
            console.log('Error updating user:', err);
            res.status(500).send('Error updating event');
        });
}

