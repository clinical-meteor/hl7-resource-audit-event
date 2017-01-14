

// create the object using our BaseModel
AuditEvent = BaseModel.extend();

//Assign a collection so the object knows how to perform CRUD operations
AuditEvent.prototype._collection = AuditEvents;

// Create a persistent data store for addresses to be stored.
// HL7.Resources.Patients = new Mongo.Collection('HL7.Resources.Patients');
AuditEvents = new Mongo.Collection('AuditEvents');

//Add the transform to the collection since Meteor.users is pre-defined by the accounts package
AuditEvents._transform = function (document) {
  return new AuditEvent(document);
};


if (Meteor.isClient){
  Meteor.subscribe('AuditEvents');
}

if (Meteor.isServer){
  Meteor.publish('AuditEvents', function (argument){
    if (this.userId) {
      return AuditEvents.find();
    } else {
      return [];
    }
  });
}



AuditEventSchema = new SimpleSchema({
  'resourceType' : {
    type: String,
    defaultValue: 'AuditEvent'
  }
});
AuditEvents.attachSchema(AuditEventSchema);
