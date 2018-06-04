var mongoClient = require('mongodb').MongoClient,
    config = require('../dist/server/config.json');

mongoClient.connect(config.mongo_conn_str, function (err, db) {
    if (err) {
        console.log(err)
    }
    else {
        console.log('connected to mongodb');
        var entries = db.db('auradata').collection('entries');
        console.log('dropping indexes');
        entries.dropIndex('*');
        console.log('creating indexes');
        entries.createIndex({address: 1});
        entries.createIndex({'data.fullname': 1});
        entries.createIndex({'data.ticker': 1});
        db.close();
        console.log('done creating indexes');
    }
});

