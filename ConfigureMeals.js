function ConfigureMeals() {
	
    new PageHeaderWidget("Configure Meals");
    
    new SearchWidget();
    new QuickAddButtonWidget("Add New Meal", this, "clickedAddMeal");
    new LineBreakWidget();
    
    var mealTable = new DataTableWidget(this, "mealTable");
    
    mealTable.addHeader("Meal", "meal", true, 300);
    mealTable.addColumn(function(meal) {
        return meal.getName();
    });
    
    mealTable.addHeader("Price", "price", true, 400);
    mealTable.addColumn(function(meal) {
        return "$ " + Number(meal.getPrice()).toFixed(2);
    });
    mealTable.renderMetisData(Metis, "Meals");
    this.mealTable = mealTable;
    
    mealTable.setClickHandler(this, function(meal) {
        var dialog = new EditMeal("edit", meal);
        dialog.setRefreshHandler(this, function() {
            this.mealTable.renderMetisData(Metis, "Meals");
        });
    });
}

ConfigureMeals.prototype.clickedAddMeal = function() {
    var dialog = new EditMeal("add");
    dialog.setRefreshHandler(this, function() {
        this.mealTable.refreshTable();
    });
};
