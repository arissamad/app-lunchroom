function ConfigureExtras() {
    
    new PageHeaderWidget("Configure Extras");
    
    new SearchWidget();
    new QuickAddButtonWidget("Add New Extra", this, "clickedAddExtra");
    new LineBreakWidget();
    
    var extraTable = new DataTableWidget(this, "extraTable");
    
    extraTable.addHeader("Extra", "name", true, 300);
    extraTable.addColumn(function(extra) {
        return extra.getName();
    });
    
    extraTable.addHeader("Price", "price", true, 400);
    extraTable.addColumn(function(extra) {
        return "$ " + Number(extra.getPrice()).toFixed(2);
    });
    extraTable.renderMetisData(Metis, "Extras");
    this.extraTable = extraTable;
    
    extraTable.setClickHandler(this, function(extra) {
        var dialog = new EditExtra("edit", extra);
        dialog.setRefreshHandler(this, function() {
            this.extraTable.renderMetisData(Metis, "Extras");
        });
    });
}

ConfigureExtras.prototype.clickedAddExtra = function() {
    var dialog = new EditExtra("add");
    dialog.setRefreshHandler(this, function() {
        this.extraTable.refreshTable();
    });
};
