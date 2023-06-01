const moment = require("moment");

function getCurrentWeek() {
  const currentDate = moment();

  const firstDay = currentDate.clone().startOf('isoWeek').format("YYYY-MM-DD");
  const lastDay = currentDate.clone().endOf('isoWeek').format("YYYY-MM-DD");

  return {firstDay, lastDay};
}
  
module.exports = getCurrentWeek;  