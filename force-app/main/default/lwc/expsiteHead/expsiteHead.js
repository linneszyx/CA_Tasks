import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import CloudAnalogy from '@salesforce/resourceUrl/CloudAnalogy';
export default class ExpsiteHead extends NavigationMixin(LightningElement) {
    cloudAnalogyLogo = CloudAnalogy;
    navigatePage(pgName) {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: pgName
            }
        })
    }
    myHome() {
        this.navigatePage('Home')
    }
    myAsset() {
        this.navigatePage('myasset__c');
    }
    myCases() {
        this.navigatePage('My_Cases__c');
    }
    myTopics() {
        this.navigatePage('My_Topics__c');
    }
}