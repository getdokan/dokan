// require('dotenv').config();
// // import { get } from 'http'; // or 'https' for https:// URLs
// // import { createWriteStream } from 'fs';

// // const file = createWriteStream('file.jpg');
// // const request = get('http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg', function(response) {
// // 	response.pipe(file);

// // 	// after download completed close filestreams
// // 	file.on('finish', () => {
// // 		file.close();
// // 		console.log('Download Completed');
// // 	});
// // });

// let str = '$15.100.00,89';
// let str = '$15,10,089';
// const a = str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '');
// // const b = parseFloat(str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
// console.log(a);


// let c = Number(99999.99).toLocaleString('es-ES' );
// let c = Number(99999.99).toLocaleString('es-US' );

// console.log(c);


// const currency = require('currency.js');


// console.log(currency('999.999,99'));

// let s3 = '$$-100,0                   0';
// // let s3 = '999,999,999.99';
// // let s4 = '999.999.999,99';

// const a = parseFloat(s3.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
// // const b = s4.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '');
// // // // const b = parseFloat(str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
// console.log(a);
// // console.log(b);


// console.log(s3.replace(/[^\d\-.,\\s]/g, ''));

// let a = 'Earth is estimated to be 4.6 billion years old.';
// let b = `Earth is estimated to be ${''} billion years old.`;

// if (a == b ) {
// 	console.log('xxx');
// } else {
// 	console.log('xxx');
// }

console.log(new Date('2023-06-02').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }));