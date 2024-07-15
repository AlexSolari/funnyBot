import moment from "moment";

/**
 * 
 * @returns {{firstDay: String, lastDay: String}} first and last date of current week
 */
export default function getCurrentWeek() {
  const firstDay = moment().startOf('isoWeek').format("YYYY-MM-DD");
  const lastDay = moment().endOf('isoWeek').format("YYYY-MM-DD");

  return { firstDay, lastDay };
}