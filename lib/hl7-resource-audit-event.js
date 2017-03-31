

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




AuditEventSchema = new SimpleSchema([
  BaseSchema,
  DomainResourceSchema,
  {
  'resourceType' : {
    type: String,
    defaultValue: 'AuditEvent'
  },
  "type" : {
    optional: true,
    type: CodingSchema
  },
  "subtype" : {
    optional: true,
    type: [ CodingSchema ]
  },
  "action" : {
    optional: true,
    type: String
  },
  "recorded" : {
    optional: true,
    type: Date
  },
  "outcome" : {
    optional: true,
    type: String
  },
  "outcomeDesc" : {
    optional: true,
    type: String
  },
  "purposeOfEvent" : {
    optional: true,
    type: [ CodeableConcept ]
  },
  "agent.$.role" : {
    optional: true,
    type: [ CodeableConcept ]
  },
  "agent.$.reference" : {
    optional: true,
    type: Reference
  },
  "agent.$.userId" : {
    optional: true,
    type: IdentifierSchema
  },
  "agent.$.altId" : {
    optional: true,
    type: String
  },
  "agent.$.name" : {
    optional: true,
    type: String
  },
  "agent.$.requestor" : {
    optional: true,
    type: Boolean
  },
  "agent.$.location" : {
    optional: true,
    type: Reference
  },
  "agent.$.policy" : {
    optional: true,
    type: [ String ]
  },
  "agent.$.media" : {
    optional: true,
    type: Coding
  },
  "agent.$..network.address" : {
    optional: true,
    type: String
  },
  "agent.$..network.type" : {
    optional: true,
    type: String
  },
  "agent.$.purposeOfUse" : {
    optional: true,
    type: [ CodeableConcept ]
  },
  "source.site" : {
    optional: true,
    type: String
  },
  "source.identifier" : {
    optional: true,
    type: IdentifierSchema
  },
  "source.type" : {
    optional: true,
    type: [ CodingSchema ]
  },
  "entity.$.identifier" : {
    optional: true,
    type: IdentifierSchema
  },
  "entity.$.reference" : {
    optional: true,
    type: ReferenceSchema
  },
  "entity.$.type" : {
    optional: true,
    type: CodingSchema
  },
  "entity.$.role" : {
    optional: true,
    type: CodeableConcept
  },
  "entity.$.lifecycle" : {
    optional: true,
    type: CodingSchema
  },
  "entity.$.securityLabel" : {
    optional: true,
    type: [ CodeableConcept ]
  },
  "entity.$.name" : {
    optional: true,
    type: String
  },
  "entity.$.description" : {
    optional: true,
    type: String
  },
  "entity.$.query" : {
    optional: true,
    blackbox: true,
    type: Object
  },
  "entity.$.detail.$.type" : {
    optional: true,
    type: String
  },
  "entity.$.detail.$.value" : {
    optional: true,
    blackbox: true,
    type: Object
  }
}]);
AuditEvents.attachSchema(AuditEventSchema);







//==============================================================================


/**
 * @summary The displayed name of the auditEvent.
 * @memberOf AuditEvent
 * @name displayName
 * @version 1.2.3
 * @returns {Boolean}
 * @example
 * ```js
 * ```
 */

AuditEvent.prototype.toString = function () {
  return '';
};





//=================================================================


AuditEvents.fetchBundle = function (query, parameters, callback) {
  var auditEventArray = AuditEvents.find(query, parameters, callback).map(function(auditEvent){
    auditEvent.id = auditEvent._id;
    delete auditEvent._document;
    return auditEvent;
  });

  // console.log("auditEventArray", auditEventArray);

  var result = Bundle.generate(auditEventArray);

  // console.log("result", result.entry[0]);

  return result;
};


/**
 * @summary This function takes a FHIR resource and prepares it for storage in Mongo.
 * @memberOf AuditEvents
 * @name toMongo
 * @version 1.6.0
 * @returns { AuditEvent }
 * @example
 * ```js
 *  let auditEvents = AuditEvents.toMongo('12345').fetch();
 * ```
 */

