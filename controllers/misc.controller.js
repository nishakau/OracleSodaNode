const formidable = require("formidable");
const fs = require("fs");
const csvtojson = require("csvtojson");
const csv = csvtojson();
const path = require("path");
const oracledb = require("oracledb");
const { response } = require("express");
const metadata = require("./metadata").metadata;


async function writeToDatabase(jsonObj) {

    let connection;
    try {
      let collectionName = collName;

      connection = await oracledb.getConnection();
      const soda = connection.getSodaDatabase();
      const myCollection = await soda.createCollection(collectionName,{metaData:metadata});
      await myCollection.insertMany(jsonObj);
      await connection.commit();
     
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          throw err;
        }
      }
    }
  }

function readFile(path){
    return new Promise((resolve,reject)=>{
        csv.fromFile(path).then((err,jsonObj)=>{
            if(err) reject(err);
            writeToDatabase(jsonObj)
            .then(
                (data)=>{
                    resolve(true);
                },
                (err)=>{
                    reject(err);
                }
            );
        })

   });
    

}


exports.handleFileUpload_1 = function (request, response, next) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      if (files) {
        var oldPath = files.filename.path;
        var newPath = path.join(__dirname, "../uploads/" + files.filename.name);
  
        fs.stat(newPath, function (err, stat) {
          if (err == null) {
            let error = new Error("File already exists");
            return next(error);
          } else if (err.code == "ENOENT") {
            fs.readFile(oldPath, function (err, data) {
              if (err) return next(err);
              fs.writeFile(newPath, data, function (err) {
                if (err) return next(err);
                readFile(newPath).then(
                    (data)=>{
                        response.redirect("/admin/getAllDoc/"+fields.collectionConnectedForm);
                    },
                    (err)=>{
                        return next(err);
                    }
                );
              });
            });
          }
        });
      }
    });
  };


//---------------------------------========================

function insertBulkInDatabase(path, collName, next, response) {
  csv.fromFile(path).then(async (jsonObj) => {
    let connection;
    try {

      let collectionName = collName;

      connection = await oracledb.getConnection();
      const soda = connection.getSodaDatabase();
      const myCollection = await soda.createCollection(collectionName,{metaData:metadata});
      await myCollection.insertMany(jsonObj);
      await connection.commit();
      // fs.unlink(path, function (err) {
      //     if (err){
      //         var err = new Error("File Uploded to databsae but unable to delete the file");
      //         return next(err);
      //     }
      //     console.log('File deleted!');

      //     response.redirect("/admin/collection/"+collectionName);
      // });

      fs.rename(path, path + "uploaded.csv", function (err) {
        if (err) {
          var err = new Error(
            "File Uploded to databsae but unable to rename the file"
          );
          return next(err);
        }
        console.log("File Renamed.");
        response.redirect("/admin/collection/" + collectionName);
      });
    } catch (err) {
      await connection.rollback();
      return next(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.log("Error in closing connection:\n", err);
        }
      }
    }
  });
}

exports.handleFileUpload = function (request, response, next) {
  var form = new formidable.IncomingForm();
  form.parse(request, function (err, fields, files) {
    if (files) {
	
      var oldPath = files.filename.path;
      var newPath = path.join(__dirname, "../uploads/" + files.filename.name);

      fs.stat(newPath, function (err, stat) {
        if (err == null) {
          let error = new Error("File already exists");
          return next(error);
        } else if (err.code == "ENOENT") {
          fs.readFile(oldPath, function (err, data) {
            if (err) return next(err);
            fs.writeFile(newPath, data, function (err) {
              if (err) return next(err);
              let collName = fields.collectionConnectedForm;
              insertBulkInDatabase(newPath, collName, next, response);
            });
          });
        }
      });
    }
  });
};



