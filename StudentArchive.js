// A historical view of a student's transactions.
// Designed to implement similar interface as StudentArchive
function StudentArchive(archive, studentInfo, studentPacket) {
    this.id;
    this.archiveId;
    
    this.smsStudentStubId;
    this.name;
    
    
    if(archive != null && studentInfo != null) {
        this.id = archive.getId() + "-" + studentInfo.getData("smsStudentStubId");
        this.archiveId = archive.getId();
        
        this.smsStudentStubId = studentInfo.getData("smsStudentStubId");
        this.name = studentInfo.getData("fullName");
    }
    
    this.balance = 0;
        
    // Compact transactions
    this.transactions = [];
    
    if(studentPacket != null) {
        this.transactions = studentPacket.getTransactions();
        
        if(this.transactions != null) {
            for(var i=0; i<this.transactions.length; i++) {
                this.balance += Number(this.transactions[i].getAmount());
            }
            this.balance = this.balance.toFixed(2);
        }
    }
}
Metis.define(StudentArchive, "StudentArchives", "id", "archiveId", "smsStudentStubId", "name", "balance", "transactions");
Metis.defineSortColumn(StudentArchive, "name", "asc");
Metis.createGettersAndSetters(StudentArchive);