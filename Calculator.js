// Calculates the latest balance
function updateBalance(studentPacket) {
    var transactions = studentPacket.getTransactions();
    
    var total = 0;
    for(var i=0; i<transactions.length; i++) {
        total += transactions.getAmount();
    }
    
    return total;
}