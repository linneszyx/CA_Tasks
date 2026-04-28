import { LightningElement, api } from 'lwc';
import createCase from '@salesforce/apex/AssetController.createCase';
export default class CaseForm extends LightningElement {
    @api assetId;
    subject = '';
    description = '';
    handleSubject(e) {
        this.subject = e.target.value;
    }
    handleDesc(e) {
        this.description = e.target.value;
    }
    submit() {
        createCase({
            assetId: this.assetId,
            subject: this.subject,
            description: this.description
        })
            .then(r => {
                this.dispatchEvent(new CustomEvent('success', {
                    detail: r.CaseNumber
                }));
            });
    }
    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}