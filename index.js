const dbUrl = "mongodb+srv://dozono:0512kenta20@cluster0.uyhrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//モジュール
const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const connectFlash = require("connect-flash");

//別ファイル
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const userController = require("./controllers/userController");
const Record = require("./models/record");
const Person = require("./models/person");

//mongoDBの初期設定
mongoose.connect(
    dbUrl,
    {useNewUrlParser: true}
).then(() => console.log("MongoDB connected"))
 .catch(err => console.log(err));
const db = mongoose.connection;
mongoose.Promise = global.Promise;

const app = express();
const router = express.Router();


// 公開時と非公開時のportを設定
app.set("port", process.env.PORT || 3000);
//テンプレートとしてejsを使う
app.set("view engine", "ejs");
//全ページ共通のレイアウトを使用
app.use(layouts);
//POSTをJSONで読み込む
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//routerを使ってリクエストを処理
app.use("/", router);

//cookieとsession
router.use(cookieParser("secretRecord2021"));
router.use(expressSession({
    secret: "secretRecord2021",
    cookie: {
        maxAge: 40000000
    },
    resave: false,
    saveUninitialized: false
}));
router.use(connectFlash());

//passportの初期設定
router.use(passport.initialize());
router.use(passport.session());
passport.use(Person.createStrategy());
passport.serializeUser(Person.serializeUser());
passport.deserializeUser(Person.deserializeUser());

//ログインしているかチェック
router.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

//各ページのルーティング
//トップページ，ログイン
router.get("/", homeController.getHome);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", userController.authenticate);
router.get("/logout", userController.logout);
//Record関連
router.get("/record/create",userController.isInst, homeController.getCreateRecord)
router.post("/record/create",userController.isInst, homeController.postCreateRecord)
router.get("/record/:id", homeController.getRecord);
router.get("/record/:id/edit",userController.isInst,  homeController.getEditRecord);
router.post("/record/:id/edit", userController.isInst, homeController.postEditRecord);
router.post("/record/:id/delete", userController.isInst, homeController.delete);
//管理者用
router.get("/users", userController.isAdmin, userController.getUsers);
router.get("/users/create", userController.isAdmin, (req, res) => res.render("createUser"));
router.post("/users/create", userController.isAdmin, userController.create);
router.get("/users/:id", userController.isAdmin, homeController.getUserDetail);
router.get("/summary", homeController.getSummary);

router.get("/initialize", userController.initialize);
router.get("/test", homeController.testFunction);

//エラー処理
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);


app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
})