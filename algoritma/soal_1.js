var text = "NEGIE1"

console.log(reverseString(text))

function reverseString(txt) {
    var newText = "";
    for (let index = txt.length - 1; index >= 0; index--) {
        newText += txt[index]
    }
    return newText
}