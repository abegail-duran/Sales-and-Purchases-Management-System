exports.generateTransactionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `TXN-${year}${month}${day}-${timestamp}`;
};

exports.generatePurchaseNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `PUR-${year}${month}${day}-${timestamp}`;
};

exports.generateCustomerId = (count) => {
  return `CUST-${String(count + 1).padStart(6, '0')}`;
};
