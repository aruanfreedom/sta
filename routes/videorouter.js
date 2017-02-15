
const express = require('express');
const router = express.Router();
var Busboy = require('busboy');

const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;
const os = require('os');
const path = require('path');

const fs = require('fs');
const config = require('../utils/config');


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function sendToPackager(pathToFile, res) {




    let pathToMPD = fs.mkdtempSync('./public/mpddirectory' + path.sep);







    const mp4Box = spawn(config.pathToMp4Box, ['-dash', '4000', '-rap', '-out', pathToMPD + '/' + path.parse(pathToFile).base, pathToFile]);





    mp4Box.stderr.on('data', (data) => {
        console.log("\x1b[41m", data.toString());
    });



    mp4Box.on('close', (code) => {

        if (code == 0) {


            console.log("\x1b[42m", code);
            return res.json({"code": code});

        }else {

            console.log("\x1b[41m", code);


            return res.json({"code": code});

        }


    });









}


function sendToConvert(pathToFile, res) {
    const pathToTempVideoDir = os.tmpdir() + '\\tmpVideoAdsMe\\';

    let outPutMp4File = pathToTempVideoDir + 'output' + getRandomInt(1, 1000000) + '.mp4';


    const ffmpeg = spawn(config.pathToFFmpegWindows, ['-i', pathToFile, '-codec:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-b:v', '1000k', '-vf', 'scale=-1:720', '-threads', '0', outPutMp4File]);





    ffmpeg.stderr.on('data', (data) => {
       console.log("\x1b[41m", data.toString());
    });



    ffmpeg.on('close', (code) => {

        if (code == 0) {


            sendToPackager(outPutMp4File, res);



        }else {

            console.log("\x1b[41m", code);


            return res.json({"code": code});

        }


    });






}





function returnHeightVideo(arrStreams) {

    for (let i = 0; i < arrStreams.length; i++) {

        if (arrStreams[i].height !== undefined) {

            return arrStreams[i].height;

        }




    }


}


function checkHeightAndFormatOfFiles(pathToFile, res) {


    var tempObjForResult = null;
    var tempStrForJSON = '';
    const ffprobe = spawn(config.pathToFFprobeWindows, ['-print_format', 'json', '-show_entries', 'stream=height,codec_name,codec_type', '-show_entries', 'format=format_name', pathToFile]);

    ffprobe.stdout.on('data', function (data) {

        tempStrForJSON += data;

    });





    ffprobe.stdout.on('close', (code) => {

        tempObjForResult = JSON.parse(tempStrForJSON);




        if (Object.keys(tempObjForResult).length == 0) {


           return res.json({"code": "noThisVideo"});

        } else if (tempObjForResult.format.format_name == 'mov,mp4,m4a,3gp,3g2,mj2'){



            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});



            } else {



                return res.json({"code": "noHeightVideo"});


            }











        } else if (tempObjForResult.format.format_name == 'avi'){


            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});




            } else {



                return res.json({"code": "noHeightVideo"});


            }







        }else if (tempObjForResult.format.format_name == 'asf'){



            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});




            } else {



                return res.json({"code": "noHeightVideo"});


            }






        }else if (tempObjForResult.format.format_name == 'flv'){



            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});




            } else {



                return res.json({"code": "noHeightVideo"});


            }






        }else if (tempObjForResult.format.format_name == 'matroska,webm'){



            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});




            } else {



                return res.json({"code": "noHeightVideo"});


            }






        }else if (tempObjForResult.format.format_name == 'mpeg'){


            if (returnHeightVideo(tempObjForResult.streams) >= 720) {



                return res.json({"code": "Success"});




            } else {



                return res.json({"code": "noHeightVideo"});


            }







        }else {




            return res.json({"code": "noThisVideo"});




        }






    });





}



function uploadFile(req, res, sizeFile) {


    //TODO необходимо потом реализовать очистку этой папки, по окончании ковертации.
    const pathToTempVideoDir = os.tmpdir() + '/tmpVideoAdsMe';
    var saveTo = '';
    var busboy = new Busboy({ headers: req.headers, limits: {fileSize: sizeFile} });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        saveTo = path.join(pathToTempVideoDir, path.basename(getRandomInt(1, 1000000) + filename));
        file.pipe(fs.createWriteStream(saveTo));
    });


    busboy.on('finish', function() {

        if (req.get('sizeFile') == 'partFile') {

            checkHeightAndFormatOfFiles(saveTo, res);



        } else if (req.get('sizeFile') == 'fullFile'){


            sendToConvert(saveTo, res);


        } else {


           return res.json({"code": "sizeFileHeaderError"});



        }


    });
    return req.pipe(busboy);



}


router.post('/addvideo', function(req, res, next){



    let lengthMaxVideo = Math.pow(10, 8);
    let lengthChunckVideo = 6400;




    if (req.headers['content-length'] > lengthMaxVideo || req.headers['content-length'] < lengthChunckVideo) {


        res.json({"code": "lengthVideoError"});


    } else if (req.get('sizeFile') == 'partFile'){




        uploadFile(req, res, lengthChunckVideo);





    } else if (req.get('sizeFile') == 'fullFile'){


        uploadFile(req, res, lengthMaxVideo);



    } else {



        res.json({"code": "sizeFileHeaderError"});



    }












});

module.exports = router;