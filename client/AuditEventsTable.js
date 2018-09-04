// https://www.hl7.org/fhir/auditevent.html  
// STU3



import { Card, CardActions, CardMedia, CardText, CardTitle } from 'material-ui/Card';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';
import Toggle from 'material-ui/Toggle';
import { get } from 'lodash';

export default class AuditEventsTable extends React.Component {

  getMeteorData() {

    // this should all be handled by props
    // or a mixin!
    let data = {
      style: {
        opacity: Session.get('globalOpacity')
      },
      selected: [],
      auditEvents: [],
      displayToggle: false,
      displayDates: false
    }

    if(this.props.displayToggles){
      data.displayToggle = this.props.displayToggles;
    }
    if(this.props.displayDates){
      data.displayDates = this.props.displayDates;
    }
    if(this.props.data){
      data.auditEvents = this.props.data;
    } else {
      if(AuditEvents.find().count() > 0){
        data.auditEvents = AuditEvents.find().fetch();
      }  
    }

    if(process.env.NODE_ENV === "test") console.log("AuditEventsTable[data]", data);
    return data;
  };

  renderTogglesHeader(displayToggle){
    if (displayToggle) {
      return (
        <th className="toggle">toggle</th>
      );
    }
  }
  renderToggles(displayToggle, patientId ){
    if (displayToggle) {
      return (
        <td className="toggle">
            <Toggle
              defaultToggled={true}
              //style={styles.toggle}
            />
          </td>
      );
    }
  }
  renderDateHeader(displayDates){
    if (displayDates) {
      return (
        <th className='date'>date</th>
      );
    }
  }
  renderDate(displayDates, newDate ){
    if (displayDates) {
      return (
        <td className='date'>{ moment(newDate).format('YYYY-MM-DD') }</td>
      );
    }
  }
  rowClick(id){
    Session.set('auditEventsUpsert', false);
    Session.set('selectedAuditEvent', id);
    Session.set('auditEventPageTabIndex', 2);
  };
  render () {
    let tableRows = [];
    let auditEvent;
    for (var i = 0; i < this.data.auditEvents.length; i++) {
      var newRow = {
        type: '',
        subtype: '',        
        action: '',
        outcome: '',
        outcomeDesc: '',
        agentName: '',
        entityName: '',
        sourceSite: ''
      };
      if (this.data.auditEvents[i]){
        auditEvent = this.data.auditEvents[i];

        if(get(auditEvent, 'type')){
          if(get(auditEvent, 'type.display')){
            newRow.type = get(auditEvent, 'type.display');
          } else {
            newRow.type = get(auditEvent, 'type.code');
          }
        }
        newRow.subtype = get(auditEvent, 'subtype[0].display')
        newRow.subtype = get(auditEvent, 'subtype[0].code')
        newRow.action = get(auditEvent, 'action')
        newRow.outcome = get(auditEvent, 'outcome')
        // newRow.outcomeDesc = get(auditEvent, 'outcomeDesc')
        newRow.agentName = get(auditEvent, 'agent[0].name')
        newRow.entityName = get(auditEvent, 'entity[0].name')
        newRow.sourceSite = get(auditEvent, 'source.site')
      }

      console.log('newRow', newRow)

      tableRows.push(
        <tr key={i} className="auditEventRow" style={{cursor: "pointer"}} onClick={ this.rowClick.bind('this', this.data.auditEvents[i]._id)} >
          { this.renderToggles(this.data.displayToggle, this.data.auditEvents[i]) }
          <td className='type'>{ newRow.type }</td>
          {/* <td className='subtype'>{ newRow.subtype }</td> */}
          <td className='action'>{ newRow.action }</td>
          <td className='outcome'>{ newRow.outcome }</td>
          {/* <td className='outcomeDesc'>{ newRow.outcomeDesc }</td> */}
          <td className='agentName'>{ newRow.agentName }</td>
          <td className='entityName'>{ newRow.entityName }</td>
          <td className='sourceSite'>{ newRow.sourceSite }</td>
          { this.renderDate(this.data.displayDates, this.data.auditEvents[i].performedDateTime) }
        </tr>
      )
    }

    return(
      <Table id='auditEventsTable' hover >
        <thead>
          <tr>
            { this.renderTogglesHeader(this.data.displayToggle) }
            <th className='type'>Type</th>
            {/* <th className='subtype'>Subtype</th> */}
            <th className='action'>Action</th>
            <th className='outcome'>Outcome</th>
            {/* <th className='outcomeDesc'>Outcome Description</th> */}
            <th className='agentName'>Agent Name</th>
            <th className='entityName'>Entity Name</th>
            <th className='sourceSite'>Source</th>
            { this.renderDateHeader(this.data.displayDates) }
          </tr>
        </thead>
        <tbody>
          { tableRows }
        </tbody>
      </Table>
    );
  }
}


ReactMixin(AuditEventsTable.prototype, ReactMeteorData);