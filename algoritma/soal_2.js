const sentence = "Saya sangat senang mengerjakan soal algoritma"

console.log(longest(sentence))
function longest(text) {
    var arrText = text.split(" ")
    var result = ""
    for (let index = 0; index < arrText.length; index++) {
        if (arrText[index].length > result.length) {
            result = arrText[index]
        }

    }
    return `${result} : ${result.length} character`
}