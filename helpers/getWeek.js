const moment = require("moment");

/**
 * 
 * @returns {{firstDay: String, lastDay: String}} first and last date of current week
 */
function getCurrentWeek() {
  const currentDate = moment();

  const firstDay = currentDate.clone().startOf('isoWeek').format("YYYY-MM-DD");
  const lastDay = currentDate.clone().endOf('isoWeek').format("YYYY-MM-DD");

  return { firstDay, lastDay };
}

module.exports = getCurrentWeek;  