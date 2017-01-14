describe('clinical:hl7-resources-audit-events', function () {
  var server = meteor();
  var client = browser(server);

  it('AuditEvents should exist on the client', function () {
    return client.execute(function () {
      expect(AuditEvents).to.exist;
    });
  });

  it('AuditEvents should exist on the server', function () {
    return server.execute(function () {
      expect(AuditEvents).to.exist;
    });
  });

});
