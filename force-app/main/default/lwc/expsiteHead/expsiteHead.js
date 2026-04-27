import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import CloudAnalogy from '@salesforce/resourceUrl/CloudAnalogy';

export default class ExpsiteHead extends NavigationMixin(LightningElement) {
    cloudAnalogyLogo = CloudAnalogy;
    navigatePage(url_dest) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url_dest
            }
        })
    }
    myHome() {
        this.navigatePage('/')
    }
    myAsset() {
        this.navigatePage('/my-asset');
    }
    myCases() {
        this.navigatePage('/my-cases');
    }
    myTopics() {
        this.navigatePage('/my-topics');
    }
}