'use strict';

function checkPassword(entry) {
    function append(text) {
        document.querySelector('#results').textContent += `\n${text}`;
    }

    async function successCallback(result) {
            if (result.ok) {
                const hashes = await result.text();
                const expression = new RegExp(`^${entry.hash.substr(5).toUpperCase()}:`, 'm');
                if (expression.test(hashes)) {
                    append(`HACKED: ${entry.title} -> ${JSON.stringify(result)}`);
                } else {
                    append(`OK: ${entry.title} -> ${JSON.stringify(result)}`);
                }
            } else {
                append('DEAD CALL');
            }
    }
    function failedCallback(result) {
        append(`BROKEN NET: ${entry.title} -> ${JSON.stringify(result)}`);
    }
    fetch(`https://api.pwnedpasswords.com/range/${entry.hash.substr(0, 5)}`, {mode: 'cors'}).then(successCallback, failedCallback);
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
           let itemIndex = 0;
           for (let entry of entries) {
               checkPassword(entry);
           }
        }).catch(error => {document.querySelector('#results').textContent = `ERROR: ${JSON.stringify(error)}`});
    }
    fileReader.readAsArrayBuffer(file);
});