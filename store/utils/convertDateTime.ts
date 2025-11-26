export const ConvertDateTime = (date: string) => {
    const dateObj = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    if (dateObj.includes('Invalid Date')) {
      return '';
    }
    let [month, day, year] = dateObj.split(', ')[0].split('/');
    let [hours, minutes, seconds] = dateObj.split(' ')[1].split(':');
    if (month.length === 1) {
      month = '0' + month;
    }
    if (day.length === 1) {
      day = '0' + day;
    }
    if (hours.length === 1) {
      hours = '0' + hours;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }
    if (seconds.length === 1) {
      seconds = '0' + seconds;
    }
    if (dateObj.split(' ')[2] === 'PM' && hours !== '12') {
      hours = (12 + Number(hours)).toString();
    } else if (dateObj.split(' ')[2] === 'AM' && hours === '12') {
      hours = '00';
    }
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }