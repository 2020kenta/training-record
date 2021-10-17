//モジュール
const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

//別ファイル
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const Record = require("./models/record");
const Person = require("./models/person");

//mongoDBの初期設定
mongoose.connect(
    "mongodb://mongo:27017/sample_db",
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

//各ページのルーティング
router.get("/", homeController.getHome);
router.get("/summary", homeController.getSummary);
router.get("/record", homeController.getRecord);
router.get("/register", homeController.getRegister);
router.post("/register", homeController.postRegister);
router.get("/record/edit", homeController.getEdit);
router.post("/record/edit", homeController.postEdit);
router.post("/record/delete", homeController.delete);


//エラー処理
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);


app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
})