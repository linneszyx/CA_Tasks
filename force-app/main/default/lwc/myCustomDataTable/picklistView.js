import { LightningElement, api } from 'lwc';

export default class PicklistView extends LightningElement {
    @api value;
    @api typeAttributes;

    get label() {
        const options = this.typeAttributes.options || [];
        const match = options.find(o => o.value === this.value);
        return match ? match.label : '';
    }
}