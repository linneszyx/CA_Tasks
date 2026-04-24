    public with sharing class CaseController 
    {
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
                Set<Id> allId = new Set<Id> {recordId};
                Set<id> lvlId = new Set<Id> {recordId};
                while(!lvlId.isEmpty()) {
                    List<Case> child = [SELECT Id FROM Case WHERE ParentId IN : lvlId];
                    lvlId.clear();
                    for(Case c : child) {
                        if(allId.add(c.Id)) 
                        {
                            lvlId.add(c.Id);
                        }
                    }
                }
                List<Case> childCaseList = [SELECT Id,CaseNumber,Status,Priority,Origin,ParentId FROM Case WHERE Id IN :allId];
                return childCaseList;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
    }