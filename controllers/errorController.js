const httpStatus = require("http-status-codes");

exports.logErrors = (error, req, res, next) => {
    console.error(error.stack);
    next(error);
}

exports.respondNoResourceFound = (req, res) => {
    let errorCode = httpStatus.NOT_FOUND;
    res.status(errorCode);
    let errorMessage = `${errorCode} | The page does not exist!`;
    res.render("error", {
        message: errorMessage
    });
}

exports.respondInternalError = (error, req, res, next) => {
    let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
    console.log(`ERROR occurred: ${error.stack}`);
    res.status(errorCode);
    res.send(`${errorCode} | Sorry, our application is experiencing a problem!`);
    let errorMessage =`${errorCode} | Sorry, our application is experiencing a problem!`;
    res.render("error", {
        message: errorMessage
    });
}