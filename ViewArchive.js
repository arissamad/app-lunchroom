function ViewArchive(archive) {
    
    this.dialog = new FullPageDialog();
    var recordHeader = new RecordHeaderWidget("Viewing archive: " + archive.getName());
	recordHeader.activateRightBorderSection();

	var panel = new HorizontalPanelWidget("right", false);
	new DemotedButtonWidget("Close", this.dialog, "close");
	panel.finish();

	this.dialog.resetInsertPosition();
    
	this.archive = archive;
    
    var loader = new InlineLoadingWidget("Loading students...");
    
    var metisLoader = new MetisLoader("StudentArchives");
    metisLoader.setFilters([new EqFilter("archiveId", archive.getId())]);
    
    Metis.load(metisLoader, this, function() {
        var studentArchives = metisLoader.getList();
        loader.close();
        
        this.renderStudentTable(studentArchives);
    });
}

ViewArchive.prototype.renderStudentTable = function(studentArchives) {
    
    if(studentArchives.length == 0) {
        new TextWidget("No students in this archive.");
        return;
    }
    
    var studentTable = new DataTableWidget(this);
    
    studentTable.addHeader("Student", "name");
    studentTable.addColumn();
    
    studentTable.addHeader("Balance", "balance");
    studentTable.addColumn();
    
    studentTable.addHeader("", "actions");
    studentTable.addColumn(function(studentArchive) {
        new ButtonWidget("View Transactions", this, "clickedViewTransactions", studentArchive);
    });
    
    studentTable.renderList(studentArchives);
};

ViewArchive.prototype.clickedViewTransactions = function(studentArchive) {
    new ArchiveTransactionHistory(studentArchive);
}