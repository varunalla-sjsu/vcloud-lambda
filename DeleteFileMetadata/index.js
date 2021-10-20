
console.log('Loading Delete function');
        
const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
let docClient=new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    
    console.log(event);
    for(let i=0;i<event.Records.length;i++){
        try{
                let record = event.Records[i];
                console.log(record);
                await deleteMetadata(record.s3.object.key);
                callback(null, 'document delete synced '+record.s3.object.key);
        }
        catch(err){
            console.log('document delete sync Failed',err);
            callback(null, 'document delete synced Failed '+JSON.stringify(err));
        }
    }

};
let deleteMetadata=async(fileid)=>{
    let params={
    TableName: "files", 
        Key : {
            "fileid": fileid
        }
    };
   return await docClient.delete(params).promise();
}
