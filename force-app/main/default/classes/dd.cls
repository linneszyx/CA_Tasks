public with sharing class dd {
/*
import { LightningElement, wire, api } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { refreshApex } from '@salesforce/apex';
import TICK_IMAGE from '@salesforce/resourceUrl/Tick';
import CROSS_IMAGE from '@salesforce/resourceUrl/Cross';
import HYPEN_IMAGE from '@salesforce/resourceUrl/Hypen';

const HEALTH_IMG = {
    good: TICK_IMAGE,
    bad: CROSS_IMAGE,
    average: HYPEN_IMAGE
};

export default class MyRelationMatrixComponent extends LightningElement {
    @api recordId;
    error;
    records;
    rows;
    users;
    selectedRecordId;
    wiredRecordsResult;

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'RelationMatrixs__r',
        fields: [
            'Relation_Matrix__c.Name',
            'Relation_Matrix__c.Account__r.Name',
            'Relation_Matrix__c.Contact__c',
            'Relation_Matrix__c.Contact__r.Name',
            'Relation_Matrix__c.User__c',
            'Relation_Matrix__c.User__r.Name',
            'Relation_Matrix__c.Health__c'
        ]
    })
    listInfo(result) {
        this.wiredRecordsResult = result;
        const { error, data } = result;

        if (data) {
            this.records = data.records.map((rec) => this.mappingRecord(rec));
            // this.buildMatrix();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
            this.rows = undefined;
            this.users = undefined;
        }
    }

    get recordPresent() {
        return this.rows && this.rows.length > 0;
    }

    get showModal() {
        return Boolean(this.selectedRecordId);
    }

    mappingRecord(rec) {
        const healthValue = rec.fields.Health__c?.value;
        return {
            id: rec.id,
            name: rec.fields.Name?.value,
            accountName: rec.fields.Account__r?.displayValue,
            contactId: rec.fields.Contact__c?.value,
            contactName: rec.fields.Contact__r?.displayValue,
            userId: rec.fields.User__c?.value,
            userName: rec.fields.User__r?.displayValue,
            healthValue,
            imgURL: this.getImage(healthValue)
        };
    }

    getImage(healthValue) {
        if (!healthValue) return '';
        return HEALTH_IMG[healthValue.toLowerCase().trim()];
    }

    buildMatrix() {
        const contactsById = new Map();
        const usersById = new Map();
        const relationByContactAndUser = new Map();

        this.records.forEach((rec) => {
            if (!rec.contactId || !rec.userId) {
                return;
            }

            contactsById.set(rec.contactId, {
                id: rec.contactId,
                name: rec.contactName
            });
            usersById.set(rec.userId, {
                id: rec.userId,
                name: rec.userName
            });
            relationByContactAndUser.set(`${rec.contactId}-${rec.userId}`, rec);
        });

        this.users = Array.from(usersById.values());
        this.rows = Array.from(contactsById.values()).map((contact) => ({
            id: contact.id,
            contactName: contact.name,
            cells: this.users.map((user) => {
                const relation = relationByContactAndUser.get(`${contact.id}-${user.id}`);

                return {
                    key: `${contact.id}-${user.id}`,
                    relationId: relation?.id,
                    healthValue: relation?.healthValue,
                    imgURL: relation?.imgURL
                };
            })
        }));
    }

    handleCellClick(event) {
        const recordId = event.currentTarget.dataset.recordId;

        if (!recordId) {
            return;
        }

        this.selectedRecordId = recordId;
    }

    closeModal() {
        this.selectedRecordId = undefined;
    }

    async handleSaveSuccess() {
        await refreshApex(this.wiredRecordsResult);
        this.closeModal();
    }
}

<template>
    <lightning-card title="Matrix Records">
        <template lwc:if={recordPresent}>
            <div class="matrix-wrap">
                <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                    <thead>
                        <tr>
                            <th scope="col">Contact</th>
                            <template for:each={users} for:item="user">
                                <th key={user.id} scope="col">{user.name}</th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <template for:each={rows} for:item="row">
                            <tr key={row.id}>
                                <th scope="row">{row.contactName}</th>
                                <template for:each={row.cells} for:item="cell">
                                    <td key={cell.key}>
                                        <template lwc:if={cell.imgURL}>
                                            <button
                                                type="button"
                                                class="image-button"
                                                data-record-id={cell.relationId}
                                                title={cell.healthValue}
                                                onclick={handleCellClick}
                                            >
                                                <img src={cell.imgURL} alt={cell.healthValue} class="img-handle" />
                                            </button>
                                        </template>
                                        <template lwc:else>
                                            -
                                        </template>
                                    </td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </template>

        <template lwc:else>
            <div class="slds-m-around_medium">No matrix records found.</div>
        </template>
    </lightning-card>

    <template lwc:if={showModal}>
        <section role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-heading"
            class="slds-modal slds-fade-in-open">
            <div class="slds-modal__container">
                <header class="slds-modal__header">
                    <button class="slds-button slds-button_icon slds-modal__close" title="Close"
                        onclick={closeModal}>
                        <lightning-icon icon-name="utility:close" alternative-text="Close" size="small"></lightning-icon>
                    </button>
                    <h2 id="modal-heading" class="slds-modal__title slds-hyphenate">
                        Edit Relation Matrix
                    </h2>
                </header>

                <div class="slds-modal__content slds-p-around_medium">
                    <lightning-record-edit-form
                        object-api-name="Relation_Matrix__c"
                        record-id={selectedRecordId}
                        onsuccess={handleSaveSuccess}
                    >
                        <lightning-messages></lightning-messages>
                        <lightning-input-field field-name="Name"></lightning-input-field>
                        <lightning-input-field field-name="Health__c"></lightning-input-field>
                        <lightning-input-field field-name="Account__c"></lightning-input-field>
                        <lightning-input-field field-name="Contact__c"></lightning-input-field>
                        <lightning-input-field field-name="User__c"></lightning-input-field>

                        <div class="slds-m-top_medium">
                            <lightning-button label="Cancel" onclick={closeModal}></lightning-button>
                            <lightning-button
                                type="submit"
                                label="Save"
                                variant="brand"
                                class="slds-m-left_small"
                            ></lightning-button>
                        </div>
                    </lightning-record-edit-form>
                </div>
            </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open"></div>
    </template>
</template>

.matrix-wrap {
    overflow-x: auto;
}

.img-handle {
    height: 20px;
    width: 20px;
    object-fit: contain;
}

.image-button {
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 0;
}
    

*/


}