trigger OpportunityTrigger on Opportunity (
    after insert,
    after update,
    after delete,
    after undelete
) {
    // if (Trigger.isAfter) {
    //     if (Trigger.isInsert || Trigger.isUndelete) {
    //         OpportunityHandler.handleAfterInsert(Trigger.new);
    //     }

    //     if (Trigger.isUpdate) {
    //         OpportunityHandler.handleAfterUpdate(Trigger.new, Trigger.oldMap);
    //     }

    //     if (Trigger.isDelete) {
    //         OpportunityHandler.handleAfterDelete(Trigger.old);
    //     }
    // }
    // Set<Id> oppIds = new Set<Id>();
    // for(Opportunity opp : Trigger.new) {
    //     Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
    //     if(Trigger.isInsert || opp.Amount!=oldOpp.Amount || opp.Currency_Type__c!=oldOpp.Currency_Type__c) {
    // if(opp.Amount!=null && opp.Currency_Type__c!=null) {
    //     oppIds.add(opp.Id);
    // }
    //     }
    // }
    // if(!oppIds.isEmpty()) {
    //     OpportunityHandler.convertAmount(oppIds);
    // }
   if(Trigger.isAfter) {
    if(Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete) {
        OppServiceAPI.updateAccountAmount(Trigger.new);
    }
    if(Trigger.isDelete) {
        OppServiceAPI.updateAccountAmount(Trigger.old);
    }
   }
}