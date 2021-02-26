module.exports = {
    
    // cvgData: {
    //     user: 'SODATEST1',
    //     password: 'oracle',
    //     connectString: '150.136.223.24:1521/testpdb1.sub10041039132.dbseclabvcn.oraclevcn.com',
    //     poolMin: 10,
    //     poolMax: 10,
    //     poolIncrement: 0
    // }
	 cvgData: {
         user: 'sodauser',
         password: 'sodauser2',
         connectString: 'localhost:1521/orcldata',
         poolMin: 10,
         poolMax: 10,
         poolIncrement: 0
	 } 
    ,
    metadata : {
        "keyColumn": {
            "name":"SKU"
        },
        "contentColumn": {
            "name": "JSON_TEXT",
            "sqlType": "CLOB"
        }
    }
}