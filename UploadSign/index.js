const AWS = require('aws-sdk')
const {v4 : uuidv4} = require('uuid')
const moment=require('moment');
const path = require('path')

AWS.config.update({
    accessKeyId: process.env.KEY_ID, // Generated on step 1
    secretAccessKey:process.env.ACCESS_SECRET , // Generated on step 1
    region: process.env.BUCKET_REGION, // Must be the same as your bucket
    signatureVersion: 'v4'
});
let generateNewFileName=function(filename){
    let ndate=moment().format('sss-mm-hh-YYYY-DD-MM');
    return ndate+'-'+uuidv4()+"-"+filename;
}
const getUploadURL = async (fileName,contentType,username,description,isUpdate) => {
  let gFileName=generateNewFileName(fileName);
 
  const s3Params = {
      Bucket: 'privatedocstore',
      Key: !isUpdate?'files/'+gFileName:fileName,
      Expires: 60*30, // 30 minutes
      ContentType: contentType,
     // ContentDisposition: 'attachment; filename="'+fileName+'"',
      Metadata:{
          user:username,
          fileName:fileName
      }
  };
  if(!isUpdate)
    s3Params.Metadata.description=description;
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'us-east-1', // same as your bucket
    endpoint: new AWS.Endpoint(process.env.AWS_S3_SITE),    useAccelerateEndpoint: true  });    
  try {
      const presinedUrl =  await s3.getSignedUrl('putObject', s3Params);
      console.log('signed url', presinedUrl);
      return presinedUrl;
  } catch (error) {
      console.log('error',error);
      throw error;
  }
}
exports.handler = async (event, context, callback) => {
    console.log(event.body);
    console.log('full event',JSON.stringify(event));
    let body=JSON.parse(event.body);
   const fileName = body["filename"];
   const contentType =body["contentType"];
   const description=body["description"];
   const isUpdate=body["isUpdate"];
   
   const username=event.requestContext.authorizer.claims["cognito:username"];
   
    const response = {
        statusCode: 200,
        headers: {
                "Access-Control-Allow-Origin" : "https://www.vcloudoc.com", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        } 
    };
    try{
        console.log('before request',fileName,contentType,username,description,isUpdate);
        let signedUrl = await getUploadURL(fileName,contentType,username,description,isUpdate);
        response.body=JSON.stringify({'url':signedUrl,fileName:fileName});
    }
    catch(err){
        console.log(err);
        response.statusCode=503;
        response.body=JSON.stringify({'status':'error'});
    }
    return response;
};