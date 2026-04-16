import { LightningElement ,wire,api} from 'lwc';
import {getRelatedListRecords} from 'lightning/uiRelatedListApi';

export default class MyRelationMatrixComponent extends LightningElement 
{
    @api recordId;
    error;
    records;
    @wire(getRelatedListRecords, {
        parentRecordId : '$recordId',
        relatedListId : 'RelationMatrixs__r',
        fields :[
            'Relation_Matrix__c.Name',
            'Relation_Matrix__c.Account__r.Name',
            'Relation_Matrix__c.Contact__r.Name',
            'Relation_Matrix__c.User__r.Name',
            'Relation_Matrix__c.Health__c',
        ]
    })
    listInfo({error,data}) {
        if(data) {
            this.records = data.records;
            this.error = undefined;
        }
        else if(error) {
            this.error = error;
            this.records = undefined;
        }
    }
    
    get hasRecords() {
        return this.records && this.records.length > 0;
    }
    
}