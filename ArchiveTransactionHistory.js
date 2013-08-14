function ArchiveTransactionHistory(studentArchive) {
	ClassUtil.mixin(ArchiveTransactionHistory, this, Refreshable);
	ClassUtil.mixin(ArchiveTransactionHistory, this, Dialogable);
    ClassUtil.mixin(ArchiveTransactionHistory, this, TransactionHistory);
    
    this.studentArchive = studentArchive;

	this.dialog = new FullPageDialog();
	var recordHeader = new RecordHeaderWidget("Archived transactions for " + studentArchive.getName());
	recordHeader.activateRightBorderSection();

	var panel = new HorizontalPanelWidget("right", false);
	new DemotedButtonWidget("Close", this.dialog, "close");
	panel.finish();

	this.dialog.resetInsertPosition();
    
    this.overallTableMarker = new MarkerWidget();

    this.renderOverallTable(studentArchive);
}

ArchiveTransactionHistory.prototype.resaveBalance = function(studentPacket, balance) {
    // Do nothing
};