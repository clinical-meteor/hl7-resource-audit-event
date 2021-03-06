## clinical:hl7-resource-audit-event

#### Licensing  

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)


#### Integration & Verification Tests  

[![CircleCI](https://circleci.com/gh/clinical-meteor/hl7-resource-audit-event/tree/master.svg?style=svg)](https://circleci.com/gh/clinical-meteor/hl7-resource-audit-event/tree/master)


#### API Reference  

This package implements the FHIR List resource schema provided at [https://www.hl7.org/fhir/DSTU2/auditevent.html](https://www.hl7.org/fhir/DSTU2/auditevent.html).


#### Installation  

````bash
# to add hl7 resource schemas and rest routes
meteor add clinical:hl7-resource-audit-event

# to initialize default data
INITIALIZE=true meteor
````

You may also wish to install the `autopublish` package, which will set up a default publication/subscription of the AuditEvents collection for logged in users.  You will need to remove the package before going into production, however.

```bash
meteor add clinical:autopublish  
```


#### Example    
For more examples, see [https://www.hl7.org/fhir/auditevent-examples.html](https://www.hl7.org/fhir/auditevent-examples.html).

```js
var newAuditEvent = {
  "resourceType": "AuditEvent",
  "type": {
    "system": "http://dicom.nema.org/resources/ontology/DCM",
    "code": "110100",
    "display": "Application Activity"
  },
  "subtype": [
    {
      "system": "http://dicom.nema.org/resources/ontology/DCM",
      "code": "110120",
      "display": "Application Start"
    }
  ],
  "action": "E",
  "recorded": "2012-10-25T22:04:27+11:00",
  "outcome": "0",
  "agent": [
    {
      "role": [
        {
          "coding": [
            {
              "system": "http://dicom.nema.org/resources/ontology/DCM",
              "code": "110153",
              "display": "Source Role ID"
            }
          ]
        }
      ],
      "userId": {
        "value": "2.16.840.1.113883.4.2|2.16.840.1.113883.4.2"
      },
      "altId": "6580",
      "requestor": false,
      "network": {
        "address": "Workstation1.ehr.familyclinic.com",
        "type": "1"
      }
    }
  ],
  "source": {
    "site": "Development",
    "identifier": {
      "value": "Grahame's Laptop"
    },
    "type": [
      {
        "system": "http://dicom.nema.org/resources/ontology/DCM",
        "code": "110122",
        "display": "Login"
      }
    ]
  },
  "entity": []
};
AuditEvents.insert(newAuditEvent);
```


#### Extending the Schema  

If you have extra fields that you would like to attach to the schema, extend the schema like so:  

```js
ExtendedAuditEventSchema = new SimpleSchema([
  AuditEventSchema,
  {
    "createdAt": {
      "type": Date,
      "optional": true
    }
  }
]);
AuditEvents.attachSchema( ExtendedAuditEventSchema );
```


#### Initialize a Sample AuditEvent  

Call the `initializeAuditEvent` method to create a sample patient in the AuditEvents collection.

```js
Meteor.startup(function(){
  Meteor.call('initializeAuditEvent');
})
```


#### Server Methods  

This package supports `createAuditEvent`, `initializeAuditEvent`, and `dropAuditEvent` methods.


#### REST API Points    

This package supports the following REST API endpoints.  All endpoints require an OAuth token.  

```
GET    /fhir-1.6.0/AuditEvent/:id    
GET    /fhir-1.6.0/AuditEvent/:id/_history  
PUT    /fhir-1.6.0/AuditEvent/:id  
GET    /fhir-1.6.0/AuditEvent  
POST   /fhir-1.6.0/AuditEvent/:param  
POST   /fhir-1.6.0/AuditEvent  
DELETE /fhir-1.6.0/AuditEvent/:id
```

If you would like to test the REST API without the OAuth infrastructure, launch the app with the `NOAUTH` environment variable, or set `Meteor.settings.private.disableOauth` to true in you settings file.

```bash
NOAUTH=true meteor
```

#### Conformance Statement  

This package conforms to version `FHIR 3.0.0`, as per the Touchstone testing utility.  

![https://raw.githubusercontent.com/clinical-meteor/hl7-resource-audit-event/master/screenshots/Touchstone-ClientAssignedIds.png](https://raw.githubusercontent.com/clinical-meteor/hl7-resource-audit-event/master/screenshots/Touchstone-ClientAssignedIds.png)  

![https://raw.githubusercontent.com/clinical-meteor/hl7-resource-audit-event/master/screenshots/Touchstone-ServerAssignedIds.png](https://raw.githubusercontent.com/clinical-meteor/hl7-resource-audit-event/master/screenshots/Touchstone-ServerAssignedIds.png)  


#### Utilities  

If you're working with HL7 FHIR Resources, we recommend using [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en).


#### Licensing  

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
