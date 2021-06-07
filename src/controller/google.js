const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';


function create() {
    function insertRow(spreadsheetId, range, data) {
        fs.readFile('credentials.json', (err, cred) => {
            if (err) return console.log('Error loading client secret file:', err);
            const credentials = JSON.parse(cred)
            const client_secret = credentials.installed.client_secret;
            const client_id = credentials.installed.client_id;
            const redirect_uris = credentials.installed.redirect_uris;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getNewToken(oAuth2Client);
                oAuth2Client.setCredentials(JSON.parse(token));
                writeSheet(oAuth2Client, data, spreadsheetId, range)
            });
        });
    }

    async function writeSheet(auth, data, spreadsheetId, range) {
        const sheet = google.sheets({ version: 'v4', auth });
        let resource = {
            values: data,
        };
        sheet.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            console.log("inserido resposta: " + res)
        });
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     */
    function getNewToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            return oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error while trying to retrieve access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                return oAuth2Client
            });
        });
    }
    /**
    * Prints the names and majors of students in a sample spreadsheet:
    * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
    */
    function listTest(auth) {
        const sheet = google.sheets({ version: 'v4', auth });
        sheet.spreadsheets.values.get({
            spreadsheetId: '1gO7x5YiPhji1RkD_uO4utA38st_T01fO23EzILGU4BE',
            range: 'pag1!A2:G',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                console.log('');
                rows.map((row) => {
                    console.log(`${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${row[4]} | ${row[5]} | ${row[6]}`);
                });
            } else {
                console.log('No data found.');
            }
        });
    }
    return {
        insertRow
    }
}
module.exports = create()