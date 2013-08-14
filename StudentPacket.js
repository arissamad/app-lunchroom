// 1-1 relationship to a student PER period.
// When a period is closed, and a new one started, the StudentPacket will be retired. New ones will be created.
function StudentPacket() {
    this.smsStudentStubId;
    this.balance = 0;
    
    this.nextTransactionId = 0;
    
    // An array of CompactTransactions
	this.transactions = [];
}
Metis.define(StudentPacket, "StudentPackets", "smsStudentStubId", "balance", "nextTransactionId", "transactions");
Metis.createGettersAndSetters(StudentPacket);

StudentPacket.prototype.add = function(transaction) {
    
    var tx = new CompactTransaction();
    tx.setId(transaction.getId());
    
    if(transaction.type == "payment") {
        tx.setAmount("" + transaction.getAmount());
    } else if(transaction.type == "charge") {
        var inverse = -Number(transaction.getAmount());
        tx.setAmount("" + inverse);
    } else {
        throw new Error("Something wrong");
    }
    
    this.transactions.push(tx);
}

StudentPacket.prototype.setBalance = function(balance) {
    this.balance = "" + balance;
}

StudentPacket.prototype.delete = function(chargeOrPayment) {
    for(var i=0; i<this.transactions.length; i++) {
        var tx = this.transactions[i];
        if(tx.getId() == chargeOrPayment.getId()) {
            tx.splice(i, 1);
            return;
        }
    }
}