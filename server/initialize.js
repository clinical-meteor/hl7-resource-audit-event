// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
    if (AuditEvents.find().count() === 0) {
      Meteor.call('initializeEventLog')
    }
});


Meteor.methods({
  initializeEventLog: function(){
    console.log('No AuditEvents found.  Initializing the HIPAA Audit Event Log.');

      var initializeEvent = {
        "resourceType" : "AuditEvent",
        "action" : "System Initialization", // Type of action performed during the event
        "recorded" : new Date(), // R!  Time when the event occurred on source
        "outcome" : "Success", // Whether the event succeeded or failed
        "outcomeDesc" : "System Initialized", // Description of the event outcome
        "agent" : [{ // R!  Actor involved in the event
          "altId" : "System", // Alternative User id e.g. authentication
          "name" : "System", // Human-meaningful name for the agent
          "requestor" : false
        }],
        "source" : { // R!  Audit Event Reporter
          "site" : Meteor.absoluteUrl(), // Logical source location within the enterprise
        }
      }
      
      console.log('initializeEvent', initializeEvent)
      // console.log('AuditEventSchema', AuditEventSchema)

      let auditEventValidator = AuditEventSchema.newContext()

      auditEventValidator.validate(initializeEvent);

      console.log('IsValid: ', auditEventValidator.isValid())
      console.log('ValidationErrors: ', auditEventValidator.validationErrors());
      console.log('AuditEvents.find().count()', AuditEvents.find().count());

      console.log('initializeEvent', initializeEvent)

      AuditEvents.insert(initializeEvent, {validate: true}, function(error, result){
        if(error) console.error('error.invalidKeys', error.invalidKeys)
        if(result) console.error(result)
      })
  }
})