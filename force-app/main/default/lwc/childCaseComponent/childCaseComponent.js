import { LightningElement, track, api } from 'lwc';
import getAllCases from '@salesforce/apex/CaseController.getAllCases';
import getRecordCases from '@salesforce/apex/CaseController.getRecordCases';

const CASE_COL = [
    {
        label: 'Case Number',
        fieldName: 'CaseNumber',
        type: 'text'
    },
    {
        label: 'Priority',
        fieldName: 'Priority',
    },
    {
        label: 'Origin',
        fieldName: 'Origin'
    },
    {
        label: 'Status',
        fieldName: 'Status'
    },
    {
        label: 'Parent Id',
        fieldName: 'ParentId'
    }
]

export default class ChildCaseComponent extends LightningElement {

    @api recordId
    @track expandRows = []
    columns = CASE_COL
    gridData = []
    error

    connectedCallback() {
        this.getData()
    }

    getData() {
        if (this.recordId) {
            getRecordCases({ recordId: this.recordId })
                .then(r => {
                    this.gridData = this.changeData(r)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        else {
            getAllCases()
                .then(r => {
                    this.gridData = this.changeData(r);
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }
    changeData(rec) {
        let res = [];
        for (let i = 0; i < rec.length; i++) {
            let c = rec[i]
            let row = {
                Id: c.Id,
                CaseNumber: c.CaseNumber,
                Status: c.Status,
                Priority: c.Priority,
                ParentCaseNumber: null,
                _children: []
            }

            if (c.Parent) {
                row.ParentCaseNumber = c.Parent.CaseNumber;
                if (c.ParentId) {
                    row._children.push({
                        Id: c.ParentId,
                        CaseNumber: c.Parent.CaseNumber,
                        Status: c.Parent.Status,
                        Priority: c.Parent.Priority,
                    })
                }
            }

            res.push(row)
        }

        return res
    }
    handleToggling(event) {
        this.expandRows = event.detail.expandRows;
    }
}
