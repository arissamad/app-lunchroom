function CreateArchive(archive, option) {
    ClassUtil.mixin(CreateArchive, this, Refreshable);
    this.archive = archive;
    
    this.transferBalance = true;
    if(option == "reset") {
        this.transferBalance = false;
    }
    
    this.loadingWidget = new LoadingWidget("Archiving lunch orders... This will take a few minutes.");
    
    // First, load all students
    var as = new AttributeSelectorClass();
    as.addAttributes(["smsStudentStubId", "fullName"]);
    
    var tableParameters = new TableParametersDataClass();
    tableParameters.setNumberOfItemsPerPage(1000);
    
    var searchParameters = new SearchParametersDataClass();
    
    var rmi = new RMIUtilityClass(false);
    rmi.setSuccessHandler(this, "loadedStudents");
	rmi.setArguments(as, tableParameters, searchParameters);
    rmi.remoteBeanCall("SMSStudentAdmin", "getAllActiveStudents");
}

CreateArchive.prototype.loadedStudents = function(studentPagedList) {
    students = studentPagedList.getList();
    log("Students: ", students);
    
    var studentMap = new MapClass();
    for(var i=0; i<students.length; i++) {
        var studentInfo = students[i];
        studentMap.put(studentInfo.getData("smsStudentStubId"), studentInfo);
    }
    
    // Now load all student packets
    
    var tp = new TableParametersDataClass();
    tp.setNumberOfItemsPerPage(1000);
    
    var studentPacketLoader = new MetisLoader("StudentPackets");
    studentPacketLoader.setTableParameters(tp);
    
    Metis.load(studentPacketLoader, this, function() {
        var studentPackets = studentPacketLoader.getList();
        
        var studentArchives = [];
        
        for(var i=0; i<studentPackets.length; i++) {
            var studentPacket = studentPackets[i];
            var studentInfo = studentMap.get(studentPacket.getSmsStudentStubId());
            
            if(studentInfo != null) {
                var studentArchive = new StudentArchive(this.archive, studentInfo, studentPacket);
                studentArchives.push(studentArchive);
            }
        }
        
        Metis.save(studentArchives, this, function() {
            // Now save the studentPackets with empty transactions
            this.saveStudentPackets(studentPackets);
        });
    });
};

CreateArchive.prototype.saveStudentPackets = function(studentPackets) {
    var saveList = [];
    
    for(var i=0; i<studentPackets.length; i++) {
        var studentPacket = studentPackets[i];
        
        studentPacket.setTransactions([]);
        
        var currBalance = Number(studentPacket.getBalance());
        
        if(NumberUtil.compareDouble(currBalance, 0) == 0 || this.transferBalance == false) {
            studentPacket.setBalance("0");
        }
        else {
            var nextId = studentPacket.getNextTransactionId();
            studentPacket.setNextTransactionId(nextId+1);
            nextId = nextId + "";
            
            var transaction = new Transaction("payment");
            
            var amount = studentPacket.getBalance();
            
            transaction.setId(nextId);
            transaction.setDescription("Opening Balance");
            transaction.setAmount("" + amount);
            transaction.setItems([]);
            
            studentPacket.add(transaction);
            saveList.push(transaction);
        }
        
        saveList.push(studentPacket);
    }
    
    Metis.save(saveList, this, function(){
        this.loadingWidget.close();
        new MessageDialog("Archive done", "Archiving of lunch orders had been completed.");
        this.refreshAction.call();
    });
};