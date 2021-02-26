const miscController = require("../controllers/misc.controller");

module.exports = function(app){
    app.route("/csvUpload").post(miscController.handleFileUpload);
}