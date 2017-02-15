/**
 * Created by simvolice on 16.02.2017 3:27
 */

const config = require('../utils/config');

const MongoClient = require('mongodb').MongoClient;

const Logger = require('mongodb').Logger;
Logger.setLevel('debug');

const co = require('co');




module.exports = {





    searchCompany: function (searchQuery) {

        return co(function*() {


            // Connection URL
            const db = yield MongoClient.connect(config.urlToMongoDBLinode);


            // Get the collection
            const col = db.collection('users');



            const result = yield col.find({ '$text': {'$search' : searchQuery } }).toArray();



            db.close();

            return result;


        }).catch(function (err) {

            return err;


        });


    },











};