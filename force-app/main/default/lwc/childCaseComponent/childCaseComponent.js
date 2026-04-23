import { LightningElement, track, api } from 'lwc';
import getAllCases from '@salesforce/apex/CaseController.getAllCases';
import getRecordCases from '@salesforce/apex/CaseController.getRecordCases';

const CASE_COL = [
    {
        label: 'Case Number',
        fieldName: 'caseUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'CaseNumber' },
            target: '_blank'
        }
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
        for (let i = 0; i < rec.length; i += 1) {
            let one_case = rec[i]
            res.push({
                Id: one_case.Id,
                ParentId: one_case.ParentId,
                CaseNumber: one_case.CaseNumber,
                Status: one_case.Status,
                Priority: one_case.Priority,
                Origin: one_case.Origin,
                caseUrl: '/' + one_case.Id,
                _children: []
            })
        }
        for (let i = 0; i < res.length; i += 1) {
            let child_case = res[i];
            if (child_case.ParentId) {
                for (let j = 0; j < res.length; j += 1) {
                    if (res[j].Id === child_case.ParentId) {
                        res[j]._children.push(child_case);
                        break;
                    }
                }
            }
        }
        let result = []
        for (let i = 0; i < res.length; i += 1) {
            if (!res[i].ParentId) {
                result.push(res[i]);
            }
        }
        return result;
    }
    handleToggling(event) {
        this.expandRows = event.detail.expandRows;
    }
}