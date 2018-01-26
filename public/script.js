const button = document.querySelector('#ajax-button');
const csrfInput = document.querySelector('#csrf-token');
const csrfToken = csrfInput.value;

button.addEventListener('click', function(e) {
    // do some ajax magic
    POST('/test-token');
});

document.querySelector('#session-button')
    .addEventListener('click', () => GET('/session-data'));

function GET(url) { doAjax('GET', url); }
function POST(url, payload) {
    const body = {
        payload,
        _csrf: csrfToken,
    };

    doAjax('POST', url, body);
}

function doAjax(method, url, bodyContent) {
    const body = bodyContent
        ? JSON.stringify(bodyContent)
        : undefined;

    fetch(url, {
        method,
        body,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Bad response');
            }
            return res;
        })
        .then(res => res.json())
        .then(data => {
            console.log('finished', data);
        })
        .catch(err => {
            console.log('ERROR: ', err);
        });
}

