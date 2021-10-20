var aws = require('aws-sdk');
let docClient=new aws.DynamoDB.DocumentClient();
async function getItem(params){
  try {
    const data = await docClient.query(params).promise();
    return data.Items[0];
  } catch (err) {
    return err
  }
}
exports.handler = async (event) => {
    console.log(event.requestContext.authorizer.claims);
    const response = {
        statusCode: 200,
         headers: {
            "Access-Control-Allow-Origin" : "https://www.vcloudoc.com", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        } 
    };
    let username=event.requestContext.authorizer.claims["cognito:username"];
    var params = {
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
    console.log(params);
    // Call DynamoDB to read the item from the table
    try{
        let user=await getItem(params);
        console.log("Success", user);
        response.body=JSON.stringify(user);
    }
    catch(Err){
        console.log("Error", Err);
        response.status=503;
        response.body=JSON.stringify(Err);
    }
    return response;
};
