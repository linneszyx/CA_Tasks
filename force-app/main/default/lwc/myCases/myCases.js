import { LightningElement, wire } from 'lwc';
import getAllCases from '@salesforce/apex/AssetController.getAllCases';
export default class MyCases extends LightningElement {
    cases;
    @wire(getAllCases)
    wiredCases({ data }) {
        if (data) {
            this.cases = data;
        }
    }
}