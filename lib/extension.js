import inquirer from "inquirer";
/**
 * Prompt the question (or text and question) and wait for the user input
 * Require async and await for this function
 * @param {Object} question An object of question to prompt to the user 
 * @param {String} txt Text to print to console before prompting question
 * @returns the user answer (string, number,...)
 */
export function getResult(question, txt) {
    console.clear;
    if(txt) console.log(txt);
    if(typeof question == "object") {
        if(!question.name) question.name = "name"
    }
    if(!question.message.endsWith(": ")) question.message += ": "
    return new Promise((resolve) => {
        inquirer
            .prompt([question])
            .then((res) => {
            resolve(res.answer);
        });
    });
};