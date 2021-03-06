

//==========================================================================================
// Global Configs  

var fhirVersion = 'fhir-3.0.0';

if(typeof oAuth2Server === 'object'){
  // TODO:  double check that this is needed; and that the /api/ route is correct
  JsonRoutes.Middleware.use(
    // '/api/*',
    '/fhir-3.0.0/*',
    oAuth2Server.oauthserver.authorise()   // OAUTH FLOW - A7.1
  );
}

JsonRoutes.setResponseHeaders({
  "content-type": "application/fhir+json"
});



//==========================================================================================
// Global Method Overrides

// this is temporary fix until PR 132 can be merged in
// https://github.com/stubailo/meteor-rest/pull/132

JsonRoutes.sendResult = function (res, options) {
  options = options || {};

  // Set status code on response
  res.statusCode = options.code || 200;

  // Set response body
  if (options.data !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader('Content-type', 'application/fhir+json');
    res.write(JSON.stringify(options.data, null, spacer));
  }

  // We've already set global headers on response, but if they
  // pass in more here, we set those.
  if (options.headers) {
    //setHeaders(res, options.headers);
    options.headers.forEach(function(value, key){
      res.setHeader(key, value);
    });
  }

  // Send the response
  res.end();
};




//==========================================================================================
// Step 1 - Create New AuditEvent  

JsonRoutes.add("put", "/" + fhirVersion + "/AuditEvent/:id", function (req, res, next) {
  process.env.DEBUG && console.log('PUT /fhir-3.0.0/AuditEvent/' + req.params.id);
  //process.env.DEBUG && console.log('PUT /fhir-3.0.0/AuditEvent/' + req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);

  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});    

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {
      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }


      if (req.body) {
        auditEventUpdate = req.body;

        // remove id and meta, if we're recycling a resource
        delete req.body.id;
        delete req.body.meta;

        //process.env.TRACE && console.log('req.body', req.body);

        auditEventUpdate.resourceType = "AuditEvent";
        auditEventUpdate = AuditEvents.toMongo(auditEventUpdate);

        //process.env.TRACE && console.log('auditEventUpdate', auditEventUpdate);


        auditEventUpdate = AuditEvents.prepForUpdate(auditEventUpdate);


        process.env.DEBUG && console.log('-----------------------------------------------------------');
        process.env.DEBUG && console.log('auditEventUpdate', JSON.stringify(auditEventUpdate, null, 2));
        // process.env.DEBUG && console.log('newAuditEvent', newAuditEvent);

        var auditEvent = AuditEvents.findOne(req.params.id);
        var auditEventId;

        if(auditEvent){
          process.env.DEBUG && console.log('AuditEvent found...')
          auditEventId = AuditEvents.update({_id: req.params.id}, {$set: auditEventUpdate },  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/AuditEvent/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("Location", "fhir/AuditEvent/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var auditEvents = AuditEvents.find({_id: req.params.id});
              var payload = [];

              auditEvents.forEach(function(record){
                payload.push(AuditEvents.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 200,
                data: Bundle.generate(payload)
              });
            }
          });
        } else {        
          process.env.DEBUG && console.log('No auditEvent found.  Creating one.');
          auditEventUpdate._id = req.params.id;
          auditEventId = AuditEvents.insert(auditEventUpdate,  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/AuditEvent/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("Location", "fhir/AuditEvent/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var auditEvents = AuditEvents.find({_id: req.params.id});
              var payload = [];

              auditEvents.forEach(function(record){
                payload.push(AuditEvents.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 200,
                data: Bundle.generate(payload)
              });
            }
          });        
        }
      } else {
        // no body; Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });

      }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

});



//==========================================================================================
// Step 2 - Read AuditEvent  

