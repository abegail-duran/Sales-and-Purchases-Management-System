export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStockStatus = (product) => {
  if (product.current_stock === 0) {
    return { label: 'Out of Stock', color: 'danger' };
  } else if (product.current_stock <= product.minimum_stock) {
    return { label: 'Low Stock', color: 'warning' };
  } else {
    return { label: 'In Stock', color: 'success' };
  }
};

export const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) return null;
  
  const expDate = new Date(expirationDate);
  const now = new Date();
  const daysUntilExpiration = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiration < 0) {
    return { label: 'Expired', color: 'danger' };
  } else if (daysUntilExpiration <= 7) {
    return { label: 'Expiring Soon', color: 'danger' };
  } else if (daysUntilExpiration <= 30) {
    return { label: 'Expiring Soon', color: 'warning' };
  } else {
    return { label: 'Safe', color: 'success' };
  }
};
