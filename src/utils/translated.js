export async function translated(text, language) {
    const response = await fetch('https://deep-translate1.p.rapidapi.com/language/translate/v2', {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '97957002b7msh4a34d23e653a1d2p17ff44jsn229fdd224fad',
            'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            q: text,
            source: 'nl',
            target: language
        })
    })

    const data = await response.json();

    return data

}