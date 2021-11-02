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
                    const sortedRecords = records.sort((a, b) => {
                        return (a.date > b.date) ? -1 : 1;
                    })
                    res.render("userHome", {
                        user: req.user,
                        records: sortedRecords 
                    });
                })
                break;
            
            default:
                Record.find({trainee: req.user})
                .then(records => {
                    const sortedRecords = records.sort((a, b) => {
                        return (a.date > b.date) ? -1 : 1;
                    })
                    res.render("userHome", {
                        user: req.user,
                        records: sortedRecords 
                    });
                })
                break;
        }
    }
}

//ユーザー詳細ページ
exports.getUserDetail = (req, res) => {
    const userId = req.params.id
    Person.findById(userId)
    .then(user => {
        if (user.group === "HONDA") {
            Record.find({instructor: user})
            .then(records => {
                const sortedRecords = records.sort((a, b) => {
                    return (a.date > b.date) ? -1 : 1;
                })
                res.render("userDetail", {
                    user: user,
                    records: sortedRecords 
                })
            })
        } else {
            Record.find({trainee: user})
            .then(records => {
                const sortedRecords = records.sort((a, b) => {
                    return (a.date > b.date) ? -1 : 1;
                })
                res.render("userDetail", {
                    user: user,
                    records: sortedRecords 
                })
            })
        }
    })
    .catch(err => console.log(err));
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
            res.render("summary", {
                group: trainee.group,
                id: trainee.id,
                kname: trainee.fullName(),
                phase: formData.phase,
                record: records,
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

exports.getCreateRecord= (req, res) => {
    res.render("createRecord");
};

exports.postCreateRecord = (req, res) => {
    let trainee, instructor;
    Promise.all([
        Person.findOne({id: req.body.trainee_id})
        .then(person => {
            trainee = person
        }),
        Person.findOne({id: req.body.inst_id})
        .then(person => {
            instructor = person
        })
    ])
    .then(() => {
        //新しいrec_idを決定
        let rec_id;
        Record.find({phase: req.body.phase, trainee: trainee._id})
        .then(records => {
            switch (records.length) {
                case 0:
                    rec_id = 1;
                    break;
                case 1:
                    rec_id = 2;
                    break;
                default:
                    const sortedRecords = records.sort((a, b) => {
                        return (a.rec_id > b.rec_id) ? -1 : 1;
                    });
                    rec_id = sortedRecords[0].rec_id - 0 + 1;
                    break;
            }
            console.log(rec_id);
        })
        //新規保存
        .then(() => {
            Record.create({
                phase: req.body.phase,
                rec_id: rec_id,
                date: req.body.date,
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
        .then(() => {
            res.redirect("/")
        });
    })
}



exports.getEditRecord = (req, res) => {
    Record.findById(req.params.id)
    .populate("trainee")
    .populate("instructor")
    .then(record => {
        res.render("editRecord", {
            record: record
        });
    }).catch(error => {
        console.log(error);
        res.redirect("/");
    });
}

exports.postEditRecord = (req, res) => {
    let recordId = req.body.id;
    let newData = {
        phase: req.body.phase,
        rec_id: req.body.rec_id - 0,
        date: req.body.date,
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
            res.redirect("/");
        })
        .catch(error => res.send(error));
}