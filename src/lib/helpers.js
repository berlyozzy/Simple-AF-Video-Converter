export const GetElapsedTime = (time) => {

    const date = new Date(Date.UTC(0,0,0,0,0,0,time));
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();

    return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}.${ms.toString().charAt(0)}`
}

export const GetTimestamp = () => {
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();

    return `${day} ${month} ${year}  ${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}.${ms.toString().charAt(0)}`

}

export const CheckFileNameFormat = (string) => {
    const pattern = /^( )?\w+( |  )?$/ 
    return pattern.test(string)
}

export const CheckPresetNameFormat = (string) => {
    const pattern = /^( )?[a-zA-Z0-9-_]( |  )?$/ 
    return pattern.test(string)
}

export const CheckPresetValues = (string) => {
    // const pattern = /-([:a-zA-Z0-9 ]+)/
    const pattern = /([a-zA-Z0-9-:=]+)/
    return pattern.test(string)
}

export const CheckExtensionFormat = (string) => {
    const pattern = /( )?([a-zA-Z0-9]+)( )?/
    return pattern.test(string)
}