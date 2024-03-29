var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = mongoose.ObjectId;

var Special = new Schema({
    type: {type: String},
    key: {type: String},
    vars: {type: Array},
    uid: {type: Schema.ObjectId, ref: "users"}
}, {strict: true});

exports.Special = Special;
