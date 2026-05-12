import { LightningElement, track, api } from 'lwc';
createOpportunity
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createOpportunity from '@salesforce/apex/RROpportunityController.createOpportunity';

export default class RrOpportunityCreation extends LightningElement {
    @track opp = {};
    countryOptions = [
        { label: 'USA', value: 'USA' },
        { label: 'India', value: 'India' },
        { label: 'UK', value: 'UK' }
    ]
    handleName(e) {
        this.opp.Name = e.target.value;
    }
    handleCountry(e) {
        this.opp.Country__c = e.target.value;
    }
    async saveOpportunity() {
        this.opp.StageName = 'Prospecting';
        this.opp.CloseDate = new Date().toISOString();
        let res = await createOpportunity({ opp: this.opp });
        this.dispatchEvent(new CustomEvent('next', {
            detail: {
                oppId: res.Id
            }
        }))
    }
}