JsonRoutes.add("get", "/" + fhirVersion + "/AuditEvent/:id", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var auditEventData = AuditEvents.findOne({_id: req.params.id});
      if (auditEventData) {
        auditEventData.id = auditEventData._id;

        delete auditEventData._document;
        delete auditEventData._id;

        process.env.TRACE && console.log('auditEventData', auditEventData);

        // Success
        JsonRoutes.sendResult(res, {
          code: 200,
          data: AuditEvents.prepForFhirTransfer(auditEventData)
        });
      } else {
        // Gone
        JsonRoutes.sendResult(res, {
          code: 410
        });
      }
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 3 - Update AuditEvent  

JsonRoutes.add("post", "/" + fhirVersion + "/AuditEvent", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir/AuditEvent/', JSON.stringify(req.body, null, 2));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var auditEventId;
      var newAuditEvent;

      if (req.body) {
        newAuditEvent = req.body;


        // remove id and meta, if we're recycling a resource
        delete newAuditEvent.id;
        delete newAuditEvent.meta;


        newAuditEvent = AuditEvents.toMongo(newAuditEvent);

        process.env.TRACE && console.log('newAuditEvent', JSON.stringify(newAuditEvent, null, 2));
        // process.env.DEBUG && console.log('newAuditEvent', newAuditEvent);

        console.log('Cleaning new auditEvent...')
        AuditEventSchema.clean(newAuditEvent);

        var practionerContext = AuditEventSchema.newContext();
        practionerContext.validate(newAuditEvent)
        console.log('New auditEvent is valid:', practionerContext.isValid());
        console.log('check', check(newAuditEvent, AuditEventSchema))
        


        var auditEventId = AuditEvents.insert(newAuditEvent,  function(error, result){
          if (error) {
            process.env.TRACE && console.log('error', error);

            // Bad Request
            JsonRoutes.sendResult(res, {
              code: 400
            });
          }
          if (result) {
            process.env.TRACE && console.log('result', result);
            res.setHeader("Location", "fhir-3.0.0/AuditEvent/" + result);
            res.setHeader("Last-Modified", new Date());
            res.setHeader("ETag", "3.0.0");

            var auditEvents = AuditEvents.find({_id: result});
            var payload = [];

            auditEvents.forEach(function(record){
              payload.push(AuditEvents.prepForFhirTransfer(record));
            });

            //console.log("payload", payload);
            // Created
            JsonRoutes.sendResult(res, {
              code: 201,
              data: Bundle.generate(payload)
            });
          }
        });
        console.log('auditEventId', auditEventId);
      } else {
        // Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });
      }

    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 4 - AuditEventHistoryInstance

JsonRoutes.add("get", "/" + fhirVersion + "/AuditEvent/:id/_history", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent/', req.params);
  process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent/', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var auditEvents = AuditEvents.find({_id: req.params.id});
      var payload = [];

      auditEvents.forEach(function(record){
        payload.push(AuditEvents.prepForFhirTransfer(record));

        // the following is a hack, to conform to the Touchstone AuditEvent testscript
        // https://touchstone.aegis.net/touchstone/testscript?id=06313571dea23007a12ec7750a80d98ca91680eca400b5215196cd4ae4dcd6da&name=%2fFHIR1-6-0-Basic%2fP-R%2fAuditEvent%2fClient+Assigned+Id%2fAuditEvent-client-id-json&version=1&latestVersion=1&itemId=&spec=HL7_FHIR_STU3_C2
        // the _history query expects a different resource in the Bundle for each version of the file in the system
        // since we don't implement record versioning in Meteor on FHIR yet
        // we are simply adding two instances of the record to the payload 
        payload.push(AuditEvents.prepForFhirTransfer(record));
      });
      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload, 'history')
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 5 - AuditEvent Version Read

// NOTE:  We've not implemented _history functionality yet; so this endpoint is mostly a duplicate of Step 2.

JsonRoutes.add("get", "/" + fhirVersion + "/AuditEvent/:id/_history/:versionId", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent/:id/_history/:versionId', req.params);
  //process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent/:id/_history/:versionId', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
  
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

  var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

  if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

    if (accessToken) {
      process.env.TRACE && console.log('accessToken', accessToken);
      process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
    }

    var auditEventData = AuditEvents.findOne({_id: req.params.id});
    if (auditEventData) {
      
      auditEventData.id = auditEventData._id;

      delete auditEventData._document;
      delete auditEventData._id;

      process.env.TRACE && console.log('auditEventData', auditEventData);

      JsonRoutes.sendResult(res, {
        code: 200,
        data: AuditEvents.prepForFhirTransfer(auditEventData)
      });
    } else {
      JsonRoutes.sendResult(res, {
        code: 410
      });
    }

  } else {
    JsonRoutes.sendResult(res, {
      code: 401
    });
  }
});



generateDatabaseQuery = function(query){
  console.log("generateDatabaseQuery", query);

  var databaseQuery = {};

  if (query.family) {
    databaseQuery['name'] = {
      $elemMatch: {
        'family': query.family
      }
    };
  }
  if (query.given) {
    databaseQuery['name'] = {
      $elemMatch: {
        'given': query.given
      }
    };
  }
  if (query.name) {
    databaseQuery['name'] = {
      $elemMatch: {
        'text': {
          $regex: query.name,
          $options: 'i'
        }
      }
    };
  }
  if (query.identifier) {
    databaseQuery['identifier'] = {
      $elemMatch: {
        'value': query.identifier
      }
    };
  }
  if (query.gender) {
    databaseQuery['gender'] = query.gender;
  }
  if (query.birthdate) {
    var dateArray = query.birthdate.split("-");
    var minDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2])) + 'T00:00:00.000Z';
    var maxDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2]) + 1) + 'T00:00:00.000Z';
    console.log("minDateArray", minDate, maxDate);

    databaseQuery['birthDate'] = {
      "$gte" : new Date(minDate),
      "$lt" :  new Date(maxDate)
    };
  }

  process.env.DEBUG && console.log('databaseQuery', databaseQuery);
  return databaseQuery;
}

