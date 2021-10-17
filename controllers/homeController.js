const fs = require("fs");
const Record = require("../models/record");
let persons = require("../public/persons.json");
//トップページへのGEt
exports.getHome = (req,res) => {
    res.render("index");
}

//SummaryページへのGET
exports.getSummary = (req, res) => {
    //フォームデータを取得
    let formData = req.query;

    //リクエストに沿った個人データを検索
    let person = persons.find( (element) => {
        return (element["id"] === formData.id);
    });

    Record.find({trainee_id: person["id"], phase: formData.phase})
        .then((r) => {
            let newNumber;
            if (r.length > 0) {
                newNumber = r[r.length-1].rec_id - 0 + 1;
            } else {
                newNumber = 1;
            }
            res.render("summary", {
                group: person["group"],
                id: person["id"],
                kname: person["ksname"] + person["kgname"],
                phase: formData.phase,
                record: r,
                newNumber: newNumber
            });
        })
        .catch((error) => {
            res.send(error);
        });
    

}

exports.getRecord = (req, res) => {
    /* let detail = records.find(function(element) {
        return (element["trainee_id"] === formData.id && element["phase"] === formData.phase && element["rec_id"] === formData.rec_id);
    }) */
    Record.findById(req.query.id)
        .then(record => {
            let trainee;
            let instructor;
            for (let i = 0; i < persons.length; i++) {
                if (persons[i]["id"] === record.trainee_id) {
                trainee = persons[i];
                }
                if (persons[i]["id"] === record.inst_id){
                instructor = persons[i];
                }
            }
            res.render("record", {
                detail: record,
                trainee: trainee,
                instructor: instructor
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
    let newRecord = new Record({
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
        c_comment: req.body.c_comment
    });
    newRecord.save((error,result) => {
        if(error) res.send(error);
        res.redirect(`/summary?id=${req.body.id}&phase=${req.body.phase}`);
    })
}

exports.getEdit = (req, res) => {
    Record.findById(req.query.id)
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
        res.redirect(`/record?id=${record._id}`)
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