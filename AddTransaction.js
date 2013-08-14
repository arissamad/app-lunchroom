function AddTransaction(addOrEdit, type, studentInfo, meals, extras) {
    ClassUtil.mixin(AddTransaction, this, Refreshable);
    ClassUtil.mixin(AddTransaction, this, Dialogable);
    
    this.addOrEdit = addOrEdit;
    this.type = type; // "charge" or "payment"
    this.studentInfo = studentInfo;
    this.meals = meals;
    this.extras = extras;
    
    this.items = [];
    
    this.dialog = new FullPageDialog();
    
    var recordHeader;
    if(addOrEdit == "add") {
        recordHeader = new RecordHeaderWidget("Add " + this.type + " for " + studentInfo.getData("fullName"));
    } else {
        recordHeader = new RecordHeaderWidget("Edit " + this.type + " for " + studentInfo.getData("fullName"));
    }
    
    recordHeader.activateRightBorderSection();
    var panel = new HorizontalPanelWidget("right", false);
    
    new EmphasizedButtonWidget("Save", this, "clickedSave");
    new DemotedButtonWidget("Close", this.dialog, "close");
    
    panel.finish();
    
    this.dialog.resetInsertPosition();
    
    if(this.type == "charge") {
        if(this.meals.length > 0 || this.extras.length > 0) {
            var softSection = new SoftSectionWidget();
            
            if(this.meals.length > 0) {
                new HeaderWidget("Meals");
                var hpanel = new HorizontalPanelWidget();
                for(var i=0; i<this.meals.length; i++) {
                    var meal = this.meals[i];
                    new LinkWidget(meal.getName(), this, "clickedAddItem", meal);
                }
                hpanel.finish();
            }
            
            if(this.extras.length > 0) {
                new HeaderWidget("Extras");
                var hpanel = new HorizontalPanelWidget(false);
                for(var i=0; i<this.extras.length; i++) {
                    var extra = this.extras[i];
                    new LinkWidget(extra.getName(), this, "clickedAddItem", extra);
                }
                hpanel.finish();
            }
            
            softSection.finish();
        }
    }
    
    var panel = new QueryPanelWidget(120);
    this.queryFields = new QueryFields(panel, this.extraInfo);
    
    if(this.type == "charge") {
        panel.addLabel("Lunch Order");
    } else if(this.type == "payment") {
        panel.addLabel("Payment Description");
    }
    this.queryFields.put("description", new TextAreaWidget().setGrowable(null, 3), ["notEmpty"]);
    
    panel.addSecondLabel("Total");
    this.queryFields.put("amount", new InputFieldWidget(), ["notEmpty", "numberOnly"]);
    
    this.queryFields.setEnterHandler(this, "clickedSave");
    
    panel.finish();
    
    new LineBreakWidget();
    
    this.itemMarker = new MarkerWidget();
}

AddTransaction.prototype.clickedAddItem = function(meal) {
    var newItem = new ChargeItem();
    newItem.setDescription(meal.getName());
    newItem.setAmount(meal.getPrice());
    
    this.items.push(newItem);
    this.updateCharge();
};

AddTransaction.prototype.updateCharge = function() {
    var str = "";
    var total = 0;
    for(var i=0; i<this.items.length; i++) {
        str += this.items[i].getDescription();
        total += Number(this.items[i].getAmount());
        this.items[i].setId(i + "");
        
        if(i < this.items.length-1) str += "\n";
    }
    
    total = NumberUtil.getFormattedNumber(total, 2);
    
    this.queryFields.setValue("description", str);
    this.queryFields.setValue("amount", total.toFixed(2));
    
    this.itemMarker.activate();
    
    var table = new DataTableWidget(this);
    table.setStyle("compact", "minWidth");
    
    table.addHeader("Description", 300);
    table.addColumn(function(chargeItem) {
        return chargeItem.getDescription();
    });
    
    table.addHeader("Amount", 100, {columnAlign: "right"});
    table.addColumn(function(chargeItem) {
        return Number(chargeItem.getAmount()).toFixed(2);
    });
    
    table.addHeader("Delete", 100, {columnAlign: "center"});
    table.addColumn(function(chargeItem) {
        new ButtonWidget("X", this, "clickedDeleteItem", chargeItem);
    });
    
    table.renderList(this.items);
}

AddTransaction.prototype.clickedSave = function() {
    if(!this.queryFields.verify()) return false;
    
    var metisLoader = new MetisLoader("StudentPackets", this.studentInfo.getData("smsStudentStubId"));
    Metis.load(metisLoader, this, function() {
        
        var studentPacket = metisLoader.get();
        
        if(studentPacket == null) {
            studentPacket = new StudentPacket();
            studentPacket.setSmsStudentStubId(this.studentInfo.getData("smsStudentStubId"));
        }
        
        var nextId = studentPacket.getNextTransactionId();
        studentPacket.setNextTransactionId(nextId+1);
        nextId = nextId + "";
        
        var transaction = new Transaction(this.type);
        
        var amount = this.queryFields.getValue("amount");
        
        transaction.setId(nextId);
        transaction.setDescription(this.queryFields.getValue("description"));
        transaction.setAmount("" + amount);
        transaction.setItems(this.items);
        
        studentPacket.add(transaction);
        
        // Recalculate balance.
        var balance = 0;
        var ctxs = studentPacket.getTransactions();
        for(var i=0; i<ctxs.length; i++) {
            var ctx = ctxs[i];
            balance += Number(ctx.getAmount());
        }
        console.log("New balance " + balance);
        studentPacket.setBalance(balance);
        
        Metis.save([studentPacket, transaction], this, function(){
            this.closeDialogBox();
            this.refreshAction.call();
        });
    });
}

AddTransaction.prototype.clickedDeleteItem = function(chargeItem) {
    for(var i=0; i<this.items.length; i++) {
        if(this.items[i] == chargeItem) {
            this.items.splice(i, 1);
            this.updateCharge();
            return;
        }
    }
}