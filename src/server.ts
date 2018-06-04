const fs = require('fs');

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import * as mongodb from 'mongodb';


declare var require: any
declare var global: any

const MAX_MESSAGE_LENGTH = 3500;

let Web3 = require('web3');
let config: any = require('./config.json');
let logger: any = require('simple-node-logger');

var web3 = new Web3();

let mongoClient = mongodb.MongoClient;

var logDir = config.log_dir || './AuraDataLogs';

if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

const loggerOptions= {
    errorEventName:'error',
    logDirectory: logDir, 
    fileNamePattern:'roll-<DATE>.log',
    dateFormat:'YYYY.MM.DD'
};
const log = logger.createRollingFileLogger(loggerOptions);
log.info('server started');

const app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.cors);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

function logErr(err) {
    console.log(typeof err);
    console.log(err);
    log.warn(err);
}

//get db collection
var entries;
mongoClient.connect(config.mongo_conn_str, function (err, db) {
    if (err) {
        console.log(err)
    }
    else {
        entries = db.db('auradata').collection('entries');
        console.log('connected to mongo auradata db');
    }
});

//define routes
app.route('/get/:address').get( function(req, res) {
    getEntry(req.params.address, function(err, r) { handleResult (err, r, res); });
});

function getEntry(address: string, f: (e, r) => void): void {
    address = address.toLowerCase();
    if(address.startsWith('0x'))
    address = address.substr(2); 
    entries.find({address: address}).next(f);
}

function compare(a,b) {
    if (a.timestamp < b.timestamp)
        return -1;
    if (a.timestamp > b.timestamp)
        return 1;
    return 0;
}

app.route('/put/:address').put(function(req, res) {
    var data = req.body;
    if(!data) {
        res.send('No stock data was sent');
        return;
    }
    var message = getMessage(data);
    if(web3.eth.accounts.recover(message, data.sig) == req.params.address)
    {
        getEntry(req.params.address, (e, r) => {
            if(e) return err(e, res); 
            if(r) {
                if(r.data.timestamp < data.timestamp) {
                    entries.update({_id: r._id}, {$set: {data: data}}, (ee, rr) => {
                        if(ee) return err(ee, res);
                        res.json('ok');
                    }); 
                }
                else
                    res.send('invalid timestamp');
            } else {
                entries.insert({address: req.params.address, data: data}, (ee, rr) => {
                    if(ee) return err(ee, res);
                    res.json('ok');
                });
            }
        });
    } else {
        res.send('Invalid signature');
    }
});

function getMessage(data: any): string {
    return [data.img, data.fullname, data.ticker, data.bio, data.timestamp].join('');
}

function err(e, res) {
    log.warn(e);
    console.log(e);
    res.send(e);
}

function handleResult(er, rows, res) {
    if(er) {
        err(er, res);
    }  else {
        res.json(rows);
    }
}

//start our server
app.listen(config.listening_port, () => {
    console.log('Server started');
});
