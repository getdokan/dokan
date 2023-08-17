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
// let str = '$15,10,089'; //todo: will fail for all comma
// const a = str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '');
// // const b = parseFloat(str.replace(/[^\d\-.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
// console.log(a);


let c = Number('99,999.99').toLocaleString('es-ES', );

console.log(c);