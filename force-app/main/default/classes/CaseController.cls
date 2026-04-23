public with sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getAllCases(){
        try {
           List<Case> allCaseList = [
            SELECT Id,CaseNumber,Status,Priority,ParentId,Parent.CaseNumber,Parent.Status,Parent.Priority FROM Case WHERE ParentId!=NULL 
           ];
           return allCaseList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
   
    @AuraEnabled(cacheable=true)
    public static List<Case> getRecordCases(Id recordId){
        try {
            List<Case> childCaseList = [
                SELECT Id,CaseNumber,Status,Priority,ParentId,Parent.CaseNumber,Parent.Status,Parent.Priority FROM Case WHERE ParentId = :recordId 
            ];
            return childCaseList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}

