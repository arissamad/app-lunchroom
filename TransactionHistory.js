function TransactionHistory(studentInfo, showDelete) {
	ClassUtil.mixin(TransactionHistory, this, Refreshable);
	ClassUtil.mixin(TransactionHistory, this, Dialogable);
    
    this.studentInfo = studentInfo;
    
    this.showDelete = true;
    
    if(showDelete != null) this.showDelete = showDelete;

	this.dialog = new FullPageDialog();
	var recordHeader = new RecordHeaderWidget("Transactions for " + studentInfo.getData("fullName"));
	recordHeader.activateRightBorderSection();

	var panel = new HorizontalPanelWidget("right", false);
	new DemotedButtonWidget("Close", this, function() {
        this.dialog.close();
        
        if(this.refreshAction != null) this.refreshAction.call();
	});
	panel.finish();

	this.dialog.resetInsertPosition();
    this.overallTableMarker = new MarkerWidget();

	var metisLoader = new MetisLoader("StudentPackets", studentInfo.getData("smsStudentStubId"));
    
    Metis.load(metisLoader, this, function() {
        var studentPacket = metisLoader.get();
        this.renderOverallTable(studentPacket);
    });
}

TransactionHistory.prototype.renderOverallTable = function(studentPacket) {
    this.overallTableMarker.activate();
    
    if(studentPacket == null) {
        new TextWidget("Student has no transactions (no student packet).");
        return;
    }
    
    var ids = [];
    
    var ctxs = studentPacket.getTransactions();
    for(var i=0; i<ctxs.length; i++) {
        var ctx = ctxs[i];
        ids.push(ctx.getId());
    }
    
    var tp = new TableParametersDataClass();
    tp.setNumberOfItemsPerPage(200);
    
    var transactionLoader = new MetisLoader("Transactions", ids);
    transactionLoader.setTableParameters(tp);
    
    Metis.load(transactionLoader, this, function() {
        var transactions = transactionLoader.getList();
        
        var txLookup = new MapClass();
        for(var i=0; i<transactions.length; i++) {
            var transaction = transactions[i];
            txLookup.put(transaction.getId(), transaction);
        }
        
        var balance = 0;
        
        var txList = [];
        for(var i=0; i<ctxs.length; i++) {
            var ctx = ctxs[i];
            var tx = txLookup.get(ctx.getId());
            txList.push(tx);
            
            balance += Number(ctx.getAmount());
        }
        
        var runningBalance = 0;
        
        var txTable = new DataTableWidget(this);
        txTable.setStyle("compact");
        
        txTable.addHeader("Date", "date", 80);
        txTable.addColumn();
        
        txTable.addHeader("Description", "description");
        txTable.addColumn();
        
        txTable.addHeader("Charge", "charge", 80, {columnAlign: "right"});
        txTable.addColumn(function(tx) {
            if(tx.getType == null) return "null";
            
            if(tx.getType() == "charge") new TextWidget(Number(tx.getAmount()).toFixed(2));
        });
        
        txTable.addHeader("Payment", "payment", 80, {columnAlign: "right"});
        txTable.addColumn(function(tx) {
            if(tx.getType == null) return "null";
            if(tx.getType() == "payment") new TextWidget(Number(tx.getAmount()).toFixed(2));
        });
        
        txTable.addHeader("Balance", "bal", 80, {columnAlign: "right"});
        txTable.addColumn(function(tx) {
            if(tx.getType == null) return "null";
            var sign = 1;
            if(tx.getType() == "charge") sign = -1;
            runningBalance += (sign*Number(tx.getAmount()));
            return "" + runningBalance.toFixed(2);
        });
        
        txTable.addHeader("", "details", 300, {columnAlign: "right"});
        txTable.addColumn(function(tx) {
            if(tx.getType == null) return "null";
            var hpanel = new HorizontalPanelWidget(false);
            var showLink = new LinkWidget("View details", this, function() {
                marker.activate();
                new LineBreakWidget(0.5);
                
                hideLink.show();
                showLink.hide();
                
                this.renderItems(tx);
                new LineBreakWidget();
            });
            var hideLink = new LinkWidget("Hide details", this, function() {
                marker.activate();
                hideLink.hide();
                showLink.show();
            });
            hideLink.hide();
            
            if(tx.getType() == "payment") showLink.hide();
            
            if(tx.getItems() == null || tx.getItems().length == 0) showLink.hide();
            
            if(this.showDelete) {
                new LinkWidget("Delete Transaction", this, "deleteTransaction", tx);
            }
            
            hpanel.finish();
            
            var marker = new MarkerWidget();
        });
        
        txTable.renderList(txList);
        this.txTable = txTable;
        
        new LineBreakWidget(2);
        new HeaderWidget("Ending Balance: $ " + balance.toFixed(2));
        
        this.resaveBalance(studentPacket, balance);
    });   
}

TransactionHistory.prototype.resaveBalance = function(studentPacket, balance) {
    studentPacket.setBalance(balance);
    Metis.save(studentPacket, this, function() {
    });
};

TransactionHistory.prototype.renderItems = function(tx) {
    var table = new DataTableWidget();
    table.setStyle("compact", "minWidth");
    
    table.addHeader("Item");
    table.addColumn(function(item) {
        return item.getDescription();
    });
    
    table.addHeader("Charge");
    table.addColumn(function(item) {
        return item.getAmount();
    });
    
    table.renderList(tx.getItems());
};

TransactionHistory.prototype.deleteTransaction = function(tx) {
    this.currTx = tx;
    var dialog = new Dialog("Delete Transaction");
    
    new TextWidget("Confirm that you'd like to delete this " + tx.getType() + " totalling $ " + tx.getAmount() + ".");
    
    if(tx.getItems() != null && tx.getItems().length > 0) {
        new LineBreakWidget();
        this.renderItems(tx);
    }
    
    dialog.reposition();
    
    dialog.setOkCancel(this, "confirmDelete", "Delete");
};

TransactionHistory.prototype.confirmDelete = function() {
    var metisLoader = new MetisLoader("StudentPackets", this.studentInfo.getData("smsStudentStubId"));
    
    Metis.load(metisLoader, this, function() {
        var studentPacket = metisLoader.get();
        
        var ctxs = studentPacket.getTransactions();
        for(var i=0; i<ctxs.length; i++) {
            var tx = ctxs[i];
            if(tx.getId() == this.currTx.getId()) {
                ctxs.splice(i, 1);
                break;
            }
        }
        
        Metis.save(studentPacket, this, function() {
            Metis.remove(tx, this, function() {
                this.renderOverallTable(studentPacket);
            });    
        });
    });
};