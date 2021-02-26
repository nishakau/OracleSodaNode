const appController = require("../controllers/app.controller");

module.exports = function(app){
    app.route("/").get(appController.getAllProducts);
    app.route("/deleteDocument").post(appController.deleteDocument);
    app.route("/document/:key").get(appController.getDocumentByKey);
    app.route("/updateDocument").post(appController.updateDocument);
    app.route("/createDocument").get(function(request,response){
        response.render('documentCreate');
        response.end();
    });
    app.route("/insertDocument").post(appController.insertDocument);
}