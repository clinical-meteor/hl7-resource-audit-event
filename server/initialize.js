import { get } from 'lodash';


Meteor.methods({
  initializeEventLog: function(){

    if (AuditEvents.find().count() === 0) {
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
      };
      
      console.log('AuditLog:  System Initialization')
      process.env.DEBUG && console.log('AuditLog.initializeEvent', initializeEvent)

      let auditEventValidator = AuditEventSchema.newContext()

      auditEventValidator.validate(initializeEvent);

      // console.log('IsValid: ', auditEventValidator.isValid())
      // console.log('ValidationErrors: ', auditEventValidator.validationErrors());
      // console.log('AuditEvents.find().count()', AuditEvents.find().count());

      console.log('initializeEvent', initializeEvent)
      process.env.DEBUG && console.log('AuditLog.initializeEvent.validated', initializeEvent)

      AuditEvents.insert(initializeEvent, {validate: get(Meteor, 'settings.public.defaults.schemas.validate', false)}, function(error, result){
        if(error) console.error('error.invalidKeys', error.invalidKeys)
        if(result) console.error(result)
      })
    } else {
      console.log('Events found in AuditLog.  No need to initialize.');
     }
  }
})

