/**
 * Created by simvolice on 16.02.2017 23:02
 */


const config = require('../utils/config');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const Logger = require('mongodb').Logger;
Logger.setLevel('debug');

const co = require('co');




module.exports = {





    addVideoToSchedulling: function (objParams) {

        return co(function*() {


            // Connection URL
            const db = yield MongoClient.connect(config.urlToMongoDBLinode);


            // Get the collection
            const col = db.collection('schedulling');



            const result = yield col.insertOne({

                userId: ObjectId(objParams.userId),
                videoId: ObjectId(objParams.videoId),
                dateOfShowVideo: objParams.dateOfShowVideo,
                timeRangeOfShowVideo: objParams.timeRangeOfShowVideo





            });



            db.close();

            return result;


        }).catch(function (err) {

            return err;


        });


    },



    getVideosScheduler: function (objParams) {



        return co(function*() {


            // Connection URL
            const db = yield MongoClient.connect(config.urlToMongoDBLinode);


            // Get the collection
            const col = db.collection('schedulling');




            const result = yield col.find({userId: ObjectId(objParams.userId), dateOfShowVideo: objParams.dateOfShowVide}).toArray();




            db.close();

            return result;


        }).catch(function (err) {

            return err;


        });





    },


    getallvideoforscreenholder: function (userId) {



        return co(function*() {



            const db = yield MongoClient.connect(config.urlToMongoDBLinode);


            // Get the collection
            const col = db.collection('schedulling');

            const result = yield   col.aggregate(
                [ { '$match': { "userId": ObjectId(userId) } },
                    { '$lookup': {
                        'from': "video",
                        'localField': "videoId",
                        'foreignField': "_id",
                        'as': "video_url"
                    }},

                    { '$project' : {


                        'timeRangeOfShowVideo': 0,
                        'dateOfShowVideo': 0,
                        'videoId': 0,
                        'userId': 0,
                        'video_url' : 1,

                        "video_url": { "_id": 0}



                }},

                    { '$unwind': '$video_url'},







                ]).toArray();



            db.close();

            return result;


        }).catch(function (err) {



            return err;


        });





    },



    deleteOneSchedullingVideo: function (objParams) {


        return co(function*() {


            // Connection URL
            const db = yield MongoClient.connect(config.urlToMongoDBLinode);


            // Get the collection
            const col = db.collection('schedulling');

            const result = yield col.deleteOne({_id: ObjectId(objParams.videoSchedullingId), userId: ObjectId(objParams.userId)});



            db.close();

            return result;


        }).catch(function (err) {

            return err;


        });



    }








};