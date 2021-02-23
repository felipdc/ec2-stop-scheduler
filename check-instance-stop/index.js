const AWS = require("aws-sdk")
const ec2 = new AWS.EC2()

exports.handler = async (event) => {
    let dat;
    let instanceIdsToStop
    
    await ec2.describeInstances({ }, function(err, data) {
        if (err) dat=err
        else     dat=data
    }).promise();
    
    instanceIdsToStop = dat.Reservations[0].Instances.map((instance) => {
        if (instance.State.Name !== "running") return null
        let tags = instance.Tags
        let tagOfInstanceToStop = tags.find((tag) => tag.Key == "StopTime")
        let dateNow = new Date()
        let dateToStop = new Date(tagOfInstanceToStop.Value);
        if (dateNow > dateToStop) {
            return instance.InstanceId
        } else {
            return null
        }
    })
    
    instanceIdsToStop = instanceIdsToStop.filter(function (el) {
        return el != null
    });

    if (instanceIdsToStop.length > 0) {
        let response;
        let params = {
            InstanceIds: instanceIdsToStop   
        }
        
        await ec2.stopInstances(params, (err, data) => {
            if (err) {
                console.log(err)
                response=err;
            } else {
                console.log("Success", instanceIdsToStop)
                response = "Successfully stopped instances " + instanceIdsToStop
            }
        }).promise()
        
        return response
    }
    
    return "No instances to stop"
};
