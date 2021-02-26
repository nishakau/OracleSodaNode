const database = require("./services/database.service");
const dbConfig = require("./config/db.conf");
const webService = require("./services/web.service");
const defaultThreadPoolSize = 4;

// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE =
  dbConfig.cvgData.poolMax + defaultThreadPoolSize;

async function startup() {
  console.log("Starting application");
  try {
    console.log("Initializing database module");

    await database.initialize();

    console.log("Database connected");
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }
  try {
    console.log("Initializing webserver module");

    await webService.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }
}

startup();

// async function shutdown(e) {
//   let err = e;
//   try {
//     console.log("Closing database module");

//     await database.close();
//     console.log("database closed");
//   } catch (e) {
//     console.log("Encountered error", e);

//     err = err || e;
//   }
//   console.log("Shutting down");

//   try {
//     console.log("Closing web server module");

//     await webService.close();
//     console.log("Closed server");
//   } catch (e) {
//     console.log("Encountered error", e);

//     err = err || e;
//   }

//   console.log("Exiting process");

//   if (err) {
//     process.exit(1); // Non-zero failure code
//   } else {
//     process.exit(0);
//   }
// }

// process.on("SIGTERM", () => {
//   console.log("Received SIGTERM");

//   shutdown();
// });

// process.on("SIGINT", () => {
//   console.log("Received SIGINT");

//   shutdown();
// });

// process.on("uncaughtException", (err) => {
//   console.log("Uncaught exception");
//   console.error(err);

//   shutdown(err);
// });
