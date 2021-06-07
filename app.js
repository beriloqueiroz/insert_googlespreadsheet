const google = require('./src/controller/google')


async function insert(infos, spreadsheetId, range) {
    const hoje = new Date()
    const data = infos.map(elem => [hoje, elem.description, elem.type, parseFloat(elem.value)])
    google.insertRow(spreadsheetId, range, data);
}

const infos = [
    {
        description: "teste1",
        type: "teste1",
        value: 15245
    },
    {
        description: "teste2",
        type: "teste2",
        value: 155.0
    },
    {
        description: "teste3",
        type: "teste3",
        value: 145
    }];

insert(infos, '13215a4sd6as5d1as-lXclMLc', 'db!A:C')