AuditEvents.toMongo = function (originalAuditEvent) {
  var mongoRecord;

  // if (originalAuditEvent.identifier) {
  //   originalAuditEvent.identifier.forEach(function(identifier){
  //     if (identifier.period) {
  //       if (identifier.period.start) {
  //         var startArray = identifier.period.start.split('-');
  //         identifier.period.start = new Date(startArray[0], startArray[1] - 1, startArray[2]);
  //       }
  //       if (identifier.period.end) {
  //         var endArray = identifier.period.end.split('-');
  //         identifier.period.end = new Date(startArray[0], startArray[1] - 1, startArray[2]);
  //       }
  //     }
  //   });
  // }

  return originalAuditEvent;
};


/**
 * @summary Similar to toMongo(), this function prepares a FHIR record for storage in the Mongo database.  The difference being, that this assumes there is already an existing record.
 * @memberOf AuditEvents
 * @name prepForUpdate
 * @version 1.6.0
 * @returns { Object }
 * @example
 * ```js
 *  let auditEvents = AuditEvents.findMrn('12345').fetch();
 * ```
 */

AuditEvents.prepForUpdate = function (auditEvent) {

  if (auditEvent.name && auditEvent.name[0]) {
    //console.log("auditEvent.name", auditEvent.name);

    auditEvent.name.forEach(function(name){
      name.resourceType = "HumanName";
    });
  }

  if (auditEvent.telecom && auditEvent.telecom[0]) {
    //console.log("auditEvent.telecom", auditEvent.telecom);
    auditEvent.telecom.forEach(function(telecom){
      telecom.resourceType = "ContactPoint";
    });
  }

  if (auditEvent.address && auditEvent.address[0]) {
    //console.log("auditEvent.address", auditEvent.address);
    auditEvent.address.forEach(function(address){
      address.resourceType = "Address";
    });
  }

  if (auditEvent.contact && auditEvent.contact[0]) {
    //console.log("auditEvent.contact", auditEvent.contact);

    auditEvent.contact.forEach(function(contact){
      if (contact.name) {
        contact.name.resourceType = "HumanName";
      }

      if (contact.telecom && contact.telecom[0]) {
        contact.telecom.forEach(function(telecom){
          telecom.resourceType = "ContactPoint";
        });
      }

    });
  }

  return auditEvent;
};


/**
 * @summary Scrubbing the auditEvent; make sure it conforms to v1.6.0
 * @memberOf AuditEvents
 * @name scrub
 * @version 1.2.3
 * @returns {Boolean}
 * @example
 * ```js
 *  let auditEvents = AuditEvents.findMrn('12345').fetch();
 * ```
 */

AuditEvents.prepForFhirTransfer = function (auditEvent) {
  //console.log("AuditEvents.prepForBundle()");


  // FHIR has complicated and unusual rules about dates in order
  // to support situations where a family member might report on a auditEvent's
  // date of birth, but not know the year of birth; and the other way around
  if (auditEvent.birthDate) {
    auditEvent.birthDate = moment(auditEvent.birthDate).format("YYYY-MM-DD");
  }


  if (auditEvent.name && auditEvent.name[0]) {
    //console.log("auditEvent.name", auditEvent.name);

    auditEvent.name.forEach(function(name){
      delete name.resourceType;
    });
  }

  if (auditEvent.telecom && auditEvent.telecom[0]) {
    //console.log("auditEvent.telecom", auditEvent.telecom);
    auditEvent.telecom.forEach(function(telecom){
      delete telecom.resourceType;
    });
  }

  if (auditEvent.address && auditEvent.address[0]) {
    //console.log("auditEvent.address", auditEvent.address);
    auditEvent.address.forEach(function(address){
      delete address.resourceType;
    });
  }

  if (auditEvent.contact && auditEvent.contact[0]) {
    //console.log("auditEvent.contact", auditEvent.contact);

    auditEvent.contact.forEach(function(contact){

      console.log("contact", contact);


      if (contact.name && contact.name.resourceType) {
        //console.log("auditEvent.contact.name", contact.name);
        delete contact.name.resourceType;
      }

      if (contact.telecom && contact.telecom[0]) {
        contact.telecom.forEach(function(telecom){
          delete telecom.resourceType;
        });
      }

    });
  }

  //console.log("AuditEvents.prepForBundle()", auditEvent);

  return auditEvent;
};

/**
 * @summary The displayed name of the auditEvent.
 * @memberOf AuditEvent
 * @name displayName
 * @version 1.2.3
 * @returns {Boolean}
 * @example
 * ```js
 * ```
 */

AuditEvent.prototype.displayName = function () {
  if (this.name && this.name[0]) {
    return this.name[0].text;
  }
};
