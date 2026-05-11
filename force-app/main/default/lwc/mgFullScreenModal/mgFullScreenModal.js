import { LightningElement, api } from 'lwc';
const CASE_COLUMNS = [
    {
        label: 'Case Number',
        fieldName: 'CaseNumber',
        type: 'text'
    },

    {
        label: 'Subject',
        fieldName: 'Subject',
        type: 'text'
    },

    {
        label: 'Status',
        fieldName: 'Status',
        type: 'text'
    }
]
const TASK_COLUMNS = [
    {
        label: 'Subject',
        fieldName: 'Subject',
        type: 'text'
    },

    {
        label: 'Status',
        fieldName: 'Status',
        type: 'text'
    },

    {
        label: 'Due Date',
        fieldName: 'ActivityDate',
        type: 'date'
    }

]

export default class MgFullScreenModal extends LightningElement {
    @api isOpen = false
    @api groupData = []
    caseColumns = CASE_COLUMNS
    taskColumns = TASK_COLUMNS
    activeSections;
    connectedCallback() {
        this.activeSections = this.groupData.map(c => c.ContactId)
    }
    handleClick() {
        this.dispatchEvent(new CustomEvent('close'))
    }
}