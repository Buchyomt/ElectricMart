const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  lowStockAlerts: { type: Boolean, default: true },
  orderNotifications: { type: Boolean, default: true },
  autoApproveContractors: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
