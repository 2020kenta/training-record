const Person = require("../models/person");
const passport = require("passport");

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
}