function getCurrentWeek() {
    const curr = new Date; // get current date
    const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    const last = first + 7; // last day is the first day + 7
    
    const firstDayOfWeek = new Date(curr.setDate(first));
    const lastDayOfWeek = new Date(curr.setDate(last));
  
    // Format the dates as strings (YYYY-MM-DD)
    const firstDay = firstDayOfWeek.toISOString().split('T')[0];
    const lastDay = lastDayOfWeek.toISOString().split('T')[0];
  
    // Return an object with the first and last day of the week
    return {
      firstDay,
      lastDay
    };
  }
  
  module.exports = getCurrentWeek;  