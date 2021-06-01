/* eslint-disable no-useless-escape */
const fetch = require('node-fetch');
const fs = require('fs');

if (!process.argv.includes('b')) {
    fetch('https://krunker.io/viewer.html', {
    'headers': {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Safari/537.36',
    },
    'referrerPolicy': 'strict-origin-when-cross-origin',
    'body': null,
    'method': 'GET',
    'mode': 'cors',
})
    .then(async res => {
        console.info('Got Krunker Data...');
        const text = await res.text();
        const index = text.indexOf('iîíîiîï[\'exports\'][\'skins\']=[{');
        const newT = text.substring(index + 28);
        const indexE = newT.indexOf('}]');
        let string = 'module.exports = ' + newT.substring(0, indexE + 2);
        /*
        const limI = text.indexOf('iîìiíiï[\'exports\'][\'skins\']=[{');
        console.log(limI);
        const limT = text.substring(limI + 100);
        const limE = limT.indexOf('],iiìîiïi[\'exports\'][\'limited\']=');
        const endIndex = limT.indexOf('];');
        */

        const limString = 'module.exports.limited=[]';
        string += '\n' + limString + ';\n';
        string = '/* eslint-disable max-statements-per-line */\n/* eslint-disable no-dupe-keys */\n' + string;
        string = string.replaceAll('},{', '},\n{');
        await require('fs').writeFileSync('./src/skins.js', string);
        console.log('Parsed and written to file...\nRunning Eslint now..');
        eslint();
    });
}

const eslint = () => {
    require('child_process').exec('./node_modules/.bin/eslint --fix src/skins.js', (err, stdOut, stdErr) => {
        if (err) console.error(err);
        if (stdOut) console.log(stdOut);
        if (stdErr) console.error(err);
        console.log('Check data/scripts.js and delete data/skins_old.js!');
    });
};

if (process.argv.includes('a')) {
    fetch('https://social.krunker.io/hub-config', {
    'headers': {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Safari/537.36',
    },
    'referrerPolicy': 'strict-origin-when-cross-origin',
    'body': null,
    'method': 'GET',
    'mode': 'cors',
    })
    .then(async res => {
        let text = await res.text();
        text = text.replaceAll('},', '},\n');
        fs.writeFileSync('./src/socialHub.json', text)
    })
}