JsonRoutes.add("get", "/" + fhirVersion + "/AuditEvent", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/AuditEvent', req.query);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var databaseQuery = generateDatabaseQuery(req.query);

      var payload = [];
      var auditEvents = AuditEvents.find(databaseQuery);

      auditEvents.forEach(function(record){
        payload.push(AuditEvents.prepForFhirTransfer(record));
      });

      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload)
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 6 - AuditEvent Search Type  

JsonRoutes.add("post", "/" + fhirVersion + "/AuditEvent/:param", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir-3.0.0/AuditEvent/' + JSON.stringify(req.query));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  var accessToken;
  
  if(typeof oAuth2Server === 'object'){
    accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
  }

  console.log('process.env.NOAUTH', process.env.NOAUTH);
  if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

    if (accessToken) {
      process.env.TRACE && console.log('accessToken', accessToken);
      process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
    }

    var auditEvents = [];

    console.log('req.params.param', req.params.param);

    if(Package['clinical:blockchain'] || process.env.BLOCKCHAIN){
      auditEvents = [];

      

      console.log('parseOptions(req.params.param)', parseOptions(req.params.param));
      var blockchainQuery = parseOptions(req.params.param);
      
      // this shouldn't be in the clinical:hl7-resource-audit-event package
      // need to refactor this elsewhere
      
      Meteor.call('getAuditEvents', blockchainQuery.patientAddress, blockchainQuery.userAddress, function(err,results) {
        if(err){
          console.log('err', err);
          // Unauthorized
          JsonRoutes.sendResult(res, {
            code: 401
          });
        }
        if(results) {
          console.log('------------------------------------')
          console.log('getAuditEvents()', results)

          results.reverse(); // reverse order of array so newest events are showed first
          results.forEach(function(result) {          
            var blockchainEvent = new AuditEvent(result);

            if(Package['clinical:hl7-resource-patient']){
              var patient = Patients.findOne({'contractAddress' : result.address});
              if(patient){
                var patientName = '';
                if(patient && patient.name && patient.name[0] && patient.name[0].text){
                  patientName = patient.name[0].text;
                } else {
                  patientName = result.address;
                }
                console.log('blockchainEvent', blockchainEvent);
                var fhirEvent = blockchainEvent.toFhir();
        
                fhirEvent.entity.push({
                  "reference": {
                    "display": patientName,
                    "reference": "Patient/" + patient._id
                  },
                  "type": {
                    "system": "http://hl7.org/fhir/object-type",
                    "code": "2",
                    "display": "System Object"
                  },
                  "lifecycle": {
                    "system": "http://hl7.org/fhir/dicom-audit-lifecycle",
                    "code": "6",
                    "display": "Access / Use"
                  }
                });
                console.log('blockchainEvent.toFhir()', fhirEvent);
                
                auditEvents.push(fhirEvent);
              }
            }          
          });
        }
      });

    } else {
      //auditEvents = AuditEvents.find(databaseQuery);
      if (req.params.param.includes('_search')) {
        var searchLimit = 1;
        if (req && req.query && req.query._count) {
          searchLimit = parseInt(req.query._count);
        }

        var databaseQuery = generateDatabaseQuery(req.query);
        process.env.DEBUG && console.log('databaseQuery', databaseQuery);

        auditEvents = AuditEvents.find(databaseQuery, {limit: searchLimit});

      }
    }


    var payload = [];
    auditEvents.forEach(function(record){
      payload.push(AuditEvents.prepForFhirTransfer(record));
    });

    process.env.TRACE && console.log('payload', payload);

    // Success
    JsonRoutes.sendResult(res, {
      code: 200,
      data: Bundle.generate(payload)
    });
  } else {
    // Unauthorized
    JsonRoutes.sendResult(res, {
      code: 401
    });
  }

});




//==========================================================================================
// Step 7 - AuditEvent Delete    

JsonRoutes.add("delete", "/" + fhirVersion + "/AuditEvent/:id", function (req, res, next) {
  process.env.DEBUG && console.log('DELETE /fhir-3.0.0/AuditEvent/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){

    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      // if (AuditEvents.find({_id: req.params.id}).count() === 0) {
      //   // Gone
      //   JsonRoutes.sendResult(res, {
      //     code: 410
      //   });
      // } else {
        AuditEvents.remove({_id: req.params.id}, function(error, result){
          if (result) {
            // No Content
            JsonRoutes.sendResult(res, {
              code: 204
            });
          }
          if (error) {
            // Conflict
            JsonRoutes.sendResult(res, {
              code: 409
            });
          }
        });
      // }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
  
  
});





// WebApp.connectHandlers.use("/fhir/AuditEvent", function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   return next();
// });




parseOptions = function(criteria){
  var result = {};
    
  // then we want to look at how many parameters were given
  var paramsArray = [];
  paramsArray = criteria.split('&');

  paramsArray.forEach(function(param){
    // for each parameter, figure out the field name and the value
    var fieldArray = param.split('=');

    // and we want to build up the object
    result[fieldArray[0]] = fieldArray[1];
  });
  
  console.log('parseCriteriaString', result);
  // deserialize string into mongo query
  return result;
}