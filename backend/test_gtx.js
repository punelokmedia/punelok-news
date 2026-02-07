const { translate } = require('@vitalets/google-translate-api');

async function test() {
    try {
        console.log('Testing with client: gtx');
        const res = await translate('Hello world', { to: 'mr', client: 'gtx' });
        console.log('Result:', res.text);
    } catch (err) {
        console.error('Error with gtx:', err.message);
    }
}

test();
