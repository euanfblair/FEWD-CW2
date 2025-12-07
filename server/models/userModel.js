const Datastore = require('gray-nedb');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class userDAO {
    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new Datastore({
                filename: dbFilePath,
                autoload: true
            });
        } else {
            this.db = new Datastore();
        }
    }

    init() {
        this.db.count({}, (err, count) => {
            if (err || count > 0) {
                console.log('User database already initialized or error occurred');
                return;
            }

            return this;
        })
    }


    create(newUser) {
        const that = this;
        let entry = newUser

        that.db.insert(entry, (err) => {
            if (err) {
                console.log("Can't insert user: ", newUser.username);
            }
        });

    }



    lookup(user, family, cb) {
        console.log("Looking up user:", user, "in family:", family);
        this.db.find({ $and: [{ username: user, familyId: family }] }, (err, entries) => {
            if (err) {
                console.log(err)
                return err
            } else {
                console.log(entries)
                if (entries.length == 0) {
                    return cb(null, null);
                }
                return cb(null, entries[0]);
            }
        });
    }

    lookupByUsername(username, cb) {
        this.db.find({}, (err, entries) => {
            if (err) {
                console.log(err)
                return cb(err, null);
            } else {
                const user = entries.find(u => u.username.toLowerCase() === username.toLowerCase());
                if (!user) {
                    return cb(null, null);
                }
                return cb(null, user);
            }
        });
    }

    getUserById(id, cb) {
        this.db.find({ _id: id }, (err, entries) => {
            if (err) {
                return cb(null, null);
            } else {
                if (entries.length == 0) {
                    return cb(null, null);
                }

                return cb(null, entries[0]);
            }
        });
    }

    getAllUsersInFamily(family) {
        return new Promise((resolve, reject) => {
            this.db.find({ familyId: family }, (err, users) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(users)
                    resolve(users);
                }
            });
        });
    }

    countUsersInFamily(familyId) {
        return new Promise((resolve, reject) => {
            this.db.count({ familyId: familyId }, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }

    getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, users) => {
                if (err) {
                    reject(err);
                } else {
                    const safeUsers = users.map(user => {
                        const { password, ...safeUser } = user;
                        return safeUser;
                    });
                    resolve(safeUsers);
                }
            });
        });
    }

    updateUser(id, updateData) {
        return new Promise((resolve, reject) => {
            this.db.update({ _id: id }, { $set: updateData }, {}, (err, numReplaced) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numReplaced);
                    console.log(`User number${id} updated, ${numReplaced} documents modified`);
                }
            });
        });
    }

    deleteUser(username) {
        return new Promise((resolve, reject) => {
            this.db.remove({ user: username }, {}, (err, numRemoved) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                    console.log(`User ${username} deleted, ${numRemoved} documents removed`);
                }
            });
        });
    }

}

const path = require('path');
const dao = new userDAO(path.join(__dirname, '../data/users.db'));
dao.init();
module.exports = dao;