const oracledb = require("oracledb");

exports.getAllProducts = async function (request, response, next) {
  console.log("into get all products");
  let connection;
  try {
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection("items");
    const doc = await collection.find().getDocuments();
    const docCount = await collection.find().count();
    const docCountInStock = await collection.find().filter({availablity:1}).count();
    const docCountOutOfStock = await collection.find().filter({availablity:0}).count();
    let array = new Array();
    doc.forEach(function (element) {
      const content = element.getContent();
      content.key = element.key;
      array.push(content);
     // console.log(content);
    });

    //  response.send(array);
    response.render("home", { products: array,totalCount :docCount.count,inStockCount:docCountInStock.count,outStockCount:docCountOutOfStock.count });
    response.end();
  } catch (e) {
    return next(e);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error in closing connection:\n", err);
      }
    }
  }
};

exports.deleteDocument = async function (request, response, next) {
  
  let connection;
  try {
    let key = request.body.key;
    console.log(key);
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection("items");
    await collection.find().key(key).remove();
    await connection.commit();
    response.status(200).end("true");
   
  } catch (e) {
    return next(e);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error in closing connection:\n", err);
      }
    }
  }
};

exports.getDocumentByKey = async function (request, response, next) {
  console.log("into getDocByKey products");
  let connection;
  try {
    let key = request.params.key;
    console.log(key);
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection("items");
    const doc = await collection.find().key(key).getOne();
    let content = doc.getContent();
    content.key = doc.key;
    response.render("updateDocument",{product:content});
    response.end();
  } catch (e) {
    return next(e);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error in closing connection:\n", err);
      }
    }
  }
};

exports.updateDocument = async function (request, response, next) {
  console.log("into update document");
  let connection;
  try {
    let key = request.body.key;
    delete request.body.key;
    console.log(key);
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection("items");
    await collection.find().key(key).replaceOne(request.body);
    await connection.commit();
    response.redirect("/");
  } catch (e) {
    return next(e);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error in closing connection:\n", err);
      }
    }
  }
};


//----app specific

exports.insertDocument = async function (request, response, next) {
  console.log("into insert");
  console.log(request.body);
  let connection;
  try {
    connection = await oracledb.getConnection();
    console.log("conected to the datbase");
    const soda = connection.getSodaDatabase();
    console.log("connected to soda" + soda);
    const collectionName = "items";
    const myCollection = await soda.createCollection(collectionName);
    const myContent = request.body;
    await myCollection.insertOne(myContent);
    await connection.commit();
    response.redirect("/");
  } catch (err) {
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
}

