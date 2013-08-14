function StudentListing() {
	// Constructor code here
    new PageHeaderWidget("Lunchroom: Student Listing");
    
    this.currentClassFormId = null;
    
    var attributeSelector = new AttributeSelectorClass();
    attributeSelector.addAttributes(["smsClassFormId", "classFormName"]);
    
    var rmi = new RMIUtilityClass(new Loadable());
	rmi.setSuccessHandler(this, "loadedClassForms");
	rmi.setArguments(attributeSelector);
	rmi.remoteBeanCall("SMSClassFormAdmin", "getSMSClassFormListForClassesInActiveAcademicSemester");
}

StudentListing.prototype.loadedClassForms = function(classForms) {
    this.classForms = classForms;
    
    var formFilter = new FormFilter(this, "filterByClassForm");
    formFilter.add(null, "Show All", true);
    
    for(var i=0; i<this.classForms.length; i++) {
        var classForm = this.classForms[i];
        formFilter.add(classForm, classForm.getData("classFormName"));
    }

    new LineBreakWidget();
    
    this.studentTable = new DataTableWidget(this, "lunchroomStudentListing", "fullName", 1);
    formFilter.getSearchWidget().setTable(this.studentTable);
    
	this.studentTable.addHeader("Student", "fullName", true, true, 400);
	this.studentTable.addColumn($H("<em>" + "${fullName}" + "</em>" +"\n${className} - ${formTeacher}"));
	
	this.studentTable.addHeader("Balance", "balance", false, true, 100);
	this.studentTable.addColumn(function(studentInfo) {
        
        var balanceField = $("<span class='balance-field'>Loading...</span>")
        balanceField.data("studentInfo", studentInfo);
        current.append(balanceField);
	});
	
    this.studentTable.addHeader("", "actions");
    this.studentTable.addColumn(function(studentInfo) {
        var panel = new HorizontalPanelWidget(false);
        
        new ButtonWidget("Add Charge", this, "clickedAddCharge", studentInfo);
        new ButtonWidget("Add Payment", this, "clickedAddPayment", studentInfo);
        new ButtonWidget("View History", this, "clickedViewHistory", studentInfo);
        panel.finish();
    });
    
	this.studentTable.setClickHandler(this, "clickedStudent");
	
	var as = new AttributeSelectorClass();
	as.addAttributes(["smsStudentStubId", "fullName", "className", "formTeacher",
	    	"smsStudentFinancialId", "outstandingAmount", "formattedFinancialTotalOutstanding"]);
	
	this.studentTable.setTableLoader(function(rmi, tableParameters, searchParameters) {
        
        if(this.currentClassFormId != null) {
            rmi.setArguments(this.currentClassFormId, as, tableParameters, searchParameters);
    	    rmi.remoteBeanCall("SMSClassFormAdmin", "getSelectedSMSStudentListForClassForm");
        
        } else {
            
            rmi.setArguments(as, tableParameters, searchParameters);
        	rmi.remoteBeanCall("SMSStudentAdmin", "getAllActiveStudents");    
        }
	});
	
    this.studentTable.setPostRender(this, "fillInBalances");
	this.studentTable.render();
    
    // Load meals and extras
    var metisLoader1 = new MetisLoader("Meals");
    Metis.load(metisLoader1, this, function() {
        this.meals = metisLoader1.getList();
        log("Meals: ", this.meals);
        
        var metisLoader2 = new MetisLoader("Extras");
        Metis.load(metisLoader2, this, function() {
            this.extras = metisLoader2.getList();
            log("Extras: " + this.extras);
        });
    });   
}

StudentListing.prototype.fillInBalances = function() {
    var metisLoaders = [];
    
    var balanceFields = this.studentTable.widget.find(".balance-field");
    for(var i=0; i<balanceFields.length; i++) {
        var balanceField = $(balanceFields[i]);
        var studentInfo = balanceField.data("studentInfo");
        
        var metisLoader = new MetisLoader("StudentPackets", studentInfo.getData("smsStudentStubId"));
        metisLoader.balanceField = balanceField;
        
        metisLoaders.push(metisLoader);
    }
    
    Metis.load(metisLoaders, this, function() {
        for(var i=0; i<metisLoaders.length; i++) {
            var metisLoader = metisLoaders[i];
            var studentPacket = metisLoader.get();
            
            if(studentPacket == null) {
                metisLoader.balanceField.setText("$ 0");
            } else {
                metisLoader.balanceField.setText("$ " + Number(studentPacket.getBalance()).toFixed(2));
            }
        }
    });
    
};

StudentListing.prototype.clickedViewHistory = function(studentInfo) {
    var dialog = new TransactionHistory(studentInfo);
    dialog.setRefreshHandler(this.studentTable, "refreshTable");
}

StudentListing.prototype.clickedAddCharge = function(studentInfo) {
    var dialog = new AddTransaction("add", "charge", studentInfo, this.meals, this.extras);
    dialog.setRefreshHandler(this.studentTable, "refreshTable");
};

StudentListing.prototype.clickedAddPayment = function(studentInfo) {
    var dialog = new AddTransaction("add", "payment", studentInfo);
    dialog.setRefreshHandler(this.studentTable, "refreshTable");
};

StudentListing.prototype.filterByClassForm = function(classForm) {
    if(classForm == null) {
        this.showAll();
        return;
    }
    this.currentClassFormId = classForm.getData("smsClassFormId");
    this.studentTable.refreshTable();
};

StudentListing.prototype.showAll = function() {
    this.currentClassFormId = null;
    this.studentTable.refreshTable();
}