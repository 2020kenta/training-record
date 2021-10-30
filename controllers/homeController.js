const Record = require("../models/record");
const Person = require("../models/person");
const { set } = require("mongoose");
const e = require("express");
const { exec } = require("child_process");
const { resolve } = require("path");
const record = require("../models/record");

//実験用関数
exports.testFunction = (req, res, next) => {
}
//トップページへのGEt
exports.getHome = (req,res) => {
    if(!req.isAuthenticated()) {
        res.redirect("/login");
    } else {
        switch (req.user.group) {
            case "Admin":
                res.render("adminHome");
                break;
        
            case "HONDA":
                Record.find({instructor: req.user})
                .then(records => {
                    res.render("userHome", {
                        user: req.user,
                        records: records
                    });
                })
                break;
            
            default:
                Record.find({trainee: req.user})
                .then(records => {
                    res.render("userHome", {
                        user: req.user,
                        records: records
                    });
                })
                break;
        }
    }
}

//SummaryページへのGET
exports.getSummary = (req, res) => {
    //フォームデータを取得
    let formData = req.query;
    let trainee, records;

    //リクエストに沿った個人データを検索
    Person.findOne({id: formData.id})
    .then(person => {
        trainee = person;
    })
    .then(r => {
        Record.find({trainee: trainee, phase: formData.phase})
        .then(r => {
            records = r;
        })
        .then(() => {
            //データを新規作成する時のために次の番号を決めておく
            let newNumber;
            if (records.length > 0) {
                newNumber = records[records.length-1].rec_id - 0 + 1;
            } else {
                newNumber = 1;
            }
            res.render("summary", {
                group: trainee.group,
                id: trainee.id,
                kname: trainee.fullName(),
                phase: formData.phase,
                record: records,
                newNumber: newNumber
            });
        })
        .catch(err => {
            res.render("error", {
                message: err
            });
        });
    })
    .catch(err => {
        res.render("error", {
            message: err
        });
    });
}

exports.getRecord = (req, res) => {
    /* let detail = records.find(function(element) {
        return (element["trainee_id"] === formData.id && element["phase"] === formData.phase && element["rec_id"] === formData.rec_id);
    }) */
    Record.findById(req.params.id)
        .populate("trainee")
        .populate("instructor")
        .then(record => {
            res.render("record", {
                record: record,
            });
        })
        .catch(error => {
            console.log(error);
        });
};

exports.getRegister = (req, res) => {
    res.render("register",{
        trainee_id: req.query.id,
        phase: req.query.phase,
        rec_id: req.query.rec_id
    });
};

exports.postRegister = (req, res) => {
    let trainee, instructor;
    Promise.all([
        Person.findOne({id: req.body.id})
        .then(person => {
            trainee = person
        }),
        Person.findOne({id: req.body.inst_id})
        .then(person => {
            instructor = person
        })
    ])
    .then(() => {
        Record.create({
            trainee_id: req.body.id,
            phase: req.body.phase,
            rec_id: req.body.rec_id - 0,
            date: req.body.date,
            inst_id: req.body.inst_id,
            g_grade: req.body.g_grade,
            technical: req.body.technical,
            knowledge: req.body.knowledge,
            crm: req.body.crm,
            t_comment: req.body.t_comment,
            k_comment: req.body.k_comment,
            c_comment: req.body.c_comment,
            trainee: trainee,
            instructor: instructor
        });
    })
    .catch( err => {
        console.log(err);
        newRecord.save((error,result) => {
            if(error) res.send(error);
        })
    })
    .then(() => {
        res.redirect(`/summary?id=${req.body.id}&phase=${req.body.phase}`);
    });
    
}

exports.getEdit = (req, res) => {
    Record.findById(req.params.id)
    .then(record => {
        res.render("edit", {
            record: record
        });
    }).catch(error => {
        console.log(error);
        res.redirect("/");
    });
}

exports.postEdit = (req, res) => {
    let recordId = req.body.id;
    let newData = {
        trainee_id: req.body.trainee_id,
        phase: req.body.phase,
        rec_id: req.body.rec_id - 0,
        date: req.body.date,
        inst_id: req.body.inst_id,
        g_grade: req.body.g_grade,
        technical: req.body.technical,
        knowledge: req.body.knowledge,
        crm: req.body.crm,
        t_comment: req.body.t_comment,
        k_comment: req.body.k_comment,
        c_comment: req.body.c_comment
    };
    Record.findByIdAndUpdate(recordId, {
        $set: newData
    }).then(record => {
        res.redirect(`/record/${record._id}`)
    }).catch(error => {
        res.send(error);
    });
}

exports.delete = (req, res) => {
    Record.findByIdAndRemove(req.body.id)
        .then(r => {
            res.redirect(`/summary?id=${r.trainee_id}&phase=${r.phase}`);
        })
        .catch(error => res.send(error));
}