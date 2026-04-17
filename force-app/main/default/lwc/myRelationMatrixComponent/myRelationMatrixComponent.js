import { LightningElement ,wire,api} from 'lwc';
import {getRelatedListRecords} from 'lightning/uiRelatedListApi';
import {refreshApex} from '@salesforce/apex';
import TICK_IMAGE from '@salesforce/resourceUrl/Tick'
import CROSS_IMAGE from '@salesforce/resourceUrl/Cross'
import HYPEN_IMAGE from '@salesforce/resourceUrl/Hypen'


const HEALTH_IMG = {
    good : TICK_IMAGE,
    bad : CROSS_IMAGE,
    average : HYPEN_IMAGE
}

export default class MyRelationMatrixComponent extends LightningElement 
{
    @api recordId;
    error;
    records;
    rows;
    users;
    selectedRecordId;
    wiredRecordsResult;
    @wire(getRelatedListRecords, {
        parentRecordId : '$recordId',
        relatedListId : 'RelationMatrixs__r',
        fields :[
            'Relation_Matrix__c.Name',
            'Relation_Matrix__c.Account__r.Name',
            'Relation_Matrix__c.Contact__c',
            'Relation_Matrix__c.Contact__r.Name',
            'Relation_Matrix__c.User__c',
            'Relation_Matrix__c.User__r.Name',
            'Relation_Matrix__c.Health__c',
        ]
    })
    listInfo(result) {
    this.wiredRecordsResult = result;
    const {error,data} = result;
        if(data) {
            this.records = data.records.map((r) => this.recordMap(r));
            this.makeTable();
            this.error = undefined;
        }
        else if(error) {
            this.error = error;
            this.records = undefined;
            this.rows = undefined;
            this.users = undefined;
        }
    }

    recordMap(rec) {
        const  health_value = rec.fields.Health__c.value;
        return {
            id : rec.id,
            name : rec.fields.Name.value,
            accountName : rec.fields.Account__r.displayValue,
            contactId : rec.fields.Contact__c.value,
            contactName : rec.fields.Contact__r.displayValue,
            userId : rec.fields.User__c.value,
            userName : rec.fields.User__r.displayValue,
            health_value,
            imgURL : this.getImage(health_value)

        }
    }
    
    get recordPresent() {
        return this.records && this.records.length > 0
    }

    get showModal() {
        return Boolean(this.selectedRecordId)
    }

    getImage(health_value) {
        if(!health_value) return '';
        return HEALTH_IMG[health_value.toLowerCase().trim()];
    }

    makeTable() {
        const ContactId = new Map();
        const UserId = new Map();
        const relCA = new Map();
        this.records.forEach((r) => {
            if(!r.contactId || !r.userId) return;
            ContactId.set(r.contactId, {
                id : r.contactId,
                name: r.contactName
            });
            UserId.set(r.userId, {
                id : r.userId,
                name : r.userName
            });
            relCA.set(`${r.contactId} - ${r.userId}`,r);
        });
        this.users = Array.from(UserId.values());
        this.rows = Array.from(ContactId.values()).map((c) => ({
            id : c.id,
            contactName : c.name,
            cells : this.users.map((u) => {
                const rel = relCA.get(`${c.id} - ${u.id}`);
                return {
                    key : `${c.id} - ${u.id}`,
                    relationId : rel?.id ?? null,
                    health_value : rel?.health_value ?? null,
                    imgURL : rel?.imgURL?? null
                }
            })
        }))
    }

    handleClick(event) {
        const recordId = event.currentTarget.dataset.recordId;
        if(!recordId) return;
        this.selectedRecordId = recordId;
    }

    closeModal() {
        this.selectedRecordId = undefined;
    }

    async handleSave() {
        await refreshApex(this.wiredRecordsResult);
        this.closeModal();
    }
}