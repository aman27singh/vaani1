// Audio passbook: reads out last n transactions
window.readLastNTransactions = function(n) {
  const transactions = window.getTransactions();
  const lastN = transactions.slice(-n).reverse();
  if (lastN.length === 0) {
    window.speakText('No transactions found.');
    return;
  }
  let narration = lastN.map((tx, i) => {
    return `Transaction ${i+1}: Sent rupees ${tx.amount} to ${tx.recipient} on ${new Date(tx.date).toLocaleString()}.`;
  }).join(' ');
  window.speakText(narration);
}

// Helper to speak text using SpeechSynthesis
window.speakText = function(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    window.speechSynthesis.speak(utter);
  } else {
    alert('Speech synthesis not supported in this browser.');
  }
}
// transaction-history.js
// Handles transaction history modal logic and rendering

window.getTransactions = function() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}

window.renderTransactionHistory = function(container) {
  const transactions = window.getTransactions();
  if (transactions.length === 0) {
    container.innerHTML = '<p class="text-gray-700 text-center">No transactions found.</p>';
  } else {
    container.innerHTML = '<h2 class="text-2xl font-bold mb-4 text-gray-900">Transaction History</h2>' +
      '<div class="flex flex-col gap-3">' +
      transactions.slice().reverse().map(tx =>
        `<div class="bg-white rounded shadow p-3 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-gray-800">
          <span><b>To:</b> <span class="font-semibold">${tx.recipient}</span></span>
          <span><b>Amount:</b> <span class="font-semibold">₹${tx.amount}</span></span>
          <span><b>Date:</b> <span class="font-semibold">${new Date(tx.date).toLocaleString()}</span></span>
        </div>`
      ).join('') + '</div>';
  }
}

window.setupTransactionHistoryModal = function() {
  const viewHistoryMain = document.getElementById('view-history-main');
  const historyModal = document.getElementById('transaction-history-modal');
  const historyDiv = document.getElementById('transaction-history');
  const closeHistoryModal = document.getElementById('close-history-modal');

  if (viewHistoryMain && historyModal && closeHistoryModal) {
    viewHistoryMain.addEventListener('click', function(e) {
      e.preventDefault();
      window.renderTransactionHistory(historyDiv);
      historyModal.classList.remove('hidden');
    });
    closeHistoryModal.addEventListener('click', function() {
      historyModal.classList.add('hidden');
    });
    historyModal.addEventListener('click', function(e) {
      if (e.target === historyModal) {
        historyModal.classList.add('hidden');
      }
    });
  }
}
