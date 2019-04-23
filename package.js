Package.describe({
  name: 'clinical:hl7-resource-audit-event',
  version: '1.6.10',
  summary: 'HL7 FHIR Resource - AuditEvent',
  git: 'https://github.com/clinical-meteor/hl7-resource-audit-event',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.3');

  api.use('meteor-platform');
  api.use('mongo');
  api.use('ecmascript@0.9.0');

  api.use('aldeed:collection2@3.0.0');
  api.use('clinical:hl7-resource-datatypes@4.0.0');
  api.use('clinical:hl7-resource-bundle@1.4.0');
  api.use('clinical:hl7-resource-binary@1.1.0');

  api.use('simple:json-routes@2.1.0');
  api.use('clinical:glass-ui@2.4.7');
  api.use('clinical:base-model@1.4.0');

  api.addFiles('lib/hl7-resource-audit-event.js', ['client', 'server']);
  api.addFiles('server/rest.js', 'server');
  api.addFiles('server/initialize.js', 'server');

  if(Package['clinical:fhir-vault-server']){
    api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
  }

  api.export('AuditEvent');
  api.export('AuditEvents');
  api.export('AuditEventSchema');

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "simpl-schema": "1.5.3",
  "moment": "2.22.2",
  "lodash": "4.17.4"
})