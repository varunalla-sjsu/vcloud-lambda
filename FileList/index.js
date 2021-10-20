var aws = require('aws-sdk');
let docClient=new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // TODO implement
    
    let username=event.requestContext.authorizer.claims["cognito:username"];
    let fileList=await fetchFileList(username);
    const response = {
        statusCode: 200,
        headers:{
                "Access-Control-Allow-Origin" : "https://www.vcloudoc.com", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        }, 
        body: JSON.stringify(fileList),
    };
    return response;
};
let scanItems=async(params)=>{
    try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    return err
  }
}
let fetchFileList=async(username)=>{
    var params = {
        TableName: 'files',
        FilterExpression: "#createdby.#username = :username",
        ExpressionAttributeNames: {
            "#createdby":"createdby",
            "#username": "user"
        },
        ExpressionAttributeValues: {
            ":username": username
        },
        ProjectionExpression:"fileid,description,origFileName,createdby,createdon,updatedon"
    }
    return await scanItems(params);
}