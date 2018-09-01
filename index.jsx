

import AuditEventsPage from './client/AuditEventsPage';
import AuditEventsTable from './client/AuditEventsTable';

var DynamicRoutes = [{
  'name': 'AuditEventsPage',
  'path': '/audit-events',
  'component': AuditEventsPage,
  'requireAuth': true
}];

var SidebarElements = [{
  'primaryText': 'AuditEvents',
  'to': '/audit-events',
  'href': '/audit-events'
}];

export { 
  SidebarElements, 
  DynamicRoutes, 

  AuditEventsPage,
  AuditEventsTable
};


