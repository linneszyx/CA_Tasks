trigger OpportunityTrigger on Opportunity (
    after insert,
    after update,
    after delete,
    after undelete
) {
    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUndelete) {
            OpportunityHandler.handleAfterInsert(Trigger.new);
        }

        if (Trigger.isUpdate) {
            OpportunityHandler.handleAfterUpdate(Trigger.new, Trigger.oldMap);
        }

        if (Trigger.isDelete) {
            OpportunityHandler.handleAfterDelete(Trigger.old);
        }
    }
}