import { LightningElement,wire } from 'lwc';
import getArticles from '@salesforce/apex/KnowledgeController.getArticles';
export default class ExpFAQ extends LightningElement {
    articles;

    @wire(getArticles)
    wiredData({ data, error }) {
        if (data) {
            this.articles = data;
        } else {
            console.error(error);
        }
    }
}