import moment from 'moment';

export default function getCurrentWeek() {
    const firstDay = moment().startOf('isoWeek').format('YYYY-MM-DD');
    const lastDay = moment().endOf('isoWeek').format('YYYY-MM-DD');

    return { firstDay, lastDay };
}
