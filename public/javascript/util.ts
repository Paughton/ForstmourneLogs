export function numberFormat(numberToFormat: number): string  {
    return numberToFormat.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


export function durationFormat(durationInMilliseconds: number): string {
    let seconds: number = Math.floor(durationInMilliseconds / 1000);
    let minutes: number = Math.floor(seconds / 60);

    let secondsAsString: string = (seconds - (minutes * 60)).toString();
    if (Number(secondsAsString) < 10) secondsAsString = "0" + secondsAsString;

    return `${minutes}:${secondsAsString}`;
}