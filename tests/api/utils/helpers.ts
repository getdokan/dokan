
export const helpers = {
    // current year
    currentYear: new Date().getFullYear(),

    // random array element
    randomItem: (array: string | any[]) => array[Math.floor(Math.random() * array.length)],

}
