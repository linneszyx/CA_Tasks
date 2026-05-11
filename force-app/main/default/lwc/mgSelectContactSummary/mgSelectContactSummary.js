import { LightningElement, api } from 'lwc';

export default class MgSelectContactSummary extends LightningElement {
    @api contacts = []
    handleRemove(e) {
        const contactId = e.target.name
        const removeEvent = new CustomEvent('removecontact', {
            detail: contactId
        })
        this.dispatchEvent(removeEvent)
    }
}