const adminController = require("../controllers/admin.controller");

module.exports = function(app){
   app.route("/admin/getAllCollections").get(adminController.getAllCollections);
   app.route("/admin/dropCollection").post(adminController.dropCollection);
   app.route("/admin/createCollection").post(adminController.createCollection);
   app.route("/admin/collection/:name").get(adminController.collectionDetail);
   app.route("/admin/getAllDoc/:collectionName").get(adminController.fetchAllDoc);
   app.route("/admin/getDocByKey").get(adminController.getDocumentByKey);
   app.route("/admin/deleteDocument").post(adminController.deleteDocument);
   app.route("/admin/insertDocument").post(adminController.insertDocument);
   app.route("/admin/updateDocument").post(adminController.updateDocument);
   app.route("/admin/getDocByFilter").post(adminController.getDocumentByFilter);
}