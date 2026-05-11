public with sharing class MG_ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContacts(String keySearch) {
        try{
            if(String.isBlank(keySearch)) {
                return new List<Contact>();
            }
            String searchKey = '%' + keySearch + '%';
            List<Contact> contactList = [SELECT Id,Name,Email,Phone FROM Contact WHERE Name LIKE:searchKey OR Phone LIKE :searchKey LIMIT 10];
            if(!contactList.isEmpty()) {
                return contactList;
            }
            return new List<Contact>();
        }
        catch(Exception ex) {
            throw new AuraHandledException('Error searching contacts: ' + ex.getMessage());
        }  
    }
    @AuraEnabled(cacheable=true)
    public static List<Case> getCases(List<Id> contactIds){
        try {
            if(contactIds==null || contactIds.isEmpty()) {
                return new List<Case>();
            }
            List<Case> caseList = [SELECT Id,CaseNumber,Subject,Status,ContactId,CreatedDate,Priority FROM Case WHERE ContactId IN :contactIds ORDER BY CreatedDate DESC LIMIT 10];
            if(!caseList.isEmpty()) {
                return caseList;
            }
            return new List<Case>();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Task> getTasks(List<Id> contactIds) {
        try{
            if(contactIds==null || contactIds.isEmpty()) {
                return new List<Task>();
            }
            List<Task> taskList = [SELECT Id,Subject,Status,Priority,ActivityDate,CreatedDate,WhoId FROM Task WHERE WhoId IN :contactIds ORDER BY CreatedDate DESC LIMIT 10];
            if(!taskList.isEmpty()) {
                return taskList;
            }
            return new List<Task>();
        }catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}