var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId;

var Sessions = new Schema({
    session: {type: String, unique: true},
    owner: {type: Schema.ObjectId, ref: 'users'},
    vars: {type: Array}
}, {strict: true});

exports.Sessions = Sessions;
