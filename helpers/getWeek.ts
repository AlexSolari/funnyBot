export default function getCurrentWeek() {
    const today = Temporal.Now.plainDateISO();
    const firstDay = today.subtract({ days: today.dayOfWeek - 1 });
    const lastDay = firstDay.add({ days: today.daysInWeek - 1 });

    return { firstDay: firstDay.toString(), lastDay: lastDay.toString() };
}
