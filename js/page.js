'use strict';

function checkPassword(entry) {
    function append(text) {
        document.querySelector('#results').textContent += `\n${text}`;
    }

    function successCallback(result) {
        switch (result.status) {
            case 200: append(`${entry.title} -> PAWNED !`); break;
            case 404: append(`${entry.title} -> OK`); break;
            default: apprend(`API ERROR: ${entry.title} -> ERROR: [${result.statusText}]`); break;
        }
    }
    function failedCallback(result) {
        append(`BROKEN NET: ${entry.title} -> ${JSON.stringify(result)}`);
    }
    fetch(`https://haveibeenpwned.com/api/v2/pwnedpassword/${entry.hash}`).then(successCallback, failedCallback);
}

document.querySelector('#loadFile').addEventListener('click', (event) => {
    document.querySelector('#results').textContent = "";
    let SHA1 = new Hashes.SHA1;
    let file = document.querySelector('#fileLocation').files[0];
    let password = document.querySelector('#filePassword').value;
    let fileReader = new FileReader();
    fileReader.onload = event => {
        let credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
        kdbxweb.Kdbx.load(fileReader.result, credentials).then(database => {
           let entries = [];
           database.getDefaultGroup().forEach((entry, group) => {
               if (entry && entry.fields.Password) {
                   entries.push({title: entry.fields.Title, hash: SHA1.hex(entry.fields.Password.getText())});
                   if (SHA1.hex(entry.fields.Password.getText()) == null) {
                       console.log(entry);
                   }
               }
           });
           entries.sort((a, b) => a.title.localeCompare(b.title));
           let itemIndex = 0;
           let id = setInterval(() => {checkPassword(entries[itemIndex]); itemIndex++; if (itemIndex >= entries.length) {clearInterval(id)}}, 2000);
        }).catch(error => {document.querySelector('#results').textContent = `ERROR: ${JSON.stringify(error)}`});
    }
    fileReader.readAsArrayBuffer(file);
});