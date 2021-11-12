const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({
    trainee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
        required: true
    },
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: "Person"},
    phase: String,
    rec_id: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    g_grade: String,
    technical: String,
    knowledge: String,
    crm: String,
    t_comment: String,
    k_comment: String,
    c_comment: String,
    edit: Boolean
});

module.exports = mongoose.model("Record", recordSchema);