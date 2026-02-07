const { translate } = require('@vitalets/google-translate-api');

async function test() {
    try {
        console.log('Testing empty string...');
        const res = await translate('', { to: 'hi' });
        console.log('Result:', res.text);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
