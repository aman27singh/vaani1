const amountScreen = document.getElementById("amount-screen");
const pinScreen = document.getElementById("pin-screen");
const backToContactsButton = document.getElementById("back-to-contacts-button");
const amountRecipientName = document.getElementById("amount-recipient-name");
const amountRecipientDetail = document.getElementById(
  "amount-recipient-detail"
);
const amountInput = document.getElementById("amount-input");
const payButton = document.getElementById("pay-button");
const pinDots = document.getElementById("pin-dots");
const numpad = document.getElementById("numpad");
const languageScreen = document.getElementById("language-screen");
const setupChoiceScreen = document.getElementById("setup-choice-screen");
const voiceBankSetupScreen = document.getElementById("voice-bank-setup-screen");
const normalBankSetupScreen = document.getElementById(
  "normal-bank-setup-screen"
);
const voiceCommandScreen = document.getElementById("voice-command-screen");
const voiceBankContent = document.getElementById("voice-bank-content");
const bankSearchInput = document.getElementById("bank-search-input");
const bankListContainer = document
  .getElementById("bank-list-container")
  .querySelector(".flex-col");
const dialogOverlay = document.getElementById("dialog-overlay");
const dialogBox = document.getElementById("dialog-box");
const contactSelectionScreen = document.getElementById(
  "contact-selection-screen"
);
const showContactsButton = document.getElementById("show-contacts-button");
const backToMainButton = document.getElementById("back-to-main-button");
const openPhoneContactsButton = document.getElementById("open-phone-contacts");

// --- BUTTON REFERENCES ---
// Initial balance
let balance = 10000;

// Function to format balance as currency
function formatRupees(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Display initial balance
document.addEventListener('DOMContentLoaded', function() {
  const balanceElem = document.getElementById('balance');
  if (balanceElem) {
    balanceElem.textContent = formatRupees(balance);
  }

  // Add event listener for Check Balance button (contact selection screen)
  const checkBalanceButton = document.getElementById('check-balance-button');
  if (checkBalanceButton) {
    checkBalanceButton.addEventListener('click', function(e) {
      e.preventDefault();
      showBalanceDialog();
    });
  }

  // Add event listener for Check Balance button (amount screen)
  const amountScreenCheckBalanceButton = document.querySelector('#amount-screen #check-balance-button');
  if (amountScreenCheckBalanceButton) {
    amountScreenCheckBalanceButton.addEventListener('click', function(e) {
      e.preventDefault();
      showBalanceDialog();
    });
  }
});
const voiceSetupButton = document.getElementById("voice-setup-button");
const normalSetupButton = document.getElementById("normal-setup-button");
const micButton = document.getElementById("mic-button");

// --- DISPLAY TEXT REFERENCES ---
const setupStatus = document.getElementById("setup-status");
const statusText = document.getElementById("status-text");

// --- GLOBAL STATE ---
let currentTransaction = {
  recipient: null,
  amount: null,
};
let pin = "";
let selectedLanguage = "en-IN";
let currentScreen = "language";
let isListening = false;

// --- SPEECH API SETUP ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
const synth = window.speechSynthesis;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = selectedLanguage;
  recognition.interimResults = false;
} else {
  console.error("Speech Recognition not supported in this browser.");
  alert("Sorry, your browser does not support voice commands.");
}

