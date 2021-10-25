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
    //Dockerの場合
    //"mongodb://mongo:27017/sample_db",
    //localの場合
    "mongodb://localhost:27017/sample_db",
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
router.get("/", homeController.getHome);
router.get("/test", homeController.testFunction);
router.get("/create", (req, res) => res.render("create"));
router.post("/create", userController.create);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", userController.authenticate);
router.get("/logout", userController.logout);
router.get("/summary", homeController.getSummary);
router.get("/record", homeController.getRecord);
router.get("/register",  homeController.getRegister);
router.post("/register", homeController.postRegister);
router.get("/record/edit", userController.isLoggedin, homeController.getEdit);
router.post("/record/edit", userController.isLoggedin, homeController.postEdit);
router.post("/record/delete", userController.isLoggedin, homeController.delete);

router.get("/initialize", userController.initialize);

//エラー処理
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);


app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
})