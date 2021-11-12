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
    //ログインしていなければログインページへ
    if(!req.isAuthenticated()) {
        res.render("login");
    } else {
        //管理者、教官、訓練生で別々のホームページへ
        switch (req.user.group) {
            case "Admin":
                Person.find()
                .then(users => {
                    res.render("adminHome", {
                        users: users
                    });
                })
                break;
        
            case "HONDA":
                let users, records
                Promise.all([
                    //検索用に訓練生一覧を取得
                    Person.find()
                    .then(r => {
                        users = r.sort((a, b) => {
                            return (a.id < b.id) ? -1 : 1;
                        });
                    }),
                    //ユーザーが書いた記録を取得、新しい順
                    Record.find({instructor: req.user})
                    .populate("trainee")
                    .then(r => {
                        records = r.sort((a, b) => {
                            return (a.date < b.date) ? 1 : -1;
                        });
                    })
                ])
                .then(() => {
                    res.render("instHome", {
                        users: users,
                        records: records 
                    });
                });
                break;
            
            default:
                //自分の記録を取得、新しい順
                Record.find({trainee: req.user})
                .then(records => {
                    const sortedRecords = records.sort((a, b) => {
                        return (a.date < b.date) ? 1 : -1;
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

//教官が訓練生検索した時の処理
exports.searchUser = (req, res) => {
    if (req.query.trainee) {
        res.redirect(`/users/${req.query.trainee}`);
    //フォームが入力されていなければ元のページへ
    } else {
        req.flash("error", "訓練生を選択してください。")
        res.redirect("/")
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

//Record詳細ページ
exports.getRecord = (req, res) => {
    Record.findById(req.params.recordId)
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

//Record新規作成ページ
exports.getCreateRecord= (req, res) => {
    Person.findById(req.params.userId)
    .then(trainee => {
        res.render("createRecord", {
            trainee: trainee
        });
    })
    .catch(err => {
        res.render("error", {
            message: err
        });
    });
};

//Recordを新規作成する処理
exports.postCreateRecord = (req, res) => {
    let trainee, instructor;
    Promise.all([
        Person.findById(req.body.trainee_id)
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
            //rec_idがそれまでの最新+1になるように
            switch (records.length) {
                case 0:
                    rec_id = 1;
                    break;
                case 1:
                    rec_id = records[0].rec_id -0 + 1;
                    break;
                default:
                    const sortedRecords = records.sort((a, b) => {
                        return (a.rec_id > b.rec_id) ? -1 : 1;
                    });
                    rec_id = sortedRecords[0].rec_id - 0 + 1;
                    break;
            }
        })
        //新規保存
        .then(() => {
            Record.create({
                trainee: trainee,
                instructor: instructor,
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
                edit: Boolean(req.body.edit)
            });
        })
        .then(() => {
            res.redirect("/")
        });
    })
}

//既存のRecord編集ページへ
exports.getEditRecord = (req, res) => {
    Record.findById(req.params.recordId)
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

//Record編集処理
exports.postEditRecord = (req, res) => {
    let recordId = req.params.recordId;
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
        c_comment: req.body.c_comment,
        edit: Boolean(req.body.edit)
    };
    Record.findByIdAndUpdate(recordId, {
        $set: newData
    }).then(record => {
        res.redirect(`/record/${record._id}`)
    }).catch(error => {
        res.send(error);
    });
}

//Record削除
exports.delete = (req, res) => {
    Record.findByIdAndRemove(req.params.recordId)
        .then(r => {
            res.redirect("/");
        })
        .catch(error => res.send(error));
}

exports.editable = (req, res) => {
    Record.findByIdAndUpdate(req.params.recordId, {
        $set: {
            edit: true
        }
    })
    .then(record => {
        res.redirect(`/record/${record._id}`)
    });
}