// --- TRANSLATIONS & DATA ---
const translations = {
  "en-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle:
      "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice:
      "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body:
      "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body:
      "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "hi-IN": {
    balance_keywords: ["बैलेंस", "मेरा बैलेंस", "बैलेंस दिखाओ", "बैलेंस चेक करो", "उपलब्ध बैलेंस"],
    balance_response: "आपका उपलब्ध बैलेंस है {balance}",
    pay_button: "भुगतान करें",
    enter_pin: "यूपीआई पिन दर्ज करें",
    pay_contact_title: "पैसे भेजें",
    pay_scan_qr: "क्यूआर स्कैन करें",
    pay_phone_num: "फोन नंबर पे",
    pay_bank: "बैंक पे",
    pay_upi_id: "यूपीआई आईडी पे",
    pay_recents: "हाल के",
    pay_contact_button: "संपर्क को भुगतान करें",
    setup_choice_title: "आप कैसे सेटअप करना चाहेंगे?",
    setup_choice_subtitle:
      "अपनी पसंदीदा विधि चुनें। आप क्लिक कर सकते हैं या अपनी पसंद बोल सकते हैं।",
    speak_setup_choice:
      "आप कैसे सेटअप करना चाहेंगे? आप वॉइस सेटअप, या नॉर्मल सेटअप कह सकते हैं।",
    setup_voice_button: "वॉइस सेटअप",
    command_voice_setup: "voice setup", // Kept simple for easier recognition
    setup_voice_description: "निर्देशन के लिए अपनी आवाज़ का उपयोग करें",
    setup_normal_button: "सामान्य सेटअप",
    command_normal_setup: "normal setup", // Kept simple for easier recognition
    setup_normal_description: "मैन्युअल चरण-दर-चरण प्रक्रिया",
    speak_bank_name:
      "अपना खाता लिंक करने के लिए, कृपया अपने बैंक का नाम बोलें।",
    voice_setup_listening: "बैंक का नाम सुन रहा हूँ...",
    voice_setup_linking: "{bankName} के साथ लिंक हो रहा है...",
    voice_setup_success: "खाता सफलतापूर्वक लिंक हो गया!",
    normal_setup_title: "अपना बैंक चुनें",
    search_placeholder: "अपने बैंक को खोजें...",
    status_ready: "बोलने के लिए माइक्रोफ़ोन पर टैप करें",
    status_listening: "सुन रहा हूँ...",
    status_processing: "✨ सोच रहा हूँ...",
    example_command: 'उदाहरण: "राजू को 50 रुपये भेजें"',
    confirmation_title: "लेन-देन की पुष्टि करें",
    confirmation_body:
      "{recipient} को ₹{amount} भेजने वाले हैं। क्या यह सही है?",
    scam_warning_title: "⚠️ सुरक्षा चेतावनी!",
    scam_warning_body:
      "यह लेन-देन जोखिम भरा लगता है। {reason}। क्या आप वाकई जारी रखना चाहते हैं?",
    dialog_cancel: "रद्द करें",
    dialog_confirm: "पुष्टि करें",
    dialog_proceed: "फिर भी आगे बढ़ें",
  },
  "bn-IN": {
    balance_keywords: ["ব্যালেন্স", "আমার ব্যালেন্স", "ব্যালেন্স দেখাও", "ব্যালেন্স চেক করো", "উপলব্ধ ব্যালেন্স"],
    balance_response: "আপনার উপলব্ধ ব্যালেন্স {balance}",
    pay_button: "পেমেন্ট করুন",
    enter_pin: "UPI পিন লিখুন",
    pay_contact_title: "টাকা পাঠান",
    pay_scan_qr: "QR স্ক্যান করুন",
    pay_phone_num: "ফোন নম্বরে পাঠান",
    pay_bank: "ব্যাংকে পাঠান",
    pay_upi_id: "UPI আইডিতে পাঠান",
    pay_recents: "সাম্প্রতিক",
    pay_contact_button: "কন্টাক্টে টাকা পাঠান",
    setup_choice_title: "আপনি কীভাবে সেটআপ করতে চান?",
    setup_choice_subtitle: "আপনার পছন্দের পদ্ধতি নির্বাচন করুন। আপনি ক্লিক বা বলেও করতে পারেন।",
    speak_setup_choice: "আপনি কীভাবে সেটআপ করতে চান? আপনি Voice Setup বা Normal Setup বলতে পারেন।",
    setup_voice_button: "ভয়েস সেটআপ",
    command_voice_setup: "voice setup",
    setup_voice_description: "নির্দেশনার জন্য আপনার কণ্ঠ ব্যবহার করুন",
    setup_normal_button: "নরমাল সেটআপ",
    command_normal_setup: "normal setup",
    setup_normal_description: "ম্যানুয়াল ধাপে ধাপে প্রক্রিয়া",
    speak_bank_name: "আপনার অ্যাকাউন্ট লিঙ্ক করতে, ব্যাংকের নাম বলুন।",
    voice_setup_listening: "ব্যাংকের নাম শুনছি...",
    voice_setup_linking: "{bankName} এর সাথে লিঙ্ক হচ্ছে...",
    voice_setup_success: "অ্যাকাউন্ট সফলভাবে লিঙ্ক হয়েছে!",
    normal_setup_title: "আপনার ব্যাংক নির্বাচন করুন",
    search_placeholder: "আপনার ব্যাংক খুঁজুন...",
    status_ready: "বলতে মাইক্রোফোনে ট্যাপ করুন",
    status_listening: "শুনছি...",
    status_processing: "✨ ভাবছি...",
    example_command: 'উদাহরণ: "রাজুকে ৫০ টাকা পাঠান"',
    confirmation_title: "লেনদেন নিশ্চিত করুন",
    confirmation_body: "আপনি ₹{amount} {recipient} কে পাঠাতে যাচ্ছেন। এটা কি ঠিক?",
    scam_warning_title: "⚠️ নিরাপত্তা সতর্কতা!",
    scam_warning_body: "এই লেনদেনটি ঝুঁকিপূর্ণ মনে হচ্ছে। {reason}। আপনি কি নিশ্চিতভাবে চালিয়ে যেতে চান?",
    dialog_cancel: "বাতিল করুন",
    dialog_confirm: "নিশ্চিত করুন",
    dialog_proceed: "যাই হোক চালিয়ে যান",
  },
  "mr-IN": {
    balance_keywords: ["शिल्लक", "माझी शिल्लक", "शिल्लक दाखवा", "शिल्लक तपासा", "उपलब्ध शिल्लक"],
    balance_response: "आपली उपलब्ध शिल्लक {balance}",
    pay_button: "पेमेंट करा",
    enter_pin: "UPI पिन प्रविष्ट करा",
    pay_contact_title: "पैसे पाठवा",
    pay_scan_qr: "QR स्कॅन करा",
    pay_phone_num: "फोन नंबरवर पाठवा",
    pay_bank: "बँकेत पाठवा",
    pay_upi_id: "UPI आयडीवर पाठवा",
    pay_recents: "अलीकडील",
    pay_contact_button: "संपर्काला पैसे पाठवा",
    setup_choice_title: "आपण कसे सेटअप करू इच्छिता?",
    setup_choice_subtitle: "आपली पसंतीची पद्धत निवडा. आपण क्लिक किंवा बोलू शकता.",
    speak_setup_choice: "आपण कसे सेटअप करू इच्छिता? आपण Voice Setup किंवा Normal Setup म्हणू शकता.",
    setup_voice_button: "व्हॉइस सेटअप",
    command_voice_setup: "voice setup",
    setup_voice_description: "मार्गदर्शनासाठी आपला आवाज वापरा",
    setup_normal_button: "नॉर्मल सेटअप",
    command_normal_setup: "normal setup",
    setup_normal_description: "मॅन्युअल टप्प्याटप्प्याने प्रक्रिया",
    speak_bank_name: "आपले खाते लिंक करण्यासाठी, कृपया आपल्या बँकेचे नाव बोला.",
    voice_setup_listening: "बँकेचे नाव ऐकत आहे...",
    voice_setup_linking: "{bankName} सोबत लिंक करत आहे...",
    voice_setup_success: "खाते यशस्वीरित्या लिंक झाले!",
    normal_setup_title: "आपली बँक निवडा",
    search_placeholder: "आपली बँक शोधा...",
    status_ready: "बोलण्यासाठी मायक्रोफोनवर टॅप करा",
    status_listening: "ऐकत आहे...",
    status_processing: "✨ विचार करत आहे...",
    example_command: 'उदाहरण: "राजूला ५० रुपये पाठवा"',
    confirmation_title: "व्यवहाराची पुष्टी करा",
    confirmation_body: "आपण ₹{amount} {recipient} ला पाठवणार आहात. हे बरोबर आहे का?",
    scam_warning_title: "⚠️ सुरक्षा सूचना!",
    scam_warning_body: "हा व्यवहार धोकादायक वाटतो. {reason}. आपण नक्कीच पुढे जायचे आहे का?",
    dialog_cancel: "रद्द करा",
    dialog_confirm: "पुष्टी करा",
    dialog_proceed: "तरीही पुढे जा",
  },
  "te-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "ta-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "gu-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "kn-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "ml-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
  "pa-IN": {
    balance_keywords: ["balance", "show balance", "check balance", "my balance", "available balance"],
    balance_response: "Your available balance is {balance}",
    pay_button: "Pay",
    enter_pin: "Enter UPI PIN",
    pay_contact_title: "Send Money",
    pay_scan_qr: "Scan QR",
    pay_phone_num: "Pay Phone No.",
    pay_bank: "Pay Bank",
    pay_upi_id: "Pay UPI ID",
    pay_recents: "Recents",
    pay_contact_button: "Pay a Contact",
    setup_choice_title: "How would you like to set up?",
    setup_choice_subtitle: "Choose your preferred method. You can click or speak your choice.",
    speak_setup_choice: "How would you like to set up? You can say Voice Setup, or Normal Setup.",
    setup_voice_button: "Voice Setup",
    command_voice_setup: "voice setup",
    setup_voice_description: "Use your voice for guidance",
    setup_normal_button: "Normal Setup",
    command_normal_setup: "normal setup",
    setup_normal_description: "Manual step-by-step process",
    speak_bank_name: "To link your account, please say the name of your bank.",
    voice_setup_listening: "Listening for bank name...",
    voice_setup_linking: "Linking with {bankName}...",
    voice_setup_success: "Account Linked Successfully!",
    normal_setup_title: "Select your Bank",
    search_placeholder: "Search for your bank...",
    status_ready: "Tap the microphone to speak",
    status_listening: "Listening...",
    status_processing: "✨ Thinking...",
    example_command: 'Example: "Send 50 rupees to Raju"',
    confirmation_title: "Confirm Transaction",
    confirmation_body: "You are about to send ₹{amount} to {recipient}. Is this correct?",
    scam_warning_title: "⚠️ Security Alert!",
    scam_warning_body: "This transaction looks risky. {reason}. Are you sure you want to continue?",
    dialog_cancel: "CANCEL",
    dialog_confirm: "CONFIRM",
    dialog_proceed: "PROCEED ANYWAY",
  },
};

