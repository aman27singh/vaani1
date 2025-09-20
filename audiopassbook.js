// audiopassbook.js
// Audio passbook feature: reads out last n transactions using SpeechSynthesis

window.readLastNTransactions = function(n) {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const lastN = transactions.slice(-n).reverse();
  if (lastN.length === 0) {
    window.speakText('You have no transactions in your passbook yet.');
    return;
  }
  let narration = `Hello! Here are your last ${lastN.length} transactions.`;
  narration += lastN.map((tx, i) => {
    const dateStr = new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    return `\n${i+1}. On ${dateStr}, you sent rupees ${tx.amount} to ${tx.recipient}.`;
  }).join('');
  narration += `\nThat's all for your recent transactions. Would you like to hear more?`;
  window.speakText(narration);
}

window.speakText = function(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    window.speechSynthesis.speak(utter);
  } else {
    alert('Speech synthesis not supported in this browser.');
  }
}
