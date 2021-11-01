const Person = require("../models/person");
const passport = require("passport");

exports.initialize = (req, res) => {
    const data = require("../public/default.json");

    const people = data.people;
    const record = data.records;
    
    people.forEach((person, index, array) => {
        let newUser = new Person({
            id: person.id,
            sname: person.sname,
            ksname: person.ksname,
            gname: person.gname,
            kgname: person.kgname,
            sex: person.sex,
            group: person.group,
            email: person.email,
            birth: person.birth
        });
        Person.register(newUser, person.password, (error, user) => {
            if (error) {
                console.log(error);
            }
        });
    });
    res.send("初期化しました");
}

exports.getUsers = (req, res) => {
    Person.find()
    .then(users => {
        const sortedUsers = users.sort((a, b) => {
            return (a.id < b.id) ? -1 : 1;
        })
        res.render("users", {
            users: sortedUsers
        });
    })
    .catch(err => {
        res.render("error", {
            message: err
        });
    });
}

exports.getUserDetail = (req, res) => {
    const userId = req.params.id
    Person.findById(userId)
    .then(user => {
        console.log(user);
        res.send(user);
    })
    .catch(err => console.log(err));
}

//新規ユーザー作成
exports.create = (req, res, next) => {
    if(req.skip) next();
    let newUser = new Person({
        id: req.body.id,
        sname: req.body.sname,
        ksname: req.body.ksname,
        gname: req.body.gname,
        kgname: req.body.kgname,
        sex: req.body.sex,
        group: req.body.group,
        email: req.body.email,
        birth: req.body.birth
    });

    //Personモデルに登録情報を書き込み、passwordはハッシュして管理
    Person.register(newUser, req.body.password, (error, user) => {
        if (user) {
            res.redirect("/");
        } else {
            res.render("error", {
                message: error.message
            });
        }
    });
}

//ログイン
exports.authenticate = passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/"
});

//ログアウト
exports.logout = (req, res, next) => {
    req.logout();
    res.redirect("/");
};

//ログインしているかチェック、していなければログイン画面へ
exports.isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

exports.isAdmin= (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.group === "Admin") {
            next();
        } else {
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
}

exports.isInst = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.group === "HONDA" || req.user.group === "Admin") {
            next();
        } else {
            res.render("error", {
                message: "権限がありません。"
            })
        }
    } else {
        res.redirect("/login");
    }
}