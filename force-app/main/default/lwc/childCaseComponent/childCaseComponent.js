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
        let mp = {}
        for (let i = 0; i < rec.length; i += 1) {
            let parent_case = rec[i]
            mp[parent_case.Id] = {
                Id: parent_case.Id,
                ParentId: parent_case.ParentId,
                CaseNumber: parent_case.CaseNumber,
                Status: parent_case.Status,
                Priority: parent_case.Priority,
                Origin: parent_case.Origin,
                caseUrl: '/' + parent_case.Id,
                _children: []
            }
        }
        for (let i = 0; i < rec.length; i += 1) {
            let one_case = rec[i];
            if (one_case.ParentId && mp[one_case.ParentId])
                mp[one_case.ParentId]._children.push(mp[one_case.Id]);
            else res.push(mp[one_case.Id]);
        }
        return res;
    }
    handleToggling(event) {
        this.expandRows = event.detail.expandRows;
    }
}