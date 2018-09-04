import { CardText, CardTitle } from 'material-ui/Card';
import {Tab, Tabs} from 'material-ui/Tabs';
import { GlassCard, VerticalCanvas, FullPageCanvas, Glass } from 'meteor/clinical:glass-ui';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import AuditEventDetail from './AuditEventDetail';
import AuditEventsTable from './AuditEventsTable';

import React  from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin  from 'react-mixin';

export class AuditEventsPage extends React.Component {
  getMeteorData() {
    let data = {
      style: {
        opacity: Session.get('globalOpacity'),
        tab: {
          borderBottom: '1px solid lightgray',
          borderRight: 'none'
        }
      },
      tabIndex: Session.get('auditEventPageTabIndex'),
      auditEventSearchFilter: Session.get('auditEventSearchFilter'),
      currentAuditEvent: Session.get('selectedAuditEvent')
    };

    data.style = Glass.blur(data.style);
    data.style.appbar = Glass.darkroom(data.style.appbar);
    data.style.tab = Glass.darkroom(data.style.tab);

    return data;
  }

  handleTabChange(index){
    Session.set('auditEventPageTabIndex', index);
  }

  onNewTab(){
    Session.set('selectedAuditEvent', false);
    Session.set('auditEventUpsert', false);
  }

  render() {
    if(process.env.NODE_ENV === "test") console.log('In AuditEventsPage render');
    return (
      <div id='auditEventsPage'>
        <FullPageCanvas>
          <GlassCard height='auto'>
            <CardTitle title='AuditEvents' />
            <CardText>
              <AuditEventsTable />

              {/* <Tabs id="auditEventsPageTabs" default value={this.data.tabIndex} onChange={this.handleTabChange} initialSelectedIndex={1}>
               <Tab className='newAuditEventTab' label='New' style={this.data.style.tab} onActive={ this.onNewTab } value={0}>
                 <AuditEventDetail id='newAuditEvent' />
               </Tab>
               <Tab className="auditEventListTab" label='AuditEvents' onActive={this.handleActive} style={this.data.style.tab} value={1}>
                <AuditEventsTable />
               </Tab>
               <Tab className="auditEventDetailsTab" label='Detail' onActive={this.handleActive} style={this.data.style.tab} value={2}>
                 <AuditEventDetail 
                  id='auditEventDetails'
                  showDatePicker={true} 
                 />
               </Tab>
             </Tabs> */}
            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }
}

ReactMixin(AuditEventsPage.prototype, ReactMeteorData);

export default AuditEventsPage;