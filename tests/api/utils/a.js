
console.log(
    new Date().toLocaleString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric',}).replace(',', '')

);


// const currentDate = new Date();
// const formattedDateTime = currentDate.toLocaleString('en-US', {
//   year: 'numeric',
//   month: '2-digit',
//   day: '2-digit',
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit'
// });

// console.log(formattedDateTime);
