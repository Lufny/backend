var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId;

var Sessions = new Schema({
    session: {type: String, unique: true},
    vars: {type: Array}
}, {strict: true});

exports.Sessions = Sessions;
