const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (userId, action, module, referenceId = null, description = '', ipAddress = null) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      module,
      reference_id: referenceId,
      description,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};
