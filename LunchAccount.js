function LunchAccount() {
	// Constructor code here
    new PageHeaderWidget("Lunch Account");

    var as = new AttributeSelectorClass();
    as.addAttributes(["smsStudentStubId", "fullName"]);
	
    var tableParameters = new TableParametersDataClass("lunchroom-students", "fullName", 1);
    var searchParameters = new SearchParametersDataClass();

    var rmi = new RMIUtilityClass(new Loadable());
    rmi.setArguments(globalVariables.userObject.getData("id"), as, tableParameters, searchParameters);
	rmi.setSuccessHandler(this, "loadedStudents");
	rmi.remoteBeanCall("SMSStudentGuardianAdmin", "getSMSStudentStubListForGuardians");
}

LunchAccount.prototype.loadedStudents = function(pagedList) {
    this.students = pagedList.getList();
    
    var studentIds = [];
    for(var i=0; i<this.students.length; i++) {
        var student = this.students[i];
        
        studentIds.push(student.getData("smsStudentStubId"));
    }
    
    var metisLoader = new MetisLoader("StudentPackets", studentIds);
    Metis.load(metisLoader, this, function() {
        var studentPackets = metisLoader.getList();
        this.studentPacketLookup = new MapClass();
        
        for(var i=0; i<studentPackets.length; i++) {
            this.studentPacketLookup.put(studentPackets[i].getSmsStudentStubId(), studentPackets[i]);
        }
        this.render();
    });
};

LunchAccount.prototype.render = function() {
    for(var i=0; i<this.students.length; i++) {
        var student = this.students[i];
        
        new HeaderWidget(student.getData("fullName"));
        
        var balance = 0;
        
        var studentPacket = this.studentPacketLookup.get(student.getData("smsStudentStubId"));
        if(studentPacket != null) {
            balance = Number(studentPacket.getBalance());
        }
        
        new TextWidget("Lunch Account Balance: $ " + balance.toFixed(2));
        new SpaceWidget();
        new LinkWidget("See history", this, function(student) {
            var dialog = new TransactionHistory(student, false);
        }, student);
        
        new LineBreakWidget(2);
    }
};