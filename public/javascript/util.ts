export function numberFormat(numberToFormat: number): string  {
    return numberToFormat.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}