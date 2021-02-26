const oracledb = require("oracledb");
const metadata = require('./metadata').metadata;


exports.getAllCollections = async function (request, response, next) {
 
  let connection;
  try {
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collectionNames = await soda.getCollectionNames();
    response.render("collections",{collections:collectionNames});
    // response.send(collectionNames);
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
}

exports.dropCollection = async function (request, response, next) {
 
  let connection;
  collectionName =  request.body.key;
  try {
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    await collection.drop();
    response.redirect("/admin/getAllCollections");
  } catch (e) {
    await connection.rollback();
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
}


exports.createCollection = async function (request, response, next) {
  console.log("Going to create a new collection with name:-");
  console.log(request.body.key);
  let connection;
  let collectionName = request.body.key;
  try {

  //   let metadata = {
  //     "keyColumn": {
  //         "name":"ID"
  //     },
  //     "contentColumn": {
  //         "name": "JSON_TEXT",
  //         "sqlType": "CLOB"
  //     }
  // }
    connection = await oracledb.getConnection();
    console.log("Connection fetched");
    const soda = connection.getSodaDatabase();
    console.log("Connected to SODA");
    const collection = await soda.createCollection(collectionName,{metaData:metadata});
    console.log("Collection Created");
    connection.commit();
    if(collectionName == 'items'){
      indexSpec = {name: "nameIndex", fields: [{path: "name"}]};
      await collection.createIndex(indexSpec);
    }
    response.status(200).end("true");
    
  } catch (e) {
    await connection.rollback();
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
}

exports.collectionDetail = async function (request, response, next) {
 
  let connection;
  let collectionName = request.params.name;;
  try {
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
	// const collection = await soda.createCollection(collectionName);
    const docCount = await collection.find().count();
    

    response.render("documents",{collectionName:collectionName,count:docCount.count});
  } catch (e) {
    await connection.rollback();
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
}


exports.fetchAllDoc = async function (request, response, next) {

  let connection;
  let collectionName = request.params.collectionName;
  try {
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    const doc = await collection.find().getDocuments();
    let array = new Array();
    doc.forEach(function (element) {
      const content = element.getContent();
      content.key = element.key;
      array.push(content);
    });

    response.send(array);
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
}

exports.getDocumentByFilter = async function (request, response, next) {

  let connection;
  try {
    let collectionName = request.body.collection;
    let qbe = request.body.query;
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    const doc = await collection.find().filter(qbe).getDocuments();
    let array = new Array();
    doc.forEach(function (element) {
      const content = element.getContent();
      content.key = element.key;
      array.push(content);
      console.log(content);
    });

    response.send(array);
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
}


exports.getDocumentByKey = async function (request, response, next) {
  
  let connection;
  try {
    let collectionName = request.query.collection;
    let key = request.query.key;
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    const doc = await collection.find().key(key).getOne();
    let content = doc.getContent();
    content.key = doc.key;
    response.send(content);
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
}

exports.deleteDocument = async function (request, response, next) {
  
  let connection;
  try {
    let key = request.body.key;
    let collectionName = request.body.collection;
    
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    await collection.find().key(key).remove();
    await connection.commit();
    const docCount = await collection.find().count();
    response.status(200).end((docCount.count).toString());
   
  } catch (e) {
    await connection.rollback();
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
}

//To insert a document

exports.insertDocument = async function (request, response, next) {
  
 
  let connection;
  try {
    let collectionName = request.body.collection;
    let objToInsert = request.body.document;
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const myCollection = await soda.openCollection(collectionName);
    await myCollection.insertOne(objToInsert);
    await connection.commit();
    const docCount = await myCollection.find().count();
    response.status(200).end((docCount.count).toString());
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
}

exports.updateDocument = async function (request, response, next) {
  
  let connection;
  try {
    let key = request.body.key;
    let newDocument = request.body.document;
    let collectionName = request.body.collection;
    console.log(key);
    connection = await oracledb.getConnection();
    const soda = connection.getSodaDatabase();
    const collection = await soda.openCollection(collectionName);
    await collection.find().key(key).replaceOne(newDocument);
    await connection.commit();
    response.status(200).end("updated");
  } catch (e) {
    await connection.rollback();
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
}