const banks = [
  {
    name: "State Bank of India",
    logo: "https://placehold.co/40x40/FF5733/FFFFFF?text=SBI",
  },
  {
    name: "HDFC Bank",
    logo: "https://placehold.co/40x40/33FF57/FFFFFF?text=HDFC",
  },
  {
    name: "ICICI Bank",
    logo: "https://placehold.co/40x40/3357FF/FFFFFF?text=ICICI",
  },
  {
    name: "Punjab National Bank",
    logo: "https://placehold.co/40x40/FFFF33/000000?text=PNB",
  },
  {
    name: "Axis Bank",
    logo: "https://placehold.co/40x40/FF33FF/FFFFFF?text=AXIS",
  },
  {
    name: "Bank of Baroda",
    logo: "https://placehold.co/40x40/33FFFF/000000?text=BOB",
  },
  {
    name: "Canara Bank",
    logo: "https://placehold.co/40x40/800000/FFFFFF?text=CB",
  },
  {
    name: "Union Bank of India",
    logo: "https://placehold.co/40x40/000080/FFFFFF?text=UBI",
  },
];

// --- CORE FUNCTIONS ---

function speak(text, onEndCallback = () => {}) {
  if (synth.speaking) {
    synth.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = selectedLanguage;
  utterance.rate = 0.9;
  utterance.onend = onEndCallback;
  synth.speak(utterance);
}

function updateUIText() {
  document.querySelectorAll("[data-translate-key]").forEach((element) => {
    const key = element.getAttribute("data-translate-key");
    const currentTranslations =
      translations[selectedLanguage] || translations["en-IN"];
    const translation = currentTranslations[key];
    if (translation) {
      if (element.tagName === "INPUT") element.placeholder = translation;
      else if (
        element.children.length > 1 &&
        element.querySelector("span:first-child[data-translate-key]")
      ) {
        const mainSpan = element.querySelector("span:first-child");
        const subSpan = element.querySelector("span:last-child");
        const mainKey = mainSpan.getAttribute("data-translate-key");
        const subKey = subSpan.getAttribute("data-translate-key");
        if (mainKey && subKey) {
          mainSpan.textContent =
            currentTranslations[mainKey] || translations["en-IN"][mainKey];
          subSpan.textContent =
            currentTranslations[subKey] || translations["en-IN"][subKey];
        }
      } else element.textContent = translation;
    }
  });
}

function selectLanguage(languageCode) {
  if (synth.speaking) {
    synth.cancel();
  }
  selectedLanguage = languageCode;
  if (recognition) recognition.lang = selectedLanguage;
  updateUIText();
  languageScreen.classList.add("hidden");
  setupChoiceScreen.classList.remove("hidden");
  currentScreen = "setup_choice";
  const instruction = (translations[selectedLanguage] || translations["en-IN"])
    .speak_setup_choice;
  speak(instruction, startListening);
}

function startListening() {
  if (!recognition || isListening) return;
  try {
    recognition.start();
  } catch (error) {
    console.error("Speech recognition could not be started: ", error);
    isListening = false; // Reset listening state on error
  }
}

function proceedToVoiceSetup() {
  if (synth.speaking) {
    synth.cancel();
  }
  setupChoiceScreen.classList.add("hidden");
  voiceBankSetupScreen.classList.remove("hidden");
  currentScreen = "voice_bank_setup";
  const instruction = (translations[selectedLanguage] || translations["en-IN"])
    .speak_bank_name;
  updateVoiceBankUI("initial");
  speak(instruction, startListening);
}

function proceedToNormalSetup() {
  if (synth.speaking) {
    synth.cancel();
  }
  setupChoiceScreen.classList.add("hidden");
  normalBankSetupScreen.classList.remove("hidden");
  currentScreen = "normal_bank_setup";
  populateBankList(banks);
}

function populateBankList(bankData) {
  bankListContainer.innerHTML = "";
  bankData.forEach((bank) => {
    const button = document.createElement("button");
    button.className =
      "w-full flex items-center gap-4 p-3 bg-white/10 border border-white/20 rounded-xl transition-all hover:bg-white/20";
    button.innerHTML = `
            <img src="${bank.logo}" alt="${bank.name}" class="bank-logo rounded-full">
            <span class="text-lg font-semibold">${bank.name}</span>
        `;
    button.onclick = () => {
      if (synth.speaking) {
        synth.cancel();
      }
      // NEW: Go to contact selection, not the mic screen
      normalBankSetupScreen.classList.add("hidden");
      contactSelectionScreen.classList.remove("hidden");
      currentScreen = "contact_selection";
      updateUIText();
    };
    bankListContainer.appendChild(button);
  });
}

function updateVoiceBankUI(state, bankName = "") {
  let content = "";
  const currentTranslations =
    translations[selectedLanguage] || translations["en-IN"];
  switch (state) {
    case "initial":
      content = `<div class="mb-8 animate-fade-in-up"><svg class="w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" /></svg></div><h1 class="text-3xl font-bold animate-fade-in-up delay-200">${currentTranslations.speak_bank_name}</h1>`;
      break;
    case "linking":
      content = `<div class="mb-8 animate-spin"><svg class="w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3a9 9 0 100 18 9 9 0 000-18z" opacity=".25"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".75"/></svg></div><h1 class="text-3xl font-bold">${currentTranslations.voice_setup_linking.replace(
        "{bankName}",
        bankName
      )}</h1>`;
      break;
    case "success":
      content = `<div class="mb-8"><svg class="w-20 h-20 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h1 class="text-3xl font-bold">${currentTranslations.voice_setup_success}</h1>`;
      break;
  }
  voiceBankContent.innerHTML = content;
}

// --- EVENT LISTENERS & HANDLERS ---
// --- NEW EVENT LISTENERS ---

// On the Amount Screen, handles the "Back" button
backToContactsButton.addEventListener('click', () => {
    amountScreen.classList.add('hidden');
    contactSelectionScreen.classList.remove('hidden');
    currentScreen = 'contact_selection';
});

// On the Amount Screen, handles the "Pay" button
payButton.addEventListener('click', () => {
  const amount = amountInput.value;
  const amountValue = parseFloat(amount);
  if (!amount || isNaN(amountValue) || amountValue <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  if (amountValue > balance) {
    showInsufficientBalanceDialog(amountValue);
    return;
  }
  currentTransaction.amount = amountValue; // Store the amount
  // Go to PIN screen
  amountScreen.classList.add('hidden');
  pinScreen.classList.remove('hidden');
  currentScreen = 'pin_entry';
  buildNumpad(); // Create the numpad
});

// --- END OF NEW LISTENERS ---
// Show insufficient balance dialog
function showInsufficientBalanceDialog(requestedAmount) {
  const dialogOverlay = document.getElementById('dialog-overlay');
  const dialogBox = document.getElementById('dialog-box');
  dialogBox.innerHTML = `
    <h3 class="text-xl font-bold mb-4 text-red-600">Insufficient Balance</h3>
    <p class="mb-6 text-lg">You tried to send <span class="font-bold">${formatRupees(requestedAmount)}</span> but your available balance is <span class="font-bold">${formatRupees(balance)}</span>.</p>
    <div class="flex justify-end gap-3">
      <button onclick="closeDialog()" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">OK</button>
    </div>
  `;
  dialogOverlay.classList.remove('hidden');
  dialogOverlay.classList.add('flex');
}

// Show balance dialog
function showBalanceDialog() {
  const dialogOverlay = document.getElementById('dialog-overlay');
  const dialogBox = document.getElementById('dialog-box');
  dialogBox.innerHTML = `
    <h3 class="text-xl font-bold mb-4 text-green-600">Your Balance</h3>
    <p class="mb-6 text-lg">Available balance: <span class="font-bold">${formatRupees(balance)}</span></p>
    <div class="flex justify-end gap-3">
      <button onclick="closeDialog()" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">OK</button>
    </div>
  `;
  dialogOverlay.classList.remove('hidden');
  dialogOverlay.classList.add('flex');
}
voiceSetupButton.addEventListener("click", proceedToVoiceSetup);
normalSetupButton.addEventListener("click", proceedToNormalSetup);
showContactsButton.addEventListener("click", () => {
  if (synth.speaking) {
    synth.cancel();
  }
  voiceCommandScreen.classList.add("hidden");
  contactSelectionScreen.classList.remove("hidden");
  currentScreen = "contact_selection";
  updateUIText();
});

backToMainButton.addEventListener("click", () => {
  if (synth.speaking) {
    synth.cancel();
  }
  contactSelectionScreen.classList.add("hidden");
  voiceCommandScreen.classList.remove("hidden");
  currentScreen = "voice_command";
  updateUIText();
});

// This uses a modern browser API to open the phone's native contact list
openPhoneContactsButton.addEventListener("click", async () => {
  if ("contacts" in navigator && "select" in navigator.contacts) {
    try {
      const contacts = await navigator.contacts.select(["name", "tel"], {
        multiple: false,
      });
      if (contacts.length > 0) {
        const contact = contacts[0];
        // We have the contact! Let's show a confirmation.
        // We'll pre-fill the name and ask the user to speak the amount.
        // NEW: Store the contact and go to the Amount screen
goToAmountScreen(contact.name[0]);
      }
    } catch (ex) {
      console.error("Contact picker error:", ex);
      alert("Your browser does not support the Contact Picker API.");
    }
  } else {
    alert("Your browser does not support the Contact Picker API.");
  }
});

bankSearchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm)
  );
  populateBankList(filteredBanks);
});

