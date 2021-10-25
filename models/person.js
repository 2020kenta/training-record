const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const personSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    sname: {
        type: String,
        required: true
    },
    ksname: {
        type: String,
        required: true
    },
    gname: {
        type: String,
        required: true
    },
    kgname: {
        type: String,
        required: true
    },
    sex: {
        type: String
    },
    group: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    birth: {
        type: String
    }
});

personSchema.plugin(passportLocalMongoose, {
    usernameField: "id"
});

personSchema.methods.fullName = function () {
    return this.ksname + this.kgname;
}

module.exports = mongoose.model("Person", personSchema);