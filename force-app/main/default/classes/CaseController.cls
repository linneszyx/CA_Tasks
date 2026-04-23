    public with sharing class CaseController {
        @AuraEnabled(cacheable=true)
        public static List<Case> getAllCases(){
            try {
            List<Case> allCaseList = [
               SELECT Id,CaseNumber,Status,Priority,Origin,ParentId FROM Case
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
                    SELECT Id,CaseNumber,Status,Priority,Origin,ParentId FROM Case WHERE Id=:recordId OR ParentId=:recordId
                ];
                return childCaseList;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
    }