if (micButton)
  micButton.addEventListener("click", () => {
    if (synth.speaking) {
      synth.cancel();
    }
    // Remove any leftover handlers before starting Gemini listening
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    }
    if (!isListening) {
      currentScreen = "voice_command";
      // Set up Gemini API handler for voice commands
      if (recognition) {
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          if (event.results[0].isFinal) {
            handleVoiceInput(transcript.trim().toLowerCase());
          }
        };
        recognition.onend = function() {
          isListening = false;
          micButton.classList.remove("bg-red-500", "listening-pulse");
          micButton.classList.add("bg-blue-600");
          statusText.textContent = (translations[selectedLanguage] || translations["en-IN"]).status_ready;
        };
        recognition.onerror = function(event) {
          console.error("Speech recognition error", event.error);
          isListening = false;
        };
      }
      startListening();
    } else {
      recognition.stop();
    }
  });

if (recognition) {
  recognition.onstart = () => {
    isListening = true;
    const currentTranslations =
      translations[selectedLanguage] || translations["en-IN"];
    if (currentScreen === "setup_choice") {
      setupStatus.textContent = currentTranslations.status_listening;
    } else if (currentScreen === "voice_command") {
      micButton.classList.add("bg-red-500", "listening-pulse");
      micButton.classList.remove("bg-blue-600");
      statusText.textContent = currentTranslations.status_listening;
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (event.results[0].isFinal) {
      handleVoiceInput(transcript.trim().toLowerCase());
    }
  };

  recognition.onend = () => {
    isListening = false;
    const currentTranslations =
      translations[selectedLanguage] || translations["en-IN"];
    if (currentScreen === "setup_choice") setupStatus.textContent = "";
    else if (currentScreen === "voice_command") {
      micButton.classList.remove("bg-red-500", "listening-pulse");
      micButton.classList.add("bg-blue-600");
      statusText.textContent = currentTranslations.status_ready;
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    isListening = false;
  };
}

function handleVoiceInput(transcript) {
  const currentTranslations =
    translations[selectedLanguage] || translations["en-IN"];
  if (currentScreen === "setup_choice") {
    if (transcript.includes(currentTranslations.command_voice_setup))
      proceedToVoiceSetup();
    else if (transcript.includes(currentTranslations.command_normal_setup))
      proceedToNormalSetup();
  } else if (currentScreen === "voice_bank_setup") {
    updateVoiceBankUI("linking", transcript);
    setTimeout(() => {
      updateVoiceBankUI("success");
      setTimeout(() => {
        voiceBankSetupScreen.classList.add("hidden");
        voiceCommandScreen.classList.remove("hidden");
        currentScreen = "voice_command";
        updateUIText();
      }, 1500);
    }, 2500);
  } else if (currentScreen === "voice_command") {
    handleMainCommand(transcript);
  }
}

// --- GEMINI API & MAIN COMMAND LOGIC ---
const API_KEY = "AIzaSyCDYJ6OiuUZCZbX8BfNg2tibw7UNWGmtJo"; // Updated API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

async function callGeminiAPI(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function parseCommandWithGemini(text) {
  // Improved prompt for multi-language support
  const systemPrompt = `You are an expert system for parsing financial voice commands. The user's query may be in any language, specified by the language code. Extract the amount (in numbers) and the recipient from the user's query, regardless of language. Respond ONLY with a JSON object with \"amount\" and \"recipient\". If you cannot determine the details, respond with a JSON object where both are null. Example response: {\"amount\":10,\"recipient\":\"Raju\"}`;
  const userQuery = `Language code: ${selectedLanguage}. Query: "${text}". Please reply in JSON only.`;
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: "application/json" },
  };
  let jsonString;
  try {
    jsonString = await callGeminiAPI(payload);
    console.log("Gemini API raw response:", jsonString);
    // Try to parse JSON, fallback if it fails
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse Gemini response as JSON:", err, jsonString);
      // Try to extract JSON from a string if possible
      const match = jsonString.match(/\{[^}]+\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err2) {
          console.error("Still failed to parse extracted JSON:", err2, match[0]);
          parsed = { amount: null, recipient: null };
        }
      } else {
        parsed = { amount: null, recipient: null };
      }
    }
    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);
    return { amount: null, recipient: null };
  }
}

