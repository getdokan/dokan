export function decodedValue(colors: string) {
    colors.split('-')
    let arr = (colors.split("-")).slice(0, 2)
    type str = { [key: string]: number }
    let chars: str = { 'brown': 1, 'green': 2, 'T': 'A', 'A': 'U' }
    let numarr = arr.map(b => chars[b])
    return numarr.reduce((a, b) => a + b, 0)

}
