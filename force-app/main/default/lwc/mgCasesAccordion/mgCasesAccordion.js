import { LightningElement, api } from 'lwc';
const COLUMNS = [
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
export default class MgCasesAccordion extends LightningElement {
    @api cases = [];
    @api isLoading = false
    columns = COLUMNS;
    get sectionLabel() {
        return `Related Cases (${this.cases.length})`
    }
    get showEmpty() {
        return this.cases && this.cases.length === 0
    }
    get showFullScreenButton() {
        return this.cases.length > 5
    }
    handleFullScreen() {
        this.dispatchEvent(new CustomEvent('fullscreen', {
            detail: {
                title: 'Related Cases',
                records: this.cases,
                columns: this.columns
            }
        }))
    }
}