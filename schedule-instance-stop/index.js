const AWS = require("aws-sdk")
const ec2 = new AWS.EC2()

exports.handler = async (event) => {
    let dat
    let instanceId = event.detail["instance-id"]
    
    let params = {
      InstanceIds: [
         instanceId
      ]
     };
        
    await ec2.describeInstances(params, function(err, data) {
        if (err) dat=err
        else     dat=data
    }).promise()
    
    let instanceTags = dat.Reservations[0].Instances[0].Tags
    
    let stopTimeTag = instanceTags.find((tag) => tag.Key == "Type")
    
    if (!stopTimeTag) {
        return "Not found Type key - Instance will not be marked to stop"
    }
    
    let date = new Date()
    date.setHours(date.getHours() + 1)
    
    params = {
        Resources: [instanceId], 
        Tags: [
            {
                Key: "StopTime",
                Value: date.toString()
            }
        ]
    };

     await ec2.createTags(params, function(err, data) {
       if (err) console.log(err, err.stack)
       else     console.log(data)
     }).promise()
     
    
    return params.Tags[0]
}
