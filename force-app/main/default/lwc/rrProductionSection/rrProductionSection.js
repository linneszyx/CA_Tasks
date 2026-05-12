import { LightningElement, api, track } from 'lwc';
import getPricebookId from '@salesforce/apex/RROpportunityController.getPricebookId';
import getProducts from '@salesforce/apex/RROpportunityController.getProducts';
import saveProducts from '@salesforce/apex/RROpportunityController.saveProducts';
import getOpportunity from '@salesforce/apex/RROpportunityController.getOpportunity';
import submitForApproval from '@salesforce/apex/RROpportunityApproval.submitForApproval';
export default class RrProductionSection extends LightningElement {
    @api oppId;
    @track products = [];
    @track draftValues = [];
    @track selectedProducts = [];
    isLocked = false;
    columns = [
        {
            label: 'Product',
            fieldName: 'productName',
            type: 'text'
        },
        {
            label: 'Price',
            fieldName: 'UnitPrice',
            type: 'currency'
        },
        {
            label: 'Quantity',
            fieldName: 'Quantity',
            type: 'number',
            editable: true
        },
        {
            label: 'Quantity Period',
            fieldName: 'QuantityPeriod__c',
            type: 'text',
            editable: true
        },
        {
            label: 'Discount %',
            fieldName: 'Discount_Percent__c',
            type: 'percent',
            editable: true
        },
        {
            label: 'Final Price',
            fieldName: 'FinalPrice',
            type: 'currency'
        }
    ]
    connectedCallback() {
        this.loadOpportunity();
    }
    async loadOpportunity() {
        try {
            const opp = await getOpportunity({ oppId: this.oppId });
            this.isLocked = opp.Locked_For_Editing__c;
            const pbId = await getPricebookId({ country: opp.Country__c });
            const res = await getProducts({ pricebookId: pbId });
            this.products = res.map(item => {
                return {
                    Id: item.Id,
                    PricebookEntryId: item.Product2Id,
                    productName: item.Product2.Name,
                    UnitPrice: item.UnitPrice,
                    Quantity: 1,
                    QuantityPeriod__c: 'Monthly',
                    Discount_Percent__c: 0,
                    FinalPrice: item.UnitPrice
                }
            })
        }
        catch (error) {
            console.log(error);
        }
    }
    async handleSave(e) {
        const updatedFields = e.detail.draftValues;
        updatedFields.forEach(d => {
            let r = this.products.find(p => p.Id === d.Id);
            if (r) {
                if (d.Quantity) {
                    r.Quantity = d.Quantity;
                }
                if (d.QuantityPeriod__c) {
                    r.QuantityPeriod__c = d.QuantityPeriod__c;
                }
                if (d.Discount_Percent__c) {
                    r.Discount_Percent__c = d.Discount_Percent__c;
                    if (d.Discount_Percent__c > 20) {
                        this.triggerApproval();
                    }
                }
                r.FinalPrice = r.UnitPrice - (r.UnitPrice * r.Discount_Percent__c / 100);
            }
        })
        this.products = [...this.products];
        this.draftValues = [];
    }
    async triggerApproval() {
        try {
            await submitForApproval({ oppId: this.oppId });
            this.isLocked = true;
            this.showToast('Approval', 'Approval Submitted', 'success');
        }
        catch (error) {
            console.log(error);
        }
    }
    async handleNext() {
        try {
            let items = [];
            this.products.forEach(p => {
                if (p.Quantity > 0) {
                    items.push({
                        OpportunityId: this.oppId,
                        PricebookEntryId: p.PricebookEntryId,
                        Quantity: p.Quantity,
                        UnitPrice: p.FinalPrice, Discount_Percent__c: p.Discount_Percent__c,
                        QuantityPeriod__c: p.QuantityPeriod__c
                    })
                }
            })
            await saveProducts({ items: items })
            this.dispatchEvent(new CustomEvent('next'))
        }
        catch (error) {
            console.log(error);
        }
    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title, message, variant
        }))
    }
}