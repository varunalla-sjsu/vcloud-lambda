const AWS = require('aws-sdk');
let keyPairId=process.env.KEY_ID;
let privateKey=process.env.KEY_ACCESS;
let signer=new AWS.CloudFront.Signer(keyPairId,privateKey);
exports.handler = async (event) => {
    const response = {
        statusCode: 200,headers: {
    "Access-Control-Allow-Origin" : "https://www.vcloudoc.com", // Required for CORS support to work
    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
    },
        body: JSON.stringify({"Status":"Error"})
    };
    // TODO implement
    let body=JSON.parse(event.body);
    let fileUrl= body.fileName;
    try{
        let presignedUrl=signedSDK(fileUrl);
       response.body=JSON.stringify( {fileUrl:presignedUrl});
    }
    catch(Err){
        console.log('Presign Error: ',Err);
    }
    
    return response;
};
let signedSDK=(fileUrl)=>{
    const time = 5*60*1000;
    const signedUrl = signer.getSignedUrl({
            url: 'https://www.vcloudoc.com/'+fileUrl,
            expires: Math.floor((Date.now() + time)/1000), // 5 min
    });
    console.log(signedUrl);
    return signedUrl;
}
