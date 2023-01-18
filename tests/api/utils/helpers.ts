
export const helpers = {
    // current year
    currentYear: new Date().getFullYear(),

    // random array element
    randomItem: (array: string | any[]) => array[Math.floor(Math.random() * array.length)],

    // check if object is empty
    isEmpty: (obj: object) => Object.keys(obj).length === 0


}
