public with sharing class getRecordController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContact(Id accId){
        try {
           List<Contact> contactList = [SELECT Id FROM Contact WHERE AccountId =:accId];
           if(!contactList.isEmpty()) {
            return contactList;
           } 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true) 
    public static List<Opportunity> getOpportunity(Id accId) {
        try{
            List<Opportunity> opportunityList = [SELECT Id FROM Opportunity WHERE AccountId = :accId];
            if(!opportunityList.isEmpty()) {
                return opportunityList;
            }
        }
        catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}