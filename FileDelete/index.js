var aws = require('aws-sdk');
let docClient=new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,headers: {
    "Access-Control-Allow-Origin" : "https://www.vcloudoc.com", // Required for CORS support to work
    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
    }
    };
    console.log(event);
    let body=JSON.parse(event.body);
    const fileName = body.fileName;
    const username=event.requestContext.authorizer.claims["cognito:username"];
    try{
        let user=await getUserInfo(username);
        let isMatch=await checkFileAccess(fileName,user);
        console.log(isMatch);
        if(isMatch){
            await deleteFile(fileName);
            console.log('file'+fileName+' is deleted');
            response.body=JSON.stringify({"status":"File Found for user"});
        }
        else{
            response.body=JSON.stringify({"status":"Forbidden"});
        }
    }
    catch(Err){
        console.log(Err);
        response.body=JSON.stringify({"status":"Internal Error"});
    }
    return response;
};
let checkFileAccess=async(fileName,user)=>{
    //check filetable and check if username matches
    try{
       let file= await fetchFile(fileName);
       console.log(file);
       if(user.Role==2||file?.createdby==user.username)
            return true;   
    }
    catch(Err){
        console.log(Err);
    }
    return false;
}
let deleteFile=async(fileName)=>{
    //delete from s3, trigger metadata remove
    let params = {  Bucket: 'privatedocstore', Key: fileName };

    return await s3.deleteObject(params).promise();
}
let getItem=async(params)=>{
    try {
    const data = await docClient.query(params).promise();
    return data;
  } catch (err) {
    return err
  }
}
let fetchFile=async(fileid)=>{
    var params = {
        TableName: 'files',
        KeyConditionExpression: "#fileid = :fileid",
        ExpressionAttributeNames: {
            "#fileid":"fileid"
        },
        ExpressionAttributeValues: {
            ":fileid":fileid
        }
    }
    return await getItem(params);
}
async function getUserInfo(username){
    let params = {
        TableName: 'users',
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
            "#username": "username"
        },
        ExpressionAttributeValues: {
                ":username": username
        },
        Limit:1
    };
    let user=await getItem(params);
    console.log(user);
    return user;
}