/**
 * 
 * @param {Date} date 
 * @returns {string} formatted date
 */
export default function formatDate(date) {
  // Get the month, day, and year from the date object
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  // Construct the formatted date string
  const formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString()}`;

  // Return the formatted date string
  return formattedDate;
};