async function checkForScamWithGemini(details) {
  const systemPrompt = `You are a financial security expert. Analyze the transaction details for potential signs of a scam. Consider common scam tactics like unexpected lottery wins, urgent KYC updates, threats, or payments to unknown officials. Respond ONLY with a JSON object with "is_scam" (boolean) and "reason" (a brief explanation in the specified language if it is a scam, otherwise null).`;
  const userQuery = `Language code: ${selectedLanguage}. Transaction: Send ${details.amount} to ${details.recipient}`;
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: "application/json" },
  };
  const jsonString = await callGeminiAPI(payload);
  return JSON.parse(jsonString);
}

async function handleMainCommand(transcript) {
  if (transcript.trim().length < 3) return;
  const currentTranslations =
    translations[selectedLanguage] || translations["en-IN"];
  statusText.textContent = currentTranslations.status_processing;

  // Check for balance inquiry (multi-language)
  const balanceKeywords = currentTranslations.balance_keywords || ["balance"];
  // Normalize transcript for language and whitespace
  const normalizedTranscript = transcript.trim().toLowerCase();
  const isBalanceQuery = balanceKeywords.some(keyword => normalizedTranscript.includes(keyword.toLowerCase()));
  if (isBalanceQuery) {
    const balanceText = (currentTranslations.balance_response || "Your available balance is {balance}")
      .replace("{balance}", formatRupees(balance));
    speak(balanceText);
    statusText.textContent = balanceText;
    return;
  }

  // Check for QR scan command (multi-language)
  const scanQrKeywords = ["scan qr", "qr code", "scan the qr", "qr pay", "scan to pay", "qr स्कैन", "क्यूआर स्कैन", "qr স্ক্যান", "qr স্কॅন", "qr స్కాన్", "qr ஸ்கேன்", "qr સ્કેન", "qr ಸ್ಕ್ಯಾನ್"];
  if (scanQrKeywords.some(keyword => normalizedTranscript.includes(keyword))) {
    statusText.textContent = "Opening QR scanner...";
    speak("Opening QR scanner. Please show the QR code to the camera.");
    // Dynamically load and start QR scanner
    if (window.startQrScanner) {
      window.startQrScanner(function(decodedText) {
        // Handle scanned QR code result (e.g., show dialog or fill UPI field)
        dialogBox.innerHTML = `<h3 class='text-xl font-bold mb-4'>QR Code Scanned</h3><p class='mb-6 text-lg'>${decodedText}</p><div class='flex justify-end gap-3'><button onclick='closeDialog()' class='px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300'>OK</button></div>`;
        dialogOverlay.classList.remove("hidden");
        dialogOverlay.classList.add("flex");
      }, function(errorMessage) {
        dialogBox.innerHTML = `<h3 class='text-xl font-bold mb-4 text-red-600'>QR Scan Error</h3><p class='mb-6 text-lg'>${errorMessage}</p><div class='flex justify-end gap-3'><button onclick='closeDialog()' class='px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300'>OK</button></div>`;
        dialogOverlay.classList.remove("hidden");
        dialogOverlay.classList.add("flex");
      });
    } else {
      dialogBox.innerHTML = `<h3 class='text-xl font-bold mb-4 text-red-600'>Error</h3><p class='mb-6 text-lg'>QR scanner module not loaded.</p><div class='flex justify-end gap-3'><button onclick='closeDialog()' class='px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300'>OK</button></div>`;
      dialogOverlay.classList.remove("hidden");
      dialogOverlay.classList.add("flex");
    }
    return;
  }

  try {
    const parsedDetails = await parseCommandWithGemini(transcript);
    console.log("Parsed command details:", parsedDetails);
    if (!parsedDetails || !parsedDetails.amount) {
      speak(
        "Sorry, I didn't catch the amount. Please try again."
      );
      statusText.textContent = "Sorry, I didn't understand that.";
      // Show error dialog for user
      dialogBox.innerHTML = `
        <h3 class=\"text-xl font-bold mb-4 text-red-600\">Error</h3>
        <p class=\"mb-6 text-lg\">Could not extract amount from your command. Please try again and speak clearly.</p>
        <div class=\"flex justify-end gap-3\">
          <button onclick=\"closeDialog()\" class=\"px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300\">OK</button>
        </div>
      `;
      dialogOverlay.classList.remove("hidden");
      dialogOverlay.classList.add("flex");
      return;
    }
    // Use dummy recipient if not found
    if (!parsedDetails.recipient) {
      parsedDetails.recipient = "Recipient";
    }

    const scamCheck = await checkForScamWithGemini(parsedDetails);
    if (scamCheck && scamCheck.is_scam) {
      showScamWarning(parsedDetails, scamCheck.reason);
    } else {
      showConfirmation(parsedDetails);
    }
  } catch (error) {
    console.error("Error processing command with Gemini:", error);
    speak("Sorry, there was a problem. Please try again.");
    statusText.textContent = "An error occurred.";
    dialogBox.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-red-600">Error</h3>
      <p class="mb-6 text-lg">A technical error occurred while processing your command. Please try again later.</p>
      <div class="flex justify-end gap-3">
        <button onclick="closeDialog()" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">OK</button>
      </div>
    `;
    dialogOverlay.classList.remove("hidden");
    dialogOverlay.classList.add("flex");
  }
}

function showConfirmation(details) {
  // Store details for later use in confirmTransaction
  window._lastConfirmedDetails = details;
  const currentTranslations =
    translations[selectedLanguage] || translations["en-IN"];
  const title = currentTranslations.confirmation_title;
  const body = currentTranslations.confirmation_body
    .replace("{amount}", details.amount)
    .replace("{recipient}", details.recipient);

  dialogBox.innerHTML = `
        <h3 class="text-2xl font-bold mb-6">${title}</h3>
        <p class="text-xl mb-8">${body}</p>
        <div id="confirm-note-breakdown" class="flex flex-wrap gap-6 items-center justify-center mb-6"></div>
        <div class="flex justify-end gap-4 mt-6">
            <button onclick="closeDialog()" class="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-200 text-lg">${currentTranslations.dialog_cancel}</button>
            <button onclick="confirmTransaction()" class="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-lg font-bold">${currentTranslations.dialog_confirm}</button>
        </div>
    `;
  // Enlarge dialog box
  dialogBox.style.maxWidth = '600px';
  dialogBox.style.width = '95%';
  dialogBox.style.minHeight = '420px';
  // Inject note breakdown images
  setTimeout(() => {
    const noteBreakdownElem = document.getElementById('confirm-note-breakdown');
    if (noteBreakdownElem && details.amount) {
      const notes = [2000, 500, 200, 100, 50, 20, 10];
      let remaining = details.amount;
      noteBreakdownElem.innerHTML = '';
      notes.forEach(note => {
        const count = Math.floor(remaining / note);
        if (count > 0) {
          const img = document.createElement('img');
          img.src = `notes/${note}.png`;
          img.alt = `₹${note} note`;
          img.style.width = '320px';
          img.style.height = 'auto';
          img.style.borderRadius = '20px';
          img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
          img.style.background = '#fff';
          img.style.padding = '14px';
          img.style.border = '4px solid #4F46E5';
          img.style.marginBottom = '12px';
          const label = document.createElement('div');
          label.textContent = `x${count}`;
          label.style.textAlign = 'center';
          label.style.fontWeight = 'bold';
          label.style.color = '#222';
          label.style.fontSize = '1.7rem';
          label.style.marginTop = '14px';
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'center';
          wrapper.style.margin = '0 24px';
          wrapper.appendChild(img);
          wrapper.appendChild(label);
          noteBreakdownElem.appendChild(wrapper);
          remaining -= note * count;
        }
      });
      if (remaining > 0) {
        const coinLabel = document.createElement('div');
        coinLabel.textContent = `Coins/Other: ₹${remaining}`;
        coinLabel.style.fontWeight = 'bold';
        coinLabel.style.color = '#555';
        coinLabel.style.fontSize = '1.2rem';
        coinLabel.style.marginLeft = '20px';
        noteBreakdownElem.appendChild(coinLabel);
      }
    }
  }, 0);
  // Inject note breakdown images
  setTimeout(() => {
    const noteBreakdownElem = document.getElementById('confirm-note-breakdown');
    if (noteBreakdownElem && details.amount) {
      const notes = [2000, 500, 200, 100, 50, 20, 10];
      let remaining = details.amount;
      noteBreakdownElem.innerHTML = '';
      notes.forEach(note => {
        const count = Math.floor(remaining / note);
        if (count > 0) {
          const img = document.createElement('img');
          img.src = `notes/${note}.png`;
          img.alt = `₹${note} note`;
          img.style.width = '120px';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          const label = document.createElement('div');
          label.textContent = `x${count}`;
          label.style.textAlign = 'center';
          label.style.fontWeight = 'bold';
          label.style.color = '#333';
          label.style.marginTop = '4px';
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'center';
          wrapper.appendChild(img);
          wrapper.appendChild(label);
          noteBreakdownElem.appendChild(wrapper);
          remaining -= note * count;
        }
      });
      if (remaining > 0) {
        const coinLabel = document.createElement('div');
        coinLabel.textContent = `Coins/Other: ₹${remaining}`;
        coinLabel.style.fontWeight = 'bold';
        coinLabel.style.color = '#555';
        coinLabel.style.marginLeft = '12px';
        noteBreakdownElem.appendChild(coinLabel);
      }
    }
  }, 0);
  dialogOverlay.classList.remove("hidden");
  dialogOverlay.classList.add("flex");
    // Speak confirmation and start listening for voice response
    setTimeout(() => {
      speak(body, () => {
        startVoiceConfirmation();
      });
    }, 300);
  }

  function startVoiceConfirmation() {
    if (!recognition) return;
    // Always set up fresh event handlers for confirmation
    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      console.log('[Voice Confirmation] Heard:', transcript);
  const confirmWords = [
    "yes","confirm","y","ok","sure","haan","हाँ","confirm payment","pay","correct","right","sahi","सही है","ठीक है"
  ]; 
      const cancelWords = ["no","cancel","n","not","nahin","नहीं","don't pay","do not pay","cancel payment"];
      if (confirmWords.some(word => transcript.includes(word))) {
        console.log('[Voice Confirmation] Confirm detected, stopping mic and confirming payment.');
        recognition.stop();
        confirmTransaction();
      } else if (cancelWords.some(word => transcript.includes(word))) {
        console.log('[Voice Confirmation] Cancel detected, stopping mic and closing dialog.');
        recognition.stop();
        closeDialog();
      } else {
        console.log('[Voice Confirmation] No match, waiting for next input.');
      }
    };
    recognition.onend = function() {
      isListening = false;
    };
    try {
      recognition.start();
      isListening = true;
    } catch (error) {
      console.error("Speech recognition could not be started for confirmation:", error);
      isListening = false;
    }
}

function showScamWarning(details, reason) {
  const currentTranslations =
    translations[selectedLanguage] || translations["en-IN"];
  const title = currentTranslations.scam_warning_title;
  const body = currentTranslations.scam_warning_body.replace(
    "{reason}",
    reason
  );

  dialogBox.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
            <svg class="w-12 h-12 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <h3 class="text-xl font-bold text-red-600">${title}</h3>
        </div>
        <p class="mb-6 text-lg">${body}</p>
        <div class="flex justify-end gap-3">
            <button onclick="closeDialog()" class="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200">${currentTranslations.dialog_cancel}</button>
            <button onclick="confirmTransaction()" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">${currentTranslations.dialog_proceed}</button>
        </div>
    `;
  dialogOverlay.classList.remove("hidden");
  dialogOverlay.classList.add("flex");
}

function closeDialog() {
  // Remove all recognition event handlers and reset mic state
  if (recognition) {
    recognition.onresult = null;
    recognition.onend = null;
    recognition.onerror = null;
    try {
      recognition.stop();
    } catch (e) {}
  }
  if (micButton) {
    micButton.classList.remove('bg-red-500', 'listening-pulse');
    micButton.classList.add('bg-blue-600');
  }
  isListening = false;
  dialogOverlay.classList.add("hidden");
  dialogOverlay.classList.remove("flex");
  // Always return to voice assistant screen after transaction dialog
  voiceCommandScreen.classList.remove("hidden");
  currentScreen = "voice_command";
  statusText.textContent = (
    translations[selectedLanguage] || translations["en-IN"]
  ).status_ready;
  // Automatically start listening for next Gemini command
  setTimeout(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        isListening = true;
      } catch (error) {
        console.error("Could not restart voice recognition after transaction:", error);
        isListening = false;
      }
    }
  }, 500);
}

