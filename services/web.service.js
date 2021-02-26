const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const webConfigProp = require("../config/web.conf");
const path = require("path");
let httpServer;
function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    //enabling request from any domain
    app.use(cors());

    // setting view engine
    app.set("view engine", "ejs");
    app.set("views", "views");
    app.engine("html", require("ejs").renderFile);

    //public folder to store other related files
    app.use(express.static(path.join(__dirname, "../public")));
    app.use((req, res, next) => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      next();
    });

    require("../routes/app.route")(app);
    require("../routes/admin.route")(app);
    require("../routes/misc.route")(app);

    app.use(function (req, res, next) {
      var err = new Error("File not found");
      err.status = 404;
      next(err);
    });

    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.send(err.message);
      res.end();
    });

    httpServer
      .listen(webConfigProp.port, "localhost")
      .on("listening", () => {
        console.log(`web server listening on the port :${webConfigProp.port}`);
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports.initialize = initialize;
module.exports.close = function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};
