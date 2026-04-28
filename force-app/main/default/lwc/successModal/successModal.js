import { LightningElement, api } from 'lwc';

export default class SuccessModal extends LightningElement {

    @api caseNumber;

    redirect() {
        this.dispatchEvent(new CustomEvent('redirect'));
    }
}