function confirmTransaction() {
  // Simulate successful transaction
  closeDialog();
  // Use details from the last confirmation dialog (voice or manual)
  let details = window._lastConfirmedDetails || currentTransaction;
  if (details && typeof details.amount === 'number') {
    balance -= details.amount;
    if (balance < 0) balance = 0;
    const balanceElem = document.getElementById('balance');
    if (balanceElem) {
      balanceElem.textContent = formatRupees(balance);
    }
  }
  showPaymentSuccessScreen(details);
}

function showPaymentSuccessScreen(details) {
  // Hide all screens
  document.querySelectorAll('.screen-container').forEach(el => el.classList.add('hidden'));
  const successScreen = document.getElementById('payment-success-screen');
  successScreen.classList.remove('hidden');

  // Fill in fake transaction details
  document.getElementById('success-recipient').textContent = details.recipient || 'Recipient';
  document.getElementById('success-amount').textContent = formatRupees(details.amount || 0);
  document.getElementById('success-txn-id').textContent = generateFakeTxnId();
  document.getElementById('success-date').textContent = formatFakeDate();
  document.getElementById('success-bank-ref').textContent = generateFakeBankRef();

  // Show note breakdown images
  const noteBreakdownElem = document.getElementById('note-breakdown');
  if (noteBreakdownElem && details.amount) {
    // List of available notes in descending order
    const notes = [2000, 500, 200, 100, 50, 20, 10];
    let remaining = details.amount;
    noteBreakdownElem.innerHTML = '';
    notes.forEach(note => {
      const count = Math.floor(remaining / note);
      if (count > 0) {
        const img = document.createElement('img');
        img.src = `notes/${note}.png`;
        img.alt = `₹${note} note`;
        img.style.width = '80px';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        const label = document.createElement('div');
        label.textContent = `x${count}`;
        label.style.textAlign = 'center';
        label.style.fontWeight = 'bold';
        label.style.color = '#333';
        label.style.marginTop = '4px';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(label);
        noteBreakdownElem.appendChild(wrapper);
        remaining -= note * count;
      }
    });
    if (remaining > 0) {
      // Show coins or remainder
      const coinLabel = document.createElement('div');
      coinLabel.textContent = `Coins/Other: ₹${remaining}`;
      coinLabel.style.fontWeight = 'bold';
      coinLabel.style.color = '#555';
      coinLabel.style.marginLeft = '12px';
      noteBreakdownElem.appendChild(coinLabel);
    }
  }

  // Done button returns to main/contact selection
  document.getElementById('success-done-button').onclick = function() {
    successScreen.classList.add('hidden');
    voiceCommandScreen.classList.remove('hidden');
    currentScreen = 'voice_command';
    updateUIText();
    // Reset mic button color and state
    if (micButton) {
      micButton.classList.remove('bg-red-500', 'listening-pulse');
      micButton.classList.add('bg-blue-600');
    }
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch (e) {}
    }
    isListening = false;
  };
}

