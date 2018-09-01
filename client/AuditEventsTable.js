import { Card, CardActions, CardMedia, CardText, CardTitle } from 'material-ui/Card';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';
import Toggle from 'material-ui/Toggle';

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
    for (var i = 0; i < this.data.auditEvents.length; i++) {
      var newRow = {
        identifier: '',
        status: '',
        code: ''        
      };
      if (this.data.auditEvents[i]){
        if(this.data.auditEvents[i].identifier){
          newRow.identifier = this.data.auditEvents[i].identifier[0].value;
        }
        if(this.data.auditEvents[i].code && this.data.auditEvents[i].code.text){
          newRow.code = this.data.auditEvents[i].code.text;
        }     
        if(this.data.auditEvents[i].status){
          newRow.status = this.data.auditEvents[i].status;
        }
      }

      tableRows.push(
        <tr key={i} className="auditEventRow" style={{cursor: "pointer"}} onClick={ this.rowClick.bind('this', this.data.auditEvents[i]._id)} >
          { this.renderToggles(this.data.displayToggle, this.data.auditEvents[i]) }
          <td className='identifier'>{ newRow.identifier }</td>
          <td className='code'>{ newRow.code }</td>
          <td className='status'>{ newRow.status }</td>
          { this.renderDate(this.data.displayDates, this.data.auditEvents[i].performedDateTime) }
        </tr>
      )
    }

    return(
      <Table id='auditEventsTable' hover >
        <thead>
          <tr>
            { this.renderTogglesHeader(this.data.displayToggle) }
            <th className='identifier'>identifier</th>
            <th className='code'>code</th>
            <th className='status'>status</th>
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