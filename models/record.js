const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({
    trainee_id: {
        type: String,
        required: true
    },
    phase: String,
    rec_id: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    inst_id: String,
    g_grade: String,
    technical: String,
    knowledge: String,
    crm: String,
    t_comment: String,
    k_comment: String,
    c_comment: String,
    trainee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
        required: true
    },
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: "Person"}
});

module.exports = mongoose.model("Record", recordSchema);