function generateFakeTxnId() {
  return Math.random().toString(36).substring(2, 12).toUpperCase() + 'VAANI';
}
function formatFakeDate() {
  const now = new Date();
  return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function generateFakeBankRef() {
  return 'VAANI' + Math.floor(Math.random() * 1000000);
}
// --- NEW FUNCTIONS FOR PIN/AMOUNT FLOW ---

// Called when a user clicks a contact (e.g., 'Raju')
function goToAmountScreen(recipientName) {
    // Store the transaction details
    currentTransaction.recipient = recipientName;
    
    // Update the UI
    amountRecipientName.textContent = recipientName;
    amountRecipientDetail.textContent = `Paying ${recipientName}`;
    amountInput.value = ''; // Clear old amount
    
    // Show the new screen
    contactSelectionScreen.classList.add('hidden');
    amountScreen.classList.remove('hidden');
    currentScreen = 'amount_entry';
    amountInput.focus(); // Focus the input field
}

// Called to build the numpad on the PIN screen
function buildNumpad() {
    numpad.innerHTML = '';
    pin = ''; // Reset pin
    const pinDotsElements = pinDots.querySelectorAll('.pin-dot');
    pinDotsElements.forEach(dot => dot.classList.remove('filled'));

    // Numpad buttons (1-9, C, 0, <)
    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '<'];

    buttons.forEach(item => {
        const button = document.createElement('button');
        button.className = 'numpad-button';
        button.textContent = String(item);
        
        button.onclick = () => handleNumpad(item);
        numpad.appendChild(button);
    });
}

// Handles a numpad button press
function handleNumpad(item) {
    const pinDotsElements = pinDots.querySelectorAll('.pin-dot');

    if (item === 'C') { // Clear
        pin = '';
    } else if (item === '<') { // Delete
        if (pin.length > 0) {
            pin = pin.slice(0, -1);
        }
    } else if (pin.length < 4) { // Add number
        pin += item;
    }
    
    // Update the dots
    pinDotsElements.forEach((dot, i) => {
        if (i < pin.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });

    // If PIN is 4 digits, simulate transaction
    if (pin.length === 4) {
        console.log(`PIN entered: ${pin} (Simulated)`);
        // PIN entry is done, now show confirmation dialog
        pinScreen.classList.add('hidden');
        currentScreen = 'voice_command'; // Go back to main
        
        // Use the data we stored to show the *real* confirmation
        showConfirmation(currentTransaction);
    }
}