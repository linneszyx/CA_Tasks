import { LightningElement, api } from 'lwc';
const COLUMNS = [
    {
        label: 'Subject',
        fieldName: 'Subject',
        type: 'text'
    },
    {
        label: 'Due Date',
        fieldName: 'ActivityDate',
        type: 'date'
    },
    {
        label: 'Status',
        fieldName: 'Status',
        type: 'text'
    },
    {
        label: 'Priority',
        fieldName: 'Priority',
        type: 'text'
    },
    {
        label: 'Created Date',
        fieldName: 'CreatedDate',
        type: 'date'
    }
]
export default class MgTasksAccordion extends LightningElement {
    @api tasks = [];
    @api isLoading = false;
    columns = COLUMNS;
    get sectionLabel() {
        return `Related Tasks (${this.tasks.length})`;
    }
    get showEmpty() {
        return this.tasks && this.tasks.length === 